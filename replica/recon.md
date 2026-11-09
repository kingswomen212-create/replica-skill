# Recon map: AITuber.app (web)

Scope: the core creation loop (pick a template, AI generates a video,
review/regenerate, export or auto-publish) plus the Autopilot
scheduled-publishing loop and the credit-based billing model. Not cloning:
their specific AI model vendors, their licensed voice roster, or their brand.
For: a general-purpose faceless/AI-avatar video generator product of our own.
Date: 2026-11-09

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing home | https://aituber.app/ | positioning, template list, how-it-works animation, pricing cards, full nav |
| 2 | features page | https://aituber.app/features/ | voice grid, style grid, language list, feature callouts |
| 3 | how it works | https://aituber.app/how-it-works/ | 3-step flow, footer sitemap |
| 4 | pricing page | https://aituber.app/pricing/ | 7-tier plan table (Creator..Enterprise), credit model |
| 5 | FAQ | https://aituber.app/faq/ | question list (credits, autopilot, ownership, API) — answers collapsed, not read behind a click |
| 6 | tools / niche generators | https://aituber.app/tools/ | ~10+ SEO landing pages, each a thin wrapper over the same generator with a niche default |
| 7 | help center | https://help.aituber.app/ | not reached this session (separate subdomain, network not yet allowed) — re-run recon here for deeper settings detail |
| 8 | app itself | app.aituber.app/dashboard/* | **not entered** — needs the user's own account; only route names seen from nav links, not the screens |

No login was used. Everything below the marketing site is inferred from
route names and copy, not observed directly — flagged as such throughout.

## Core loop

Pick a template (faceless short, avatar/UGC ad, music video, long-form,
"skeleton" anatomy short, talking object, or a raw AI video clip), give it a
prompt/script/photo/track, AI writes the script and generates visuals,
voiceover and synced captions, you regenerate any scene you don't like, then
export in 4K or auto-publish to up to six social platforms — once, or forever
on a schedule via "Autopilot."

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Marketing home | `/` | pitch, template grid, pricing, FAQ, social proof | nav, hero CTA, template cards, pricing cards, testimonial carousel, FAQ accordion | filled only (public page) |
| S02 | Features | `/features/` | sell the voice/style/language breadth | voice grid, style chip grid, language flag grid | filled |
| S03 | How it works | `/how-it-works/` | 3-step explainer with a live progress animation | animated stepper (script → visuals → voice → captions → music → master) | filled, "in progress" (animated) |
| S04 | Pricing | `/pricing/` | plan picker + full comparison table | monthly/yearly toggle, 7 plan cards, comparison table | filled |
| S05 | FAQ | `/faq/` | pre-signup objection handling | accordion (9 questions) | collapsed/expanded (inferred) |
| S06 | Tools index | `/tools/` | SEO funnel: one landing page per niche/format | template card grid (true crime, TikTok, faceless, skeleton, anime, shorts, no-watermark, ...) | filled |
| S07 | Sign up | `app.aituber.app/sign-up` | account creation | email/Google form (inferred) | not observed (auth wall) |
| S08 | Sign in | `app.aituber.app/sign-in` | returning user auth | login form (inferred) | not observed |
| S09 | Dashboard / template picker | `app.aituber.app/dashboard` | landing spot after login, choose a template | template tiles (inferred from `/dashboard/{faceless,music-video,avatar,skeleton,characters,clips}` routes) | not observed, guess |
| S10 | Faceless short creator | `app.aituber.app/dashboard/faceless` | idea/script → generated short | idea input, scene list, voice picker, style picker | not observed, guess |
| S11 | Long-form creator | `app.aituber.app/dashboard/faceless?mode=long-form` | same engine, up to 20 min, multi-scene | same as S10 plus chapter/scene outline | not observed, guess |
| S12 | Avatar / UGC ad creator | `app.aituber.app/dashboard/avatar` | photo + script → talking-head ad | photo upload, lip-sync preview | not observed, guess |
| S13 | Music video creator | `app.aituber.app/dashboard/music-video` | track → beat-synced visuals | track upload or AI-generate-track, waveform/beat markers | not observed, guess |
| S14 | Skeleton video creator | `app.aituber.app/dashboard/skeleton` | "what happens if…" anatomy short | 3D skeleton style preset, same scene pipeline | not observed, guess |
| S15 | Talking object / character creator | `app.aituber.app/dashboard/characters` | mascot/product-demo videos | object/character picker, same scene pipeline | not observed, guess |
| S16 | AI video clip creator | `app.aituber.app/dashboard/clips` | text-to-video, image-to-video, first→last frame | mode switch, prompt box | not observed, guess |
| S17 | Scene editor / review | reached from any creator after first generate | per-scene regenerate, reorder, trim | scene card list, "regenerate" per scene, timeline scrubber | generating ("NOW" marker seen on home animation), ready, guess for others |
| S18 | Export / publish | reached from scene editor | download 4K or push to channels | platform checkboxes, "Publish Now" button | not observed, guess |
| S19 | Autopilot setup | `app.aituber.app/dashboard/autopilot?new=empty` | connect channels, set niche + cadence | channel-connect cards (6 platforms), niche input, frequency picker | not observed, guess |
| S20 | Autopilot dashboard | `app.aituber.app/dashboard/autopilot` | running autopilot's output + growth stats | per-channel follower delta, recent auto-posts | not observed, guess |
| S21 | Billing / credits | inferred, not linked from nav seen | plan, credits remaining, upgrade | credit meter, plan card, invoice list | not observed, guess |
| S22 | Channel connections (settings) | inferred | manage OAuth per platform | connect/disconnect buttons per platform | not observed, guess |

S07-S22 are **medium-to-low confidence**: inferred from route slugs, nav
labels and marketing copy only. Re-run `/replica-recon` against the user's
own account before `/replica-architect` locks the schema, if accuracy here
matters.

## Flows

```
F01 Create a faceless short
    S09 dashboard -> S10 faceless creator (enter idea) -> generating
    -> S17 scene editor (regenerate scenes you don't like) -> S18 export
    happy path clicks: ~4 (pick template, submit idea, accept/regenerate, publish)
    edge: credits run out mid-generation, voice/language mismatch,
          caption resync needed after a scene regenerate

F02 Avatar / UGC ad from a photo
    S09 -> S12 avatar creator (upload photo + script) -> generating
    -> S17 scene editor -> S18 export
    edge: face not detected in photo, likeness/consent gate, lip-sync drift

F03 Music video from a track
    S09 -> S13 music video creator (upload or AI-generate track) -> generating
    -> S17 scene editor -> S18 export
    edge: track exceeds plan's length cap, beat markers misaligned

F04 Turn on Autopilot
    S09 -> S19 autopilot setup (connect channels, pick niche, set cadence)
    -> S20 autopilot dashboard (unattended runs from here on)
    happy path clicks: ~3 (connect channels, set niche, confirm)
    edge: OAuth token expires and a scheduled post silently fails,
          posting frequency exceeds plan's channel-autopilot limit

F05 Buy or change a plan
    S04 pricing -> checkout (not observed) -> S21 billing
    edge: downgrade mid-cycle with unused credits, failed card, proration
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Nav bar | marketing / app (inferred) | default, scrolled | all pages |
| Template card | 7 main + 10+ niche variants on `/tools/` | default, hover | S01, S06, S09 |
| Voice picker | flag + name + one-word trait tag, 1300+ entries | default, selected, preview-playing (guess) | S02, S10-S16 |
| Style chip | cinematic, anime, realistic, 3D cartoon, cyberpunk, fantasy, noir, watercolor, comic book, flat explainer, +15 more | default, selected | S02, S10-S16 |
| Progress stepper | 3-step (pick template / AI makes it / publish) | step 1/2/3, live sub-status text while generating | S03, S10-S16 (guess) |
| Scene card | per generated scene | draft, generating, ready, regenerate-pending | S17 (guess) |
| Pricing card | 7 tiers, monthly/yearly | default, "most popular" highlight | S04 |
| Comparison table | feature x plan grid | — | S04 |
| Autopilot channel card | per platform (YouTube, TikTok, Instagram, Facebook, Threads, X) | disconnected, connected, error (guess) | S19, S20 |
| Credit meter | — | normal, low, empty (guess) | S21 (guess) |
| FAQ accordion | 9 Q&A | collapsed, expanded | S05 |
| Testimonial carousel | — | auto-advancing (guess) | S01 |
| Primary CTA button | "Start Creating Free" / "Get Started" / "Publish Now" | default, hover, loading (guess) | all |

## Inferred data model

```
User        id, email, plan_id, credits_remaining, created_at
            evidence: sign-up/sign-in links, "2-minute setup", credit copy on pricing
            confidence: high

Plan        id, name (Creator|Pro|Studio|Agency|Business|Scale|Enterprise),
            price_month, credits_month, autopilot_channel_limit, team_seats
            evidence: /pricing/ comparison table
            confidence: high

Video       id, user_id, template_type (faceless|long_form|avatar|music_video|
            skeleton|character|clip), status (draft|generating|ready|
            published|failed), duration_seconds, resolution, language_code,
            voice_id, style, created_at
            evidence: /dashboard/{template} routes, "Download in 4K", how-it-works steps
            confidence: medium

Scene       id, video_id, order, script_text, visual_prompt, voice_clip_url,
            caption_track, duration_seconds
            evidence: "Regenerate Any Scene" feature, how-it-works step detail
            confidence: medium

Voice       id, display_name, language_code, accent_flag, tone_tag, provider
            evidence: /features/ voice grid ("Powered by ElevenLabs")
            confidence: high (existence) / the roster itself is third-party, see Out of scope

Channel     id, user_id, platform, oauth_token_ref, autopilot_enabled,
            niche, posting_frequency
            evidence: autopilot section on home, "/dashboard/autopilot" route
            confidence: medium

CreditLedger id, user_id, delta, reason (plan_grant|video_generated|refund),
            balance_after, created_at
            evidence: "credits per month", "unused credits never expire"
            confidence: medium
```

Relationships: `User 1-n Video`, `Video 1-n Scene`, `User 1-n Channel`,
`User 1-n CreditLedger`, `Plan 1-n User` (current plan).

## Feature matrix

See `features.csv`. Must: 10, should: 6, could: 4, skip: 5.

## Out of scope (cannot or should not be cloned)

- **The specific licensed voice roster.** "1300+ AI voices... Powered by
  ElevenLabs" is a third-party licensed catalogue. Clone the *feature*
  (pick a voice, get TTS in 140+ languages) against your own TTS provider
  and your own key; never ship their voice names or claim their roster.
- **Whatever proprietary video/image model(s) sit behind generation.** Not
  visible from the marketing site and not reproducible from recon. The
  clone must pick its own image/video-gen vendor(s).
- **Their brand: the name "AITuber," logo, palette, copy.** Handled by
  `/replica-brand` before anything ships.
- **Their affiliate/partner network and existing creator community**
  (Discord, Reddit, affiliate program membership). That is their network,
  not a rebuildable feature.
- **The testimonials, follower-count demo numbers, and blog content shown
  on the marketing site.** Real or illustrative customer data that is not
  ours to reuse; `/replica-launch` writes fresh copy instead.

## Size

Screens: 22 (6 observed, 16 inferred). Flows: 5. Entities: 7.

Hard parts:
1. **The render pipeline** — compositing AI-generated voiceover, visuals,
   synced captions and background music into one finished video,
   per-scene-regenerable, across 7 templates.
2. **Orchestrating paid third-party AI APIs** (script LLM, TTS, image/video
   generation) behind a credit system that has to price 7 plan tiers
   without losing money on the expensive templates (long-form, music video).
3. **Autopilot**: OAuth + refresh-token lifecycle and native posting APIs
   for six platforms (YouTube, TikTok, Instagram, Facebook, Threads, X),
   each with different quirks, running unattended on a schedule.

Size: **XL** as scoped (7 templates + autopilot + 6-platform publishing +
7-tier billing). Recommend rescoping the first build to **M**: one template
(faceless shorts), manual export only, three plan tiers, no autopilot —
then widen with `/replica-build` iterations once that slice works end to end.
