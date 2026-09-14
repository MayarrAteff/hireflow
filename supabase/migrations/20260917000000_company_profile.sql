-- ─── Company profile: logos ───────────────────────────────────────────────
-- Company logos live in a public bucket, one folder per company. The company columns (logo_url, size, about)
-- already exist; recruiters edit them through the existing "own recruiter or admin updates" policy.
-- Nothing here changes or removes existing rows. One transaction and safe to re-run.

begin;

-- ─── Storage: company logos (public bucket, folder per company) ───────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-logos', 'company-logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict do nothing;

drop policy if exists "company-logos: anyone reads" on storage.objects;
drop policy if exists "company-logos: company recruiters upload" on storage.objects;
drop policy if exists "company-logos: company recruiters update" on storage.objects;
drop policy if exists "company-logos: company recruiters delete" on storage.objects;

-- Upserting a file needs select as well as insert/update.
create policy "company-logos: anyone reads" on storage.objects for select using (bucket_id = 'company-logos');
create policy "company-logos: company recruiters upload" on storage.objects for insert
  with check (bucket_id = 'company-logos' and (storage.foldername(name))[1] = public.auth_company_id()::text);
create policy "company-logos: company recruiters update" on storage.objects for update
  using (bucket_id = 'company-logos' and (storage.foldername(name))[1] = public.auth_company_id()::text);
create policy "company-logos: company recruiters delete" on storage.objects for delete
  using (bucket_id = 'company-logos' and (storage.foldername(name))[1] = public.auth_company_id()::text);

-- An earlier draft let candidates read recruiter profiles; drop it if that version was ever applied.
drop policy if exists "profiles: candidates read recruiters of companies they applied to" on public.profiles;

commit;
