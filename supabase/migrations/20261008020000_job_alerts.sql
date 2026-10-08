-- ─── Job alerts ───────────────────────────────────────────────────────────
-- When a job is published, candidates whose profile lists at least one of its skills get a notification.
-- Candidates can switch alerts off on their profile (`job_alerts`).
-- `body` is "<matched skills>|<company>|<job title>", read by the app like every other notification.
-- Nothing here changes or removes existing rows. One transaction and safe to re-run.

begin;

alter table public.profiles add column if not exists job_alerts boolean not null default true;

create or replace function public.notify_job_alert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  job_link text := '/candidate/jobs/' || new.id;
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    insert into public.notifications (user_id, title, body, link)
    select p.id,
           'notification.jobAlert',
           m.matched || '|' || c.name || '|' || new.title,
           job_link
    from public.profiles p
    join public.companies c on c.id = new.company_id
    cross join lateral (
      -- Skills are compared the way the app compares them: trimmed and case-insensitive.
      select count(distinct lower(trim(job_skill))) as matched
      from unnest(new.skills) as job_skill
      where lower(trim(job_skill)) in (select lower(trim(own_skill)) from unnest(p.skills) as own_skill)
    ) m
    where p.role = 'candidate'
      and p.is_active
      and p.job_alerts
      and m.matched > 0
      -- A job that is closed and reopened does not alert the same people twice, or anyone who already applied.
      and not exists (
        select 1 from public.notifications n
        where n.user_id = p.id and n.title = 'notification.jobAlert' and n.link = job_link
      )
      and not exists (
        select 1 from public.applications a where a.job_id = new.id and a.candidate_id = p.id
      );
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_notify_alert on public.jobs;
create trigger jobs_notify_alert
  after insert or update of status on public.jobs
  for each row execute function public.notify_job_alert();

commit;
