-- ─── Notifications: the events that had none ──────────────────────────────
-- Stage changes and offers already notify. This adds new applications (to the company's recruiters) and
-- interviews being scheduled, moved or cancelled (to the candidate).
-- `title` is an i18n key and `body` its values joined with "|"; the job title goes last because it is free text.
-- Nothing here changes or removes existing rows. One transaction and safe to re-run.

begin;

create or replace function public.notify_new_application() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select r.id,
         'notification.newApplication',
         coalesce(nullif(c.full_name, ''), c.email) || '|' || j.title,
         '/recruiter/jobs/' || new.job_id || '?tab=applicants&applicant=' || new.id
  from public.jobs j
  join public.profiles r on r.company_id = j.company_id and r.role = 'recruiter'
  join public.profiles c on c.id = new.candidate_id
  where j.id = new.job_id;
  return new;
end;
$$;

drop trigger if exists applications_notify_new on public.applications;
create trigger applications_notify_new
  after insert on public.applications
  for each row execute function public.notify_new_application();

create or replace function public.notify_interview_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  item public.interviews;
  kind text;
begin
  if tg_op = 'DELETE' then
    item := old;
    kind := 'notification.interviewCancelled';
  elsif tg_op = 'INSERT' then
    item := new;
    kind := 'notification.interviewScheduled';
  elsif new.scheduled_at is distinct from old.scheduled_at then
    item := new;
    kind := 'notification.interviewRescheduled';
  else
    return new;
  end if;

  -- When the application itself is being deleted its row is already gone, so nothing is sent.
  insert into public.notifications (user_id, title, body, link)
  select a.candidate_id,
         kind,
         to_char(item.scheduled_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') || '|' || j.title,
         '/candidate/jobs/' || a.job_id
  from public.applications a
  join public.jobs j on j.id = a.job_id
  where a.id = item.application_id;

  return item;
end;
$$;

drop trigger if exists interviews_notify_change on public.interviews;
create trigger interviews_notify_change
  after insert or update or delete on public.interviews
  for each row execute function public.notify_interview_change();

commit;
