-- NETZ: accounts and progress (NETZ_LAUNCH_PLAN.md 4.3). Matches src/db/schema.js.
-- Row-level security is on with NO policies: the browser (anon / publishable key) can neither read nor
-- write these tables. Only the server's own database connection (src/db) touches them.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  robot_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  details jsonb not null default '{}'::jsonb,
  local_day date not null,
  at timestamptz not null,
  received_at timestamptz not null default now()
);
create index if not exists activity_log_user_received on public.activity_log (user_id, received_at);

create table if not exists public.gem_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists gem_ledger_user_reason on public.gem_ledger (user_id, reason);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.activity_log enable row level security;
alter table public.gem_ledger enable row level security;
