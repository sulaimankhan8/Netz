-- NETZ: NETZ Pro bought through Razorpay (NETZ_LAUNCH_PLAN.md 5.2). Matches src/db/schema.js.
-- Only the Razorpay webhook (signature checked on the server) marks a purchase paid.
-- Row-level security on with no policies: only the server connection reads or writes these.

create table if not exists public.purchases (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly', 'lifetime')),
  currency text not null check (currency in ('INR', 'USD')),
  amount integer not null check (amount > 0),
  status text not null default 'created',
  paid_until timestamptz,
  cancel_at_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists purchases_user on public.purchases (user_id);

-- Kept when an account is deleted: payment records are needed for accounts and tax
create table if not exists public.payments (
  id text primary key,
  user_id uuid not null,
  purchase_id text not null,
  amount integer not null,
  currency text not null,
  method text not null default '',
  refunded integer not null default 0,
  paid_at timestamptz not null
);
create index if not exists payments_purchase on public.payments (purchase_id);

create table if not exists public.billing_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.purchases enable row level security;
alter table public.payments enable row level security;
alter table public.billing_events enable row level security;
