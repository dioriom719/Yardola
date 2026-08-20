-- Phase 5: homeowner planner extensions.
--
-- project_plans, saved_projects, profiles, and their RLS already exist
-- (see 20260820024846_profiles.sql, 20260820024907_planning_and_leads.sql,
-- 20260820024911_saved_and_claims.sql) and are reused as-is. This
-- migration only adds what the planner UI needs on top of them: a plan
-- title, an optional curated zip, and proper join tables for the
-- multi-select steps (project type, style, features) and for
-- plan-to-inspiration and plan-to-photo relationships -- rather than
-- storing arbitrary id arrays in JSON.

alter table public.project_plans
  add column title text,
  add column zip_code_id uuid references public.zip_codes (id) on delete set null;

comment on column public.project_plans.title is
  'Homeowner-chosen plan name (e.g. "My Pool Project"). Optional -- a default is derived from the plan''s category(ies) when blank.';
comment on column public.project_plans.category_id is
  'Primary/first-selected project type. Full multi-select lives in project_plan_categories.';
comment on column public.project_plans.style_id is
  'Primary/first-selected style. Full multi-select lives in project_plan_styles.';

-- Ownership helper, mirroring owns_project/owns_business -- lets the new
-- child tables below check plan ownership via a SECURITY DEFINER call
-- instead of a correlated subquery, keeping their policies simple and
-- avoiding any risk of recursive RLS.
create or replace function public.owns_project_plan(target_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_plans
    where id = target_plan_id
      and user_id = (select auth.uid())
  );
$$;

comment on function public.owns_project_plan(uuid) is
  'True if the calling user owns the given project plan.';

-- Multi-select project types (Pool + Outdoor Kitchen + Patio, etc).
create table public.project_plan_categories (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.project_plans (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (plan_id, category_id)
);

create index project_plan_categories_plan_id_idx on public.project_plan_categories (plan_id);
create index project_plan_categories_category_id_idx on public.project_plan_categories (category_id);

-- Multi-select styles (Modern + Desert, etc).
create table public.project_plan_styles (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.project_plans (id) on delete cascade,
  style_id uuid not null references public.styles (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (plan_id, style_id)
);

create index project_plan_styles_plan_id_idx on public.project_plan_styles (plan_id);
create index project_plan_styles_style_id_idx on public.project_plan_styles (style_id);

-- Multi-select features (Covered Patio, Fire Feature, ...).
create table public.project_plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.project_plans (id) on delete cascade,
  feature_id uuid not null references public.features (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (plan_id, feature_id)
);

create index project_plan_features_plan_id_idx on public.project_plan_features (plan_id);
create index project_plan_features_feature_id_idx on public.project_plan_features (feature_id);

-- Saved (published, public) projects a homeowner has attached to a plan
-- as inspiration. Deliberately a plan->project link, not a link to
-- saved_projects rows -- a homeowner can point a plan at any project,
-- and unsaving a project later shouldn't silently detach it from a plan.
create table public.project_plan_inspiration (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.project_plans (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (plan_id, project_id)
);

create index project_plan_inspiration_plan_id_idx on public.project_plan_inspiration (plan_id);
create index project_plan_inspiration_project_id_idx on public.project_plan_inspiration (project_id);

-- Homeowner's own "what my backyard looks like today" uploads. Private
-- by construction -- storage_path points into the private
-- `homeowner-uploads` bucket created below, never a public URL.
create table public.project_plan_photos (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.project_plans (id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index project_plan_photos_plan_id_idx on public.project_plan_photos (plan_id, sort_order);

comment on table public.project_plan_photos is
  'Homeowner-uploaded "current backyard" photos for a plan. Private -- see the homeowner-uploads storage bucket policies.';

-- Row Level Security --------------------------------------------------

alter table public.project_plan_categories enable row level security;
alter table public.project_plan_styles enable row level security;
alter table public.project_plan_features enable row level security;
alter table public.project_plan_inspiration enable row level security;
alter table public.project_plan_photos enable row level security;

create policy "Homeowners manage categories on their own plans"
  on public.project_plan_categories for all
  to authenticated
  using (public.owns_project_plan(plan_id))
  with check (public.owns_project_plan(plan_id));

create policy "Homeowners manage styles on their own plans"
  on public.project_plan_styles for all
  to authenticated
  using (public.owns_project_plan(plan_id))
  with check (public.owns_project_plan(plan_id));

create policy "Homeowners manage features on their own plans"
  on public.project_plan_features for all
  to authenticated
  using (public.owns_project_plan(plan_id))
  with check (public.owns_project_plan(plan_id));

create policy "Homeowners manage inspiration on their own plans"
  on public.project_plan_inspiration for all
  to authenticated
  using (public.owns_project_plan(plan_id))
  with check (public.owns_project_plan(plan_id));

create policy "Homeowners manage photos on their own plans"
  on public.project_plan_photos for all
  to authenticated
  using (public.owns_project_plan(plan_id))
  with check (public.owns_project_plan(plan_id));

create policy "Admins manage plan categories" on public.project_plan_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage plan styles" on public.project_plan_styles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage plan features" on public.project_plan_features for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage plan inspiration" on public.project_plan_inspiration for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage plan photos" on public.project_plan_photos for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage --------------------------------------------------------------
--
-- Private bucket for homeowner "current backyard" uploads. Objects are
-- stored at `{user_id}/{plan_id}/{filename}` -- policies check that the
-- first path segment matches the caller's own auth.uid(), so a homeowner
-- can only read/write/delete within their own folder. Never public;
-- the app serves these via short-lived signed URLs.

insert into storage.buckets (id, name, public)
values ('homeowner-uploads', 'homeowner-uploads', false)
on conflict (id) do nothing;

create policy "Homeowners read their own uploads"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'homeowner-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Homeowners upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'homeowner-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Homeowners update their own uploads"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'homeowner-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'homeowner-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Homeowners delete their own uploads"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'homeowner-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
