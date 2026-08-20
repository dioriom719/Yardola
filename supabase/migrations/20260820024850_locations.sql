-- Hierarchical location taxonomy: state -> metro -> city -> neighborhood -> zip.
--
-- This is Yardola's curated location structure used for browse/SEO pages
-- and for tagging *projects* and *business service areas*. It is
-- intentionally separate from the free-text address fields stored
-- directly on `businesses` (a business's raw street address, which comes
-- from Google Places / manual entry and won't always map cleanly onto
-- this curated taxonomy).
--
-- V1 only seeds Nevada / the Las Vegas metro -- the structure supports
-- expansion to other states/metros later without schema changes.

create table public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation char(2) not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.metros (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.states (id) on delete restrict,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index metros_state_id_idx on public.metros (state_id);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  metro_id uuid not null references public.metros (id) on delete restrict,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index cities_metro_id_idx on public.cities (metro_id);

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (city_id, slug)
);

create index neighborhoods_city_id_idx on public.neighborhoods (city_id);

create table public.zip_codes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods (id) on delete set null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create index zip_codes_city_id_idx on public.zip_codes (city_id);
create index zip_codes_neighborhood_id_idx on public.zip_codes (neighborhood_id);

-- Row Level Security --------------------------------------------------
-- Reference/lookup data: readable by everyone, writable only by admins.

alter table public.states enable row level security;
alter table public.metros enable row level security;
alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.zip_codes enable row level security;

create policy "States are publicly readable" on public.states for select to anon, authenticated using (true);
create policy "Metros are publicly readable" on public.metros for select to anon, authenticated using (true);
create policy "Cities are publicly readable" on public.cities for select to anon, authenticated using (true);
create policy "Neighborhoods are publicly readable" on public.neighborhoods for select to anon, authenticated using (true);
create policy "Zip codes are publicly readable" on public.zip_codes for select to anon, authenticated using (true);

create policy "Admins manage states" on public.states for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage metros" on public.metros for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage cities" on public.cities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage neighborhoods" on public.neighborhoods for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage zip codes" on public.zip_codes for all to authenticated using (public.is_admin()) with check (public.is_admin());
