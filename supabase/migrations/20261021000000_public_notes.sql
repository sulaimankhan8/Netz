-- NETZ: notes published to the web at /p/<slug> (NETZ_LAUNCH_PLAN.md 4.4). Matches src/db/schema.js.
-- A published note is a snapshot: later edits stay private until the author updates the public copy.
-- Row-level security on with no policies: pages and routes read it through the server connection only.

create table if not exists public.public_notes (
  slug text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  note_id text not null,
  title text not null default '',
  data jsonb not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  views integer not null default 0
);
create unique index if not exists public_notes_user_note on public.public_notes (user_id, note_id);

alter table public.public_notes enable row level security;
