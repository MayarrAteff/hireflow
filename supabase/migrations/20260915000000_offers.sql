-- Job offers: a recruiter sends an offer on an application; the candidate accepts or declines it in their portal.

-- ─── Table ────────────────────────────────────────────────────────────────
create type public.offer_status as enum ('draft', 'sent', 'accepted', 'declined', 'withdrawn');

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  salary numeric not null check (salary > 0),
  currency text not null default 'SAR',
  start_date date not null,
  -- Last day the candidate can respond; "expired" is derived from it, so nothing has to run on a schedule.
  expires_at date not null check (expires_at <= start_date),
  message text check (char_length(message) <= 2000),
  letter_path text,
  status public.offer_status not null default 'draft',
  decline_reason text check (char_length(decline_reason) <= 1000),
  sent_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One live offer per application; withdrawn and answered offers stay as history.
create unique index offers_one_live_per_application on public.offers (application_id) where status in ('draft', 'sent');
create index on public.offers (application_id);

-- ─── Integrity ────────────────────────────────────────────────────────────
-- Recruiters edit drafts, send them, or withdraw a sent offer. Only the candidate RPCs below may record a response
-- or a view; they flag themselves with the transaction-local `hireflow.offer_rpc` setting.
create or replace function public.offers_before_write() returns trigger
language plpgsql set search_path = public as $$
declare
  from_rpc boolean := coalesce(current_setting('hireflow.offer_rpc', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'sent') then
      raise exception 'A new offer is either a draft or sent' using errcode = '23514';
    end if;
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.viewed_at := null;
    new.responded_at := null;
    new.decline_reason := null;
  elsif not from_rpc then
    if old.status = 'sent' and new.status = 'withdrawn' then
      -- Withdrawing never changes the terms the candidate already saw.
      new := old;
      new.status := 'withdrawn';
    elsif old.status <> 'draft' then
      raise exception 'Only draft offers can be changed. Withdraw it and send a revised offer instead.'
        using errcode = '42501';
    elsif new.status not in ('draft', 'sent') then
      raise exception 'A draft can only be saved or sent' using errcode = '23514';
    end if;
    new.viewed_at := old.viewed_at;
    new.responded_at := old.responded_at;
    new.decline_reason := old.decline_reason;
  end if;

  if new.status = 'sent' and (tg_op = 'INSERT' or old.status <> 'sent') then
    if new.expires_at < current_date then
      raise exception 'The response deadline has already passed' using errcode = '23514';
    end if;
    new.sent_at := now();
  end if;
  return new;
end;
$$;

create trigger offers_before_write
  before insert or update on public.offers
  for each row execute function public.offers_before_write();

-- Runs after offers_before_write (triggers fire in name order).
create trigger offers_touch_updated_at
  before update on public.offers
  for each row execute function public.touch_updated_at();

-- Sending an offer moves the application to Offer and tells the candidate.
create or replace function public.offers_after_sent() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  app public.applications;
begin
  if new.status = 'sent' and (tg_op = 'INSERT' or old.status <> 'sent') then
    select * into app from public.applications where id = new.application_id;

    if app.stage not in ('offer', 'hired') then
      update public.applications
      set stage = 'offer',
          position = (select count(*) from public.applications where job_id = app.job_id and stage = 'offer')
      where id = app.id;
    end if;

    insert into public.notifications (user_id, title, body, link)
    select app.candidate_id, 'notification.offerReceived', j.title, '/candidate/offers/' || new.id
    from public.jobs j where j.id = app.job_id;
  end if;
  return new;
end;
$$;

create trigger offers_after_sent
  after insert or update on public.offers
  for each row execute function public.offers_after_sent();

-- ─── Candidate actions ────────────────────────────────────────────────────
create or replace function public.respond_to_offer(p_offer_id uuid, p_accept boolean, p_reason text default null)
returns public.offers
language plpgsql security definer set search_path = public as $$
declare
  offer public.offers;
  app public.applications;
begin
  select * into offer from public.offers where id = p_offer_id for update;
  select * into app from public.applications where id = offer.application_id;

  if offer.id is null or app.candidate_id is distinct from auth.uid() or offer.status = 'draft' then
    raise exception 'Offer not found' using errcode = 'P0002';
  end if;
  if offer.status <> 'sent' then
    raise exception 'This offer can no longer be answered' using errcode = '22023';
  end if;
  if offer.expires_at < current_date then
    raise exception 'This offer has expired' using errcode = '22023';
  end if;

  perform set_config('hireflow.offer_rpc', 'on', true);
  update public.offers
  set status = case when p_accept then 'accepted'::public.offer_status else 'declined'::public.offer_status end,
      responded_at = now(),
      viewed_at = coalesce(viewed_at, now()),
      decline_reason = case when p_accept then null else left(nullif(trim(p_reason), ''), 1000) end
  where id = offer.id
  returning * into offer;
  perform set_config('hireflow.offer_rpc', 'off', true);

  if p_accept then
    update public.applications set stage = 'hired' where id = app.id;
  end if;

  insert into public.notifications (user_id, title, body, link)
  select offer.created_by,
         case when p_accept then 'notification.offerAccepted' else 'notification.offerDeclined' end,
         coalesce(nullif(p.full_name, ''), p.email) || '|' || j.title,
         '/recruiter/jobs/' || app.job_id || '?tab=board'
  from public.jobs j, public.profiles p
  where j.id = app.job_id and p.id = app.candidate_id;

  return offer;
end;
$$;

create or replace function public.mark_offer_viewed(p_offer_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('hireflow.offer_rpc', 'on', true);
  update public.offers o
  set viewed_at = now()
  from public.applications a
  where o.id = p_offer_id
    and a.id = o.application_id
    and a.candidate_id = auth.uid()
    and o.status <> 'draft'
    and o.viewed_at is null;
  perform set_config('hireflow.offer_rpc', 'off', true);
end;
$$;

-- ─── Row-level security ───────────────────────────────────────────────────
alter table public.offers enable row level security;

create policy "offers: company recruiters, the candidate once sent, admin read"
  on public.offers for select using (
    public.auth_role() = 'admin'
    or exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = offers.application_id
        and (j.company_id = public.auth_company_id() or (a.candidate_id = auth.uid() and offers.status <> 'draft'))
    )
  );
create policy "offers: company recruiters create"
  on public.offers for insert with check (
    public.auth_role() = 'recruiter'
    and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = offers.application_id and j.company_id = public.auth_company_id()
    )
  );
create policy "offers: company recruiters update"
  on public.offers for update using (
    public.auth_role() = 'recruiter'
    and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = offers.application_id and j.company_id = public.auth_company_id()
    )
  );
create policy "offers: company recruiters delete drafts"
  on public.offers for delete using (
    offers.status = 'draft'
    and public.auth_role() = 'recruiter'
    and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = offers.application_id and j.company_id = public.auth_company_id()
    )
  );

-- ─── Storage: offer letters (private, folder per company) ─────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('offer-letters', 'offer-letters', false, 5242880, array['application/pdf'])
on conflict do nothing;

create policy "offer-letters: company recruiters upload" on storage.objects for insert with check (
  bucket_id = 'offer-letters'
  and public.auth_role() = 'recruiter'
  and (storage.foldername(name))[1] = public.auth_company_id()::text
);
create policy "offer-letters: company recruiters update" on storage.objects for update using (
  bucket_id = 'offer-letters'
  and public.auth_role() = 'recruiter'
  and (storage.foldername(name))[1] = public.auth_company_id()::text
);
create policy "offer-letters: company recruiters delete" on storage.objects for delete using (
  bucket_id = 'offer-letters'
  and public.auth_role() = 'recruiter'
  and (storage.foldername(name))[1] = public.auth_company_id()::text
);
create policy "offer-letters: company recruiters, the candidate once sent, admin read" on storage.objects for select using (
  bucket_id = 'offer-letters' and (
    (public.auth_role() = 'recruiter' and (storage.foldername(name))[1] = public.auth_company_id()::text)
    or public.auth_role() = 'admin'
    or exists (
      select 1 from public.offers o join public.applications a on a.id = o.application_id
      where o.letter_path = storage.objects.name and o.status <> 'draft' and a.candidate_id = auth.uid()
    )
  )
);

-- ─── Realtime ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.offers;
