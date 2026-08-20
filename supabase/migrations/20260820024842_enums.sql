-- Enum types shared across the Yardola schema.
--
-- Enums are used only for small, stable value sets that are unlikely to
-- need frequent editing (roles, lifecycle statuses). Anything a business
-- user, admin, or content editor might want to expand over time (project
-- categories, services, features, design styles) is modeled as a lookup
-- table instead -- see the taxonomy migration.

-- profiles.role
create type public.user_role as enum ('homeowner', 'business_user', 'admin');

-- businesses.verification_status
create type public.verification_status as enum ('unverified', 'pending', 'verified');

-- businesses.status
create type public.business_status as enum ('pending', 'active', 'inactive', 'suspended');

-- business_claims.status
create type public.claim_status as enum ('pending', 'approved', 'rejected');

-- projects.status
create type public.project_status as enum ('draft', 'published', 'archived');

-- project_photos.photo_type
create type public.photo_type as enum ('hero', 'gallery', 'before', 'during', 'after');

-- projects.budget_range / project_plans.budget_range
create type public.budget_range as enum (
  'under_10k',
  '10k_25k',
  '25k_50k',
  '50k_100k',
  '100k_250k',
  'over_250k'
);

-- projects.property_type
create type public.property_type as enum (
  'single_family',
  'townhome',
  'condo',
  'multi_family',
  'commercial',
  'other'
);

-- project_plans.status
create type public.project_plan_status as enum ('draft', 'submitted', 'matched', 'closed');

-- project_plans.timeline
create type public.project_timeline as enum (
  'planning_only',
  'asap',
  '1_3_months',
  '3_6_months',
  '6_12_months'
);

-- leads.status
create type public.lead_status as enum (
  'new',
  'matched',
  'contacted',
  'accepted',
  'rejected',
  'closed'
);

-- leads.source
create type public.lead_source as enum ('planner', 'project_page', 'business_profile', 'manual', 'other');

-- lead_matches.match_status
create type public.match_status as enum ('pending', 'sent', 'viewed', 'accepted', 'rejected', 'expired');

-- lead_events.event_type
create type public.lead_event_type as enum (
  'created',
  'matched',
  'viewed',
  'accepted',
  'rejected',
  'contacted',
  'closed'
);

-- guides.status
create type public.guide_status as enum ('draft', 'published', 'archived');

-- plans.billing_interval
create type public.billing_interval as enum ('month', 'year', 'one_time');

-- subscriptions.status
create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'expired'
);

-- transactions.status
create type public.transaction_status as enum ('pending', 'succeeded', 'failed', 'refunded');
