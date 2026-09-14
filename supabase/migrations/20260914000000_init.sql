-- HireFlow initial schema: roles, companies, jobs, applications, interviews, notifications, feature flags.

-- ─── Enums ────────────────────────────────────────────────────────────────
create type public.user_role as enum ('recruiter', 'candidate', 'admin');
create type public.job_status as enum ('draft', 'published', 'closed');
create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'internship');
create type public.work_mode as enum ('onsite', 'remote', 'hybrid');
create type public.application_stage as enum ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');
create type public.interview_type as enum ('phone', 'video', 'onsite');

-- ─── Tables ───────────────────────────────────────────────────────────────
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  industry text,
  size text,
  about text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'candidate',
  full_name text not null default '',
  email text not null,
  phone text,
  avatar_url text,
  headline text,
  bio text,
  cv_path text,
  company_id uuid references public.companies (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  title text not null,
  description text not null,
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  location text,
  employment_type public.employment_type not null default 'full_time',
  work_mode public.work_mode not null default 'onsite',
  salary_min numeric,
  salary_max numeric,
  currency text not null default 'SAR',
  status public.job_status not null default 'draft',
  deadline date,
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  stage public.application_stage not null default 'applied',
  position integer not null default 0,
  cover_letter text,
  cv_path text,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30,
  type public.interview_type not null default 'video',
  location_or_link text,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text
);

create index on public.jobs (company_id);
create index on public.jobs (status);
create index on public.applications (job_id, stage, position);
create index on public.applications (candidate_id);
create index on public.notifications (user_id, read_at);

-- ─── Helpers ──────────────────────────────────────────────────────────────
create or replace function public.auth_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.auth_company_id() returns uuid
language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid()
$$;

-- Create a profile row whenever someone signs up. Role comes from sign-up metadata;
-- nobody can self-register as admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'candidate');
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when requested_role = 'recruiter' then 'recruiter'::public.user_role else 'candidate'::public.user_role end
  );
  return new;
end;
$$;

-- A recruiter without a company creates one and becomes linked to it.
create or replace function public.create_company(
  p_name text, p_website text default null, p_industry text default null, p_size text default null, p_about text default null
) returns public.companies
language plpgsql security definer set search_path = public as $$
declare
  new_company public.companies;
begin
  if public.auth_role() <> 'recruiter' then
    raise exception 'Only recruiters can create companies' using errcode = '42501';
  end if;
  if public.auth_company_id() is not null then
    raise exception 'You already belong to a company' using errcode = '23505';
  end if;

  insert into public.companies (name, website, industry, size, about)
  values (p_name, p_website, p_industry, p_size, p_about)
  returning * into new_company;

  update public.profiles set company_id = new_company.id where id = auth.uid();
  return new_company;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger applications_touch_updated_at
  before update on public.applications
  for each row execute function public.touch_updated_at();

-- Notify the candidate whenever their application moves to a new stage.
create or replace function public.notify_stage_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.stage is distinct from old.stage then
    insert into public.notifications (user_id, title, body, link)
    select new.candidate_id,
           'notification.stageChanged',
           j.title || '|' || new.stage::text,
           '/candidate/applications'
    from public.jobs j where j.id = new.job_id;
  end if;
  return new;
end;
$$;

create trigger applications_notify_stage_change
  after update on public.applications
  for each row execute function public.notify_stage_change();

-- ─── Row-level security ───────────────────────────────────────────────────
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.notifications enable row level security;
alter table public.feature_flags enable row level security;

-- profiles
create policy "profiles: read own, admin all, recruiters read applicants"
  on public.profiles for select using (
    id = auth.uid()
    or public.auth_role() = 'admin'
    or (
      public.auth_role() = 'recruiter'
      and exists (
        select 1 from public.applications a join public.jobs j on j.id = a.job_id
        where a.candidate_id = profiles.id and j.company_id = public.auth_company_id()
      )
    )
  );
create policy "profiles: update own (role locked)"
  on public.profiles for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.auth_role()
    and company_id is not distinct from public.auth_company_id()
  );
create policy "profiles: admin update" on public.profiles for update using (public.auth_role() = 'admin');

-- companies
create policy "companies: anyone signed in can read" on public.companies for select using (auth.uid() is not null);
-- Companies are created through create_company() so the recruiter is linked atomically.
create policy "companies: own recruiter or admin updates" on public.companies for update using (
  id = public.auth_company_id() or public.auth_role() = 'admin'
);

-- jobs
create policy "jobs: published visible to all, own company sees all, admin all"
  on public.jobs for select using (
    status = 'published' or company_id = public.auth_company_id() or public.auth_role() = 'admin'
  );
create policy "jobs: recruiter manages own company jobs"
  on public.jobs for all using (company_id = public.auth_company_id() and public.auth_role() = 'recruiter')
  with check (company_id = public.auth_company_id() and public.auth_role() = 'recruiter');

-- applications
create policy "applications: candidate reads own, recruiter reads company, admin all"
  on public.applications for select using (
    candidate_id = auth.uid()
    or public.auth_role() = 'admin'
    or exists (select 1 from public.jobs j where j.id = job_id and j.company_id = public.auth_company_id())
  );
create policy "applications: candidate applies to published job"
  on public.applications for insert with check (
    candidate_id = auth.uid()
    and public.auth_role() = 'candidate'
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'published')
  );
create policy "applications: recruiter moves company applications"
  on public.applications for update using (
    exists (select 1 from public.jobs j where j.id = job_id and j.company_id = public.auth_company_id())
  );
create policy "applications: candidate withdraws own"
  on public.applications for delete using (candidate_id = auth.uid());

-- interviews
create policy "interviews: participants read"
  on public.interviews for select using (
    exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = application_id
        and (a.candidate_id = auth.uid() or j.company_id = public.auth_company_id())
    )
    or public.auth_role() = 'admin'
  );
create policy "interviews: recruiter manages"
  on public.interviews for all using (
    exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = application_id and j.company_id = public.auth_company_id()
    )
  );

-- notifications
create policy "notifications: own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications: mark own read" on public.notifications for update using (user_id = auth.uid());

-- feature flags
create policy "feature_flags: read" on public.feature_flags for select using (true);
create policy "feature_flags: admin writes" on public.feature_flags for all using (public.auth_role() = 'admin');

-- ─── Storage: CVs (private bucket, folder per user) ───────────────────────
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false) on conflict do nothing;

create policy "cvs: owner uploads" on storage.objects for insert
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cvs: owner updates" on storage.objects for update
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cvs: owner, company recruiters and admin read" on storage.objects for select using (
  bucket_id = 'cvs' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.auth_role() = 'admin'
    or exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.candidate_id::text = (storage.foldername(name))[1]
        and j.company_id = public.auth_company_id()
    )
  )
);

-- ─── Realtime ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.applications, public.notifications;

-- ─── Seed flags ───────────────────────────────────────────────────────────
insert into public.feature_flags (key, enabled, description) values
  ('interview_scheduling', true, 'Recruiters can schedule interviews'),
  ('analytics_dashboard', true, 'Dashboards with charts'),
  ('onboarding_tour', true, 'First-login product tour');
