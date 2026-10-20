-- NETZ: cloud copy of notes (NETZ_LAUNCH_PLAN.md 4.4). Matches src/db/schema.js `notes`.
-- The device stays the main copy; each note keeps the version (changed_at, ms) it was last changed at,
-- and the newer version wins. Deleted notes stay as tombstones so other devices learn about them.
-- Row-level security on with no policies: only the server's own connection reads and writes.

create table if not exists public.notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  changed_at bigint not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists notes_user_server_updated on public.notes (user_id, server_updated_at);

alter table public.notes enable row level security;
