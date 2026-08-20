-- Extensions and shared helper functions used across the Yardola schema.

-- gen_random_uuid() for UUID primary keys.
create extension if not exists pgcrypto with schema extensions;

-- Generic trigger function: keeps `updated_at` current on every row update.
-- Attached per-table below wherever a table has an `updated_at` column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: sets updated_at = now() on row update. Attach as a BEFORE UPDATE trigger.';
