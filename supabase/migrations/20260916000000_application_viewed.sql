-- ─── Recruiter "seen" state for applications ──────────────────────────────
-- `viewed_at` is set the first time anyone at the company opens the applicant (or moves them to another stage).
-- Null means nobody has looked yet, which is what the "new" badges count.
-- One transaction and safe to re-run: if any statement fails, nothing is applied.

begin;

alter table public.applications add column if not exists viewed_at timestamptz;

-- Replaces `applications_touch_updated_at`:
--  * moving an applicant implies someone has seen them;
--  * marking an application as seen is not activity, so it must not bump `updated_at`
--    (the candidate's tracker orders and labels applications by it).
create or replace function public.applications_before_update() returns trigger
language plpgsql as $$
begin
  if new.stage is distinct from old.stage and new.viewed_at is null then
    new.viewed_at := now();
  end if;

  if (to_jsonb(new) - 'viewed_at' - 'updated_at') is distinct from (to_jsonb(old) - 'viewed_at' - 'updated_at') then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists applications_touch_updated_at on public.applications;
drop trigger if exists applications_before_update on public.applications;

create trigger applications_before_update
  before update on public.applications
  for each row execute function public.applications_before_update();

-- Applicants a recruiter already moved were clearly seen; only the ones still in "applied" stay new.
update public.applications set viewed_at = updated_at where stage <> 'applied' and viewed_at is null;

commit;

-- Make the REST API pick up the new column straight away.
notify pgrst, 'reload schema';
