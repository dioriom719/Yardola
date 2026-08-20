-- Homeowner project planning and the lead lifecycle it feeds into.
--
-- This migration establishes the *data shape* only. The matching
-- algorithm (category 30% / location 25% / service 20% / project type
-- 15% / business quality 10%) and lead routing logic are implemented in
-- a later phase -- here we just store the resulting match_score/status.

create table public.project_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- All planning attributes are nullable: a plan is built up incrementally
  -- by the (not-yet-built) planner wizard and may be saved mid-flow.
  category_id uuid references public.categories (id) on delete set null,
  city_id uuid references public.cities (id) on delete set null,
  style_id uuid references public.styles (id) on delete set null,
  budget_range public.budget_range,
  timeline public.project_timeline,
  description text,
  status public.project_plan_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.project_plans is
  'A homeowner''s in-progress or submitted project plan, the input to lead generation.';

create trigger set_project_plans_updated_at
  before update on public.project_plans
  for each row execute function public.set_updated_at();

create index project_plans_user_id_idx on public.project_plans (user_id);
create index project_plans_status_idx on public.project_plans (status);
create index project_plans_category_id_idx on public.project_plans (category_id);

-- A homeowner project request. May originate from a project_plan, or
-- directly (e.g. a "Contact this business" button on a project page).
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  project_plan_id uuid references public.project_plans (id) on delete set null,
  homeowner_id uuid references public.profiles (id) on delete set null,
  -- Snapshot of contact details at submission time, independent of the
  -- homeowner's profile (also allows for not-yet-authenticated capture).
  contact_name text,
  contact_email text,
  contact_phone text,
  status public.lead_status not null default 'new',
  source public.lead_source not null default 'other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is
  'A homeowner project request. Private -- never exposed publicly; see RLS policies.';

create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create index leads_homeowner_id_idx on public.leads (homeowner_id);
create index leads_project_plan_id_idx on public.leads (project_plan_id);
create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at);

-- A lead may be matched to multiple businesses.
create table public.lead_matches (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- 0-100 composite score from the (future) matching algorithm.
  match_score numeric(5, 2) check (match_score >= 0 and match_score <= 100),
  match_status public.match_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, business_id)
);

comment on table public.lead_matches is
  'A lead matched to a candidate business, with the resulting match score. Matching logic lands in a later phase.';

create trigger set_lead_matches_updated_at
  before update on public.lead_matches
  for each row execute function public.set_updated_at();

create index lead_matches_lead_id_idx on public.lead_matches (lead_id);
create index lead_matches_business_id_idx on public.lead_matches (business_id);
create index lead_matches_match_status_idx on public.lead_matches (match_status);

-- Lead lifecycle event log (created, matched, viewed, accepted,
-- rejected, contacted, closed). Deliberately minimal -- not a general
-- analytics/event system.
create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type public.lead_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.lead_events is 'Lifecycle event log for a lead.';

create index lead_events_lead_id_idx on public.lead_events (lead_id);
create index lead_events_business_id_idx on public.lead_events (business_id);
create index lead_events_event_type_idx on public.lead_events (event_type);
create index lead_events_created_at_idx on public.lead_events (created_at);

-- Cross-table visibility helpers ----------------------------------------
--
-- leads and lead_matches policies each need to check a condition on the
-- *other* table. A plain correlated subquery would re-trigger that other
-- table's RLS policies, which loop back and cause "infinite recursion
-- detected in policy" -- so, same as owns_business/is_admin, these are
-- SECURITY DEFINER to evaluate without re-entering RLS.

create or replace function public.lead_belongs_to_caller(target_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.leads
    where id = target_lead_id
      and homeowner_id = (select auth.uid())
  );
$$;

comment on function public.lead_belongs_to_caller(uuid) is
  'True if the calling user is the homeowner on the given lead.';

create or replace function public.lead_matches_caller_business(target_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lead_matches lm
    where lm.lead_id = target_lead_id
      and public.owns_business(lm.business_id)
  );
$$;

comment on function public.lead_matches_caller_business(uuid) is
  'True if the calling user owns a business matched to the given lead.';

-- Row Level Security --------------------------------------------------

alter table public.project_plans enable row level security;
alter table public.leads enable row level security;
alter table public.lead_matches enable row level security;
alter table public.lead_events enable row level security;

-- project_plans: fully private to the owning homeowner (and admins).
create policy "Homeowners manage their own project plans"
  on public.project_plans for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Admins manage project plans"
  on public.project_plans for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- leads: homeowners can create and read their own; matched businesses
-- can read (never write); admins manage fully. No public access.
create policy "Homeowners create their own leads"
  on public.leads for insert
  to authenticated
  with check (homeowner_id = (select auth.uid()));

create policy "Homeowners view their own leads"
  on public.leads for select
  to authenticated
  using (homeowner_id = (select auth.uid()));

create policy "Matched businesses view their leads"
  on public.leads for select
  to authenticated
  using (public.lead_matches_caller_business(id));

create policy "Admins manage leads"
  on public.leads for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- lead_matches: read-only for the homeowner and the matched business;
-- writes (creating/scoring matches) are admin/system only for now.
create policy "Homeowners view matches on their leads"
  on public.lead_matches for select
  to authenticated
  using (public.lead_belongs_to_caller(lead_id));

create policy "Businesses view their own lead matches"
  on public.lead_matches for select
  to authenticated
  using (public.owns_business(business_id));

create policy "Admins manage lead matches"
  on public.lead_matches for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- lead_events: homeowners and matched businesses can read; a matched
-- business may also log its own "viewed"/"contacted" events.
create policy "Homeowners view events on their leads"
  on public.lead_events for select
  to authenticated
  using (public.lead_belongs_to_caller(lead_id));

create policy "Businesses view events on their matched leads"
  on public.lead_events for select
  to authenticated
  using (public.lead_matches_caller_business(lead_id));

create policy "Businesses can log viewed/contacted events on their matches"
  on public.lead_events for insert
  to authenticated
  with check (
    event_type in ('viewed', 'contacted')
    and business_id is not null
    and public.owns_business(business_id)
    and public.lead_matches_caller_business(lead_id)
  );

create policy "Admins manage lead events"
  on public.lead_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
