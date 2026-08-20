-- Project taxonomy: categories, services, features, styles.
--
-- These are lookup tables rather than enums because they are exactly the
-- kind of value an admin should be able to add to over time (new project
-- categories, new services under a category, new features/styles) without
-- a schema migration.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is
  'Top-level Yardola project categories (Pools, Landscaping, Artificial Turf, etc).';

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index categories_is_active_idx on public.categories (is_active);

-- Services belong to exactly one category (e.g. "Pool Resurfacing" under
-- "Pools"). The initial seed list is a starting point, not exhaustive.
create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.services is
  'Specific services offered within a category (e.g. New Pool Construction under Pools).';

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create index services_category_id_idx on public.services (category_id);
create index services_is_active_idx on public.services (is_active);

-- Project features: normalized attributes like "Water Feature", "Fire
-- Feature" -- linked to projects via project_features, never hard-coded
-- into project descriptions.
create table public.features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.features is 'Normalized project feature tags (Water Feature, Fire Feature, Pergola, ...).';

-- Design styles a project or a homeowner's plan can be tagged with (e.g.
-- Modern, Mediterranean, Desert, Tropical).
create table public.styles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.styles is 'Design style tags a project or project plan can be associated with.';

-- Row Level Security --------------------------------------------------

alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.features enable row level security;
alter table public.styles enable row level security;

create policy "Active categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

create policy "Active services are publicly readable"
  on public.services for select
  to anon, authenticated
  using (is_active = true);

create policy "Features are publicly readable"
  on public.features for select
  to anon, authenticated
  using (true);

create policy "Styles are publicly readable"
  on public.styles for select
  to anon, authenticated
  using (true);

create policy "Admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage services" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage features" on public.features for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage styles" on public.styles for all to authenticated using (public.is_admin()) with check (public.is_admin());
