-- Projects: the core Yardola entity. A completed/in-progress backyard
-- project belonging to a business, taggable with categories, services,
-- styles, and features, and illustrated with photos.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  city_id uuid not null references public.cities (id) on delete restrict,
  neighborhood_id uuid references public.neighborhoods (id) on delete set null,
  zip_code_id uuid references public.zip_codes (id) on delete set null,
  project_year integer check (project_year between 1900 and 2100),
  budget_range public.budget_range,
  property_type public.property_type,
  status public.project_status not null default 'draft',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projects is 'A backyard project completed (or in progress) by a business. The core Yardola entity.';

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index projects_business_id_idx on public.projects (business_id);
create index projects_status_idx on public.projects (status);
create index projects_city_id_idx on public.projects (city_id);
create index projects_created_at_idx on public.projects (created_at);
create index projects_featured_idx on public.projects (is_featured) where is_featured = true;

create or replace function public.owns_project(target_project_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.projects p join public.businesses b on b.id=p.business_id where p.id=target_project_id and b.owner_id=(select auth.uid())); $$;

create or replace function public.project_is_public(target_project_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.projects where id=target_project_id and status='published'); $$;

create table public.project_categories (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, category_id uuid not null references public.categories(id) on delete restrict, created_at timestamptz not null default now(), unique(project_id,category_id));
create index project_categories_project_id_idx on public.project_categories(project_id);
create index project_categories_category_id_idx on public.project_categories(category_id);
create table public.project_services (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, service_id uuid not null references public.services(id) on delete restrict, created_at timestamptz not null default now(), unique(project_id,service_id));
create index project_services_project_id_idx on public.project_services(project_id);
create index project_services_service_id_idx on public.project_services(service_id);
create table public.project_styles (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, style_id uuid not null references public.styles(id) on delete restrict, created_at timestamptz not null default now(), unique(project_id,style_id));
create index project_styles_project_id_idx on public.project_styles(project_id);
create index project_styles_style_id_idx on public.project_styles(style_id);
create table public.project_features (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, feature_id uuid not null references public.features(id) on delete restrict, created_at timestamptz not null default now(), unique(project_id,feature_id));
create index project_features_project_id_idx on public.project_features(project_id);
create index project_features_feature_id_idx on public.project_features(feature_id);
create table public.project_photos (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, storage_path text, url text, alt_text text, caption text, sort_order integer not null default 0, photo_type public.photo_type not null default 'gallery', created_at timestamptz not null default now(), constraint project_photos_source_present check(storage_path is not null or url is not null));
create index project_photos_project_id_idx on public.project_photos(project_id,sort_order);

alter table public.projects enable row level security;
alter table public.project_categories enable row level security;
alter table public.project_services enable row level security;
alter table public.project_styles enable row level security;
alter table public.project_features enable row level security;
alter table public.project_photos enable row level security;
create policy "Published projects are publicly readable" on public.projects for select to anon,authenticated using(status='published');
create policy "Owners can view their own projects" on public.projects for select to authenticated using(public.owns_business(business_id));
create policy "Owners manage their own projects" on public.projects for insert to authenticated with check(public.owns_business(business_id));
create policy "Owners update their own projects" on public.projects for update to authenticated using(public.owns_business(business_id)) with check(public.owns_business(business_id));
create policy "Owners delete their own projects" on public.projects for delete to authenticated using(public.owns_business(business_id));
create policy "Admins manage projects" on public.projects for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Project categories are publicly readable" on public.project_categories for select to anon,authenticated using(public.project_is_public(project_id));
create policy "Owners manage their project categories" on public.project_categories for all to authenticated using(public.owns_project(project_id)) with check(public.owns_project(project_id));
create policy "Admins manage project categories" on public.project_categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Project services are publicly readable" on public.project_services for select to anon,authenticated using(public.project_is_public(project_id));
create policy "Owners manage their project services" on public.project_services for all to authenticated using(public.owns_project(project_id)) with check(public.owns_project(project_id));
create policy "Admins manage project services" on public.project_services for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Project styles are publicly readable" on public.project_styles for select to anon,authenticated using(public.project_is_public(project_id));
create policy "Owners manage their project styles" on public.project_styles for all to authenticated using(public.owns_project(project_id)) with check(public.owns_project(project_id));
create policy "Admins manage project styles" on public.project_styles for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Project features are publicly readable" on public.project_features for select to anon,authenticated using(public.project_is_public(project_id));
create policy "Owners manage their project features" on public.project_features for all to authenticated using(public.owns_project(project_id)) with check(public.owns_project(project_id));
create policy "Admins manage project features" on public.project_features for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Project photos are publicly readable" on public.project_photos for select to anon,authenticated using(public.project_is_public(project_id));
create policy "Owners manage their project photos" on public.project_photos for all to authenticated using(public.owns_project(project_id)) with check(public.owns_project(project_id));
create policy "Admins manage project photos" on public.project_photos for all to authenticated using(public.is_admin()) with check(public.is_admin());