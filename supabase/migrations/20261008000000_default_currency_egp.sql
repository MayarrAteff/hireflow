-- New jobs and offers default to Egyptian pounds; existing rows keep their currency.
alter table public.jobs alter column currency set default 'EGP';
alter table public.offers alter column currency set default 'EGP';
