# Architecture: (unnamed clone, pre-/replica-brand) — a rebuild of aituber.app's core features

Scope: all 7 templates + Autopilot + full tiered billing (XL, per recon).
Differentiators: no watermark on paid tiers, bring-your-own AI provider keys
instead of vendor lock-in, a sharper scene-editor UX.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | Next.js (App Router) + TypeScript | one codebase for marketing site + app, server actions fit the create→generate→export flow, matches recon's observed routing style |
| styling | Tailwind, tokens from `/replica-design` | component list from recon (template cards, voice/style pickers, scene cards) maps cleanly to a token system |
| database | Postgres on Supabase | native row level security for per-user data, built-in Realtime (needed for the live generation-progress UI), built-in Auth and Storage so fewer vendors overall |
| ORM | Drizzle | typed SQL close to the metal, easy to hand-write the credit-locking function below |
| auth | Supabase Auth (email + Google) | matches recon's observed "sign up with email or Google" |
| payments | Stripe Checkout + Billing | subscriptions for the 7 plan tiers; credits are tracked ourselves (see `credit_ledger`), not Stripe's metered billing, because a credit is spent synchronously at generation time, not on a billing-cycle report |
| email | Resend | plan receipts, low-credit warnings, autopilot token-expired alerts |
| jobs | Trigger.dev | the generation pipeline is a multi-step, retryable, long-running workflow (script → visuals → voice → captions → render); Trigger.dev gives per-step retry and is also used for Autopilot's per-channel schedules |
| video render | Remotion, rendered by a Trigger.dev job on a container (not a Vercel function — renders run past serverless time limits) | React-based scene composition fits the "regenerate any scene" model directly: a scene is a component, re-rendering one scene doesn't require re-rendering the rest |
| files | Cloudflare R2 | generated videos are large and downloaded repeatedly; R2's zero egress fee matters more here than in a typical SaaS app |
| hosting | Vercel (web) + Trigger.dev cloud (jobs/render workers) | — |
| mobile | none for v1 | no mobile app was observed in recon; add only if demand shows up |

Provider keys for the AI steps themselves (LLM, TTS, image/video generation)
are **not** a stack choice — they're a per-user, swappable setting. See
`provider_keys` below; the app ships with one default provider per step so
it works with no setup, and a BYO key overrides the default.

## Schema

Tables: 10. Access rules: Postgres row level security on every table, scoped
to `user_id = auth.uid()` (joined through `channel_id`/`video_id` where a
table doesn't carry `user_id` directly). Background jobs run under the
Supabase service role, which bypasses RLS by design — every job function
re-checks ownership itself before it touches a row.

See `replica/schema.sql` for the full, runnable migration. Highlights:

```sql
-- Credits are spent through a function, never a bare UPDATE, so two
-- concurrent generations can't both succeed past a balance of 1.
create or replace function spend_credits(p_user_id uuid, p_amount int, p_reason text, p_video_id uuid)
returns void language plpgsql as $$
declare v_balance int;
begin
  select credits_remaining into v_balance from users where id = p_user_id for update;
  if v_balance < p_amount then
    raise exception 'insufficient_credits';
  end if;
  update users set credits_remaining = credits_remaining - p_amount where id = p_user_id;
  insert into credit_ledger (user_id, delta, reason, balance_after, video_id)
    values (p_user_id, -p_amount, p_reason, v_balance - p_amount, p_video_id);
end; $$;

-- A video's scenes keep a stable order even as any one gets regenerated.
create unique index on scenes (video_id, order_index);

-- No two identical OAuth connections for the same user.
create unique index on channels (user_id, platform, external_account_id);

-- Autopilot can't double-fire into the same scheduled slot if the cron
-- job retries after a timeout.
create unique index on autopilot_runs (channel_id, run_at);
```

## API

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| POST /api/videos | create a draft video | owner | template_type, idea_prompt \| photo \| track, voice_id, style, language | video | F01-F03 |
| POST /api/videos/:id/generate | enqueue the generation pipeline | owner | — | status=generating | F01-F03 |
| GET /api/videos/:id | poll a video + its scenes | owner | — | video+scenes | all |
| realtime channel `video:{id}` | push progress ("writing script"...) | owner | — | progress events | F01 (home page's animated stepper) |
| POST /api/videos/:id/scenes/:sceneId/regenerate | regenerate one scene only | owner | optional new prompt | scene | S17 |
| POST /api/videos/:id/export | render the final composite | owner | resolution | signed download_url | S18 |
| DELETE /api/videos/:id | delete a video + its assets | owner | — | 204 | — |
| GET/POST/DELETE /api/provider-keys | list (masked) / add / remove a BYO AI key | owner | provider_type, provider_name, api_key | keys never echoed back raw | differentiator |
| GET /api/channels/connect/:platform | start OAuth | owner | — | redirect | S19/S22 |
| GET /api/channels/callback/:platform | OAuth callback, stores tokens | owner | code | redirect | S19/S22 |
| POST /api/channels/:id/autopilot | configure niche + cadence, turn autopilot on | owner | niche, posting_frequency | channel | S19 |
| POST /api/channels/:id/disconnect | revoke + remove a channel | owner | — | 204 | S22 |
| POST /api/videos/:id/publish | publish a ready video to chosen channels | owner | channel_ids[] | publication rows | S18 |
| POST /api/checkout | start a Stripe Checkout session | owner | plan_id, interval | checkout_url | S04 |
| GET /api/billing | current plan, credits, invoices | owner | — | billing summary | S21 |

Webhooks in: Stripe (`invoice.paid` grants the plan's monthly credits,
`customer.subscription.updated/deleted` syncs status), each platform's
publish-status callback where one exists (YouTube/Meta do; TikTok and X are
polled instead).
Webhooks out: none — the clone never exposes a public API that mirrors the
original's private endpoints; `/api/*` above is ours, consumed by our own
web app (and, later, the `could`-priority public API/MCP feature).

Jobs (Trigger.dev):
- `generate-video` — on demand, per video. Steps: write-script → generate
  scene visuals → generate voiceover → sync captions → (on export) composite
  render. Each step calls the user's BYO provider if set, else the default.
  A credit is spent only once the pipeline reaches `ready`, never on a
  failed step.
- `autopilot-cycle` — scheduled per channel at `posting_frequency`. Picks a
  topic, creates a video, runs `generate-video`, publishes, logs an
  `autopilot_runs` row (guarded by the unique index above).
- `token-refresh` — daily. Refreshes OAuth tokens nearing expiry; on
  failure, sets the channel to `expired`, turns off its autopilot, and
  emails the user.
- `credit-grant` — triggered by the Stripe `invoice.paid` webhook, not a
  cron, so credits land exactly on the user's own billing date.
- `cleanup` — daily. Deletes failed/stale draft videos and their orphaned
  Cloudflare R2 objects older than 7 days.

## The parts that bite

- **Time zones**: all timestamps stored `timestamptz` UTC; `posting_frequency`
  is evaluated in the channel owner's stored timezone, not the server's.
- **Idempotency**: Stripe events deduped by `stripe_event_id` (unique index
  on a small `processed_webhook_events` table); platform publish callbacks
  deduped by `publications.platform_post_id` (unique).
- **Races**: credit spends go through `spend_credits()` (row-locked) so two
  simultaneous generations can't both succeed on a balance of one credit's
  worth; scene regeneration takes a per-video advisory lock so two
  regenerate clicks on the same video don't interleave their writes.
- **Rate limits**: each BYO provider has its own; `generate-video` backs off
  and surfaces "provider rate-limited, retry in Ns" rather than failing the
  whole video, and never debits a credit for a failed step.
- **OAuth lifecycles differ per platform** (Google's long-lived refresh
  tokens vs. TikTok's and Meta's shorter ones) — handled per-platform in
  `token-refresh`, never assumed uniform.
- **Watermarking is server-side only**: decided by the user's *current*
  plan at render time inside the `generate-video` job, never a field the
  client can set on create — otherwise "no watermark" becomes a free trick
  instead of a paid differentiator.
- **Account deletion (GDPR)**: deleting a user cascades to videos, scenes,
  channels and provider_keys and their R2 objects, and revokes each
  platform's OAuth grant — not just a DB cascade.

## Build order

1. **Vertical slice** — faceless shorts only, one default provider per AI
   step, no BYO keys yet, no billing yet (unlimited credits for now).
   Tables: `users`, `videos`, `scenes`. Routes: `POST /api/videos`,
   `POST /api/videos/:id/generate`, `GET /api/videos/:id`,
   `POST /api/videos/:id/export`. Screens: S09 (simplified), S10, S17, S18.
   Proves script → visuals → voice → captions → Remotion render end to end.
2. **Must-haves** (`features.csv`, priority=must): `provider_keys` (BYO AI
   keys), scene regenerate, background music, plans/`credit_ledger`/Stripe
   checkout + webhook, credit enforcement via `spend_credits()`.
   Tables added: `plans`, `subscriptions`, `credit_ledger`, `provider_keys`.
3. **Should-haves**: style picker, a handful of languages (not 140+ yet),
   avatar/UGC mode (S12, photo upload + a consent checkbox gate), music-video
   mode (S13), long-form mode (S11), one-click publish to a single platform
   first (start with YouTube, the best-documented API) via `channels` +
   `publications`.
4. **Could-haves**: Autopilot (`autopilot_runs`, `token-refresh`,
   `autopilot-cycle`, the remaining 5 platforms), idea/topic finder, team
   seats, public API/MCP access. Build last — Autopilot is recon's
   riskiest part (unattended, six OAuth lifecycles, runs while no one is
   watching).
5. **Fixes from `/replica-entrepreneur`**: not yet run. Run it against
   AITuber's public reviews (and comparable tools) before locking the v1
   feature list further — it may reprioritize steps 2-4 above.

Next: `/replica-design`.
