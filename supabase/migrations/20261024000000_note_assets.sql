-- NETZ: the Notes Studio Assets library in the cloud (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 2b).
-- Matches src/db/schema.js `noteAssets`. Run once in Supabase → SQL editor (safe to run again).
--
-- Each asset is two files in the private Storage bucket `note-assets`:
--   <user id>/<asset id>/main.<ext>      the board (gzipped JSON), picture or document
--   <user id>/<asset id>/preview.webp    a small preview picture
-- The browser uploads them straight to Storage (Vercel API routes take at most ~4.5 MB a request).
-- The server reserves a row first (checking the student's storage limit); Storage only accepts
-- files into a folder that has a reserved row, and only in the student's own folder.

create table if not exists public.note_assets (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  kind text not null check (kind in ('board', 'image', 'file')),
  title text not null default '',
  mime text not null default '',
  ext text not null default '',
  bytes bigint not null default 0,
  page_count integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.note_assets enable row level security;

-- Students may see their own rows (the Storage rules below look them up); only the server writes.
drop policy if exists "note_assets: read own" on public.note_assets;
create policy "note_assets: read own" on public.note_assets
  for select to authenticated using (user_id = auth.uid());

-- The bucket: private, 25 MB per file at most
insert into storage.buckets (id, name, public, file_size_limit)
values ('note-assets', 'note-assets', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "note-assets: read own" on storage.objects;
create policy "note-assets: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'note-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "note-assets: add reserved" on storage.objects;
create policy "note-assets: add reserved" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'note-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.note_assets a
      where a.user_id = auth.uid() and a.id = (storage.foldername(name))[2]
    )
  );

drop policy if exists "note-assets: replace reserved" on storage.objects;
create policy "note-assets: replace reserved" on storage.objects
  for update to authenticated
  using (bucket_id = 'note-assets' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (
    bucket_id = 'note-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.note_assets a
      where a.user_id = auth.uid() and a.id = (storage.foldername(name))[2]
    )
  );

drop policy if exists "note-assets: delete own" on storage.objects;
create policy "note-assets: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'note-assets' and (storage.foldername(name))[1] = auth.uid()::text);
