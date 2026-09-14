-- Candidate profile: professional details, links and profile photos.

-- ─── Profile columns ──────────────────────────────────────────────────────
alter table public.profiles
  add column location text,
  add column skills text[] not null default '{}',
  add column years_of_experience smallint check (years_of_experience between 0 and 60),
  add column linkedin_url text,
  add column portfolio_url text,
  add column github_url text;

-- ─── Storage: profile photos (public bucket, folder per user) ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict do nothing;

-- Upserting a file needs select as well as insert/update.
create policy "avatars: anyone reads" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: owner uploads" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner updates" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner deletes" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Storage: let candidates remove their own CVs ─────────────────────────
create policy "cvs: owner deletes" on storage.objects for delete
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
