-- Clone of aituber.app's core features: schema v1
-- Postgres on Supabase. Row level security policies follow the tables.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Users (profile row alongside Supabase's auth.users; id is shared)
-- ---------------------------------------------------------------------------
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in
    ('Creator','Pro','Studio','Agency','Business','Scale','Enterprise')),
  price_cents integer not null,
  currency text not null default 'usd',
  credits_per_month integer not null,
  autopilot_channel_limit integer not null default 0,
  team_seats integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan_id uuid references plans (id) on delete set null,
  credits_remaining integer not null default 0 check (credits_remaining >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Videos and scenes (created before subscriptions/credit_ledger below,
-- since credit_ledger.video_id references videos)
-- ---------------------------------------------------------------------------
create table videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  template_type text not null check (template_type in
    ('faceless','long_form','avatar','music_video','skeleton','character','clip')),
  status text not null default 'draft' check (status in
    ('draft','generating','ready','published','failed')),
  title text,
  idea_prompt text,
  voice_id text,
  language_code text not null default 'en',
  style text,
  duration_seconds integer,
  resolution text not null default '1080x1920',
  source_photo_url text,   -- avatar / UGC mode
  source_track_url text,   -- music video mode
  final_video_url text,
  watermark boolean not null default true, -- decided server-side at render time from the plan, never client-set
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on videos (user_id, created_at desc);

create table scenes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos (id) on delete cascade,
  order_index integer not null,
  script_text text,
  visual_prompt text,
  visual_asset_url text,
  voice_clip_url text,
  caption_track jsonb not null default '[]', -- [{start, end, text}, ...]
  duration_seconds numeric,
  status text not null default 'pending' check (status in
    ('pending','generating','ready','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (video_id, order_index)
);
create index on scenes (video_id);

-- ---------------------------------------------------------------------------
-- Billing: plans a user can subscribe to, their Stripe subscription, and
-- the append-only credit ledger (never updated, only inserted alongside
-- a users.credits_remaining change).
-- ---------------------------------------------------------------------------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  plan_id uuid not null references plans (id) on delete restrict,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null check (status in
    ('trialing','active','past_due','canceled')),
  current_period_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on subscriptions (user_id);

create table credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in
    ('plan_grant','video_generated','refund','manual_adjustment')),
  balance_after integer not null,
  video_id uuid references videos (id) on delete set null,
  created_at timestamptz not null default now()
);
create index on credit_ledger (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- BYO AI provider keys (the clone's differentiator vs. vendor lock-in)
-- ---------------------------------------------------------------------------
create table provider_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  provider_type text not null check (provider_type in ('llm','tts','image','video')),
  provider_name text not null,
  encrypted_key text not null, -- app-layer encrypted; never returned decrypted to a client
  label text,
  created_at timestamptz not null default now(),
  unique (user_id, provider_type, provider_name)
);
create index on provider_keys (user_id);

-- ---------------------------------------------------------------------------
-- Channels (social connections) and publishing
-- ---------------------------------------------------------------------------
create table channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  platform text not null check (platform in
    ('youtube','tiktok','instagram','facebook','threads','x')),
  external_account_id text not null,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  autopilot_enabled boolean not null default false,
  niche text,
  posting_frequency text, -- e.g. 'daily@07:00' in the owner's own timezone
  timezone text not null default 'UTC',
  status text not null default 'connected' check (status in
    ('connected','expired','error','disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, external_account_id)
);
create index on channels (user_id);

create table publications (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos (id) on delete set null,
  channel_id uuid not null references channels (id) on delete cascade,
  status text not null default 'queued' check (status in
    ('queued','publishing','published','failed')),
  platform_post_id text,
  published_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (channel_id, platform_post_id)
);
create index on publications (video_id);
create index on publications (channel_id);

create table autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels (id) on delete cascade,
  video_id uuid references videos (id) on delete set null,
  status text not null default 'idea_picked' check (status in
    ('idea_picked','generating','published','failed')),
  run_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (channel_id, run_at) -- guards against a retried cron firing twice into the same slot
);
create index on autopilot_runs (channel_id, run_at desc);

-- ---------------------------------------------------------------------------
-- Webhook idempotency
-- ---------------------------------------------------------------------------
create table processed_webhook_events (
  source text not null check (source in ('stripe','youtube','meta')),
  event_id text not null,
  processed_at timestamptz not null default now(),
  primary key (source, event_id)
);

-- ---------------------------------------------------------------------------
-- Credit spend: row-locked so two concurrent generations can't both
-- succeed against a balance that only covers one of them.
-- ---------------------------------------------------------------------------
create or replace function spend_credits(
  p_user_id uuid, p_amount int, p_reason text, p_video_id uuid default null
) returns void language plpgsql as $$
declare v_balance int;
begin
  select credits_remaining into v_balance from users where id = p_user_id for update;
  if v_balance is null then
    raise exception 'user_not_found';
  end if;
  if v_balance < p_amount then
    raise exception 'insufficient_credits';
  end if;
  update users set credits_remaining = credits_remaining - p_amount, updated_at = now()
    where id = p_user_id;
  insert into credit_ledger (user_id, delta, reason, balance_after, video_id)
    values (p_user_id, -p_amount, p_reason, v_balance - p_amount, p_video_id);
end;
$$;

create or replace function grant_credits(
  p_user_id uuid, p_amount int, p_reason text default 'plan_grant'
) returns void language plpgsql as $$
declare v_balance int;
begin
  update users set credits_remaining = credits_remaining + p_amount, updated_at = now()
    where id = p_user_id
    returning credits_remaining into v_balance;
  insert into credit_ledger (user_id, delta, reason, balance_after)
    values (p_user_id, p_amount, p_reason, v_balance);
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security: every user-owned table, scoped to auth.uid().
-- Background jobs run as the Supabase service role, which bypasses RLS,
-- and must re-check ownership in application code before writing.
-- ---------------------------------------------------------------------------
alter table users enable row level security;
create policy users_self on users for select using (id = auth.uid());
create policy users_self_update on users for update using (id = auth.uid());

alter table subscriptions enable row level security;
create policy subscriptions_owner on subscriptions for select using (user_id = auth.uid());

alter table credit_ledger enable row level security;
create policy credit_ledger_owner on credit_ledger for select using (user_id = auth.uid());

alter table provider_keys enable row level security;
create policy provider_keys_owner on provider_keys for all using (user_id = auth.uid());

alter table videos enable row level security;
create policy videos_owner on videos for all using (user_id = auth.uid());

alter table scenes enable row level security;
create policy scenes_owner on scenes for all using (
  video_id in (select id from videos where user_id = auth.uid())
);

alter table channels enable row level security;
create policy channels_owner on channels for all using (user_id = auth.uid());

alter table publications enable row level security;
create policy publications_owner on publications for select using (
  channel_id in (select id from channels where user_id = auth.uid())
);

alter table autopilot_runs enable row level security;
create policy autopilot_runs_owner on autopilot_runs for select using (
  channel_id in (select id from channels where user_id = auth.uid())
);

-- plans is public reference data: no RLS, readable by anyone (anon included).
