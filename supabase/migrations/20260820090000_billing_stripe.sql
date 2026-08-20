-- Phase 9: turn the Phase 2 monetization schema (plans/subscriptions/
-- transactions) into a working Stripe-backed billing system for business
-- users. Homeowners are never charged -- this migration only touches
-- business-scoped tables.
--
-- Design choices, in brief:
--  * `plans` gains the Stripe product/price identifiers needed to drive
--    Checkout, plus a nullable `max_active_leads` entitlement column (null
--    = unlimited). No new pricing model -- the existing plans catalog IS
--    the configurable pricing structure.
--  * A new `business_billing` table (1:1 with businesses, same shape as
--    `business_profiles`) holds the Stripe customer id. It's split out
--    from `businesses` for the same reason `business_profiles` was split
--    out: `businesses` has a broad owner-editable RLS policy, and a
--    Stripe customer id must never be directly writable by the business
--    owner (that would let a client "swap" or fabricate billing
--    identity). Only admins and the service role (used by the checkout
--    action and the webhook handler, both server-only) can write it.
--  * A new `stripe_webhook_events` table records every processed Stripe
--    event id so a replayed webhook delivery is a no-op.
--  * `subscription_status` gains `incomplete` / `incomplete_expired` to
--    cover Stripe's initial-payment-required states.
--
-- Nothing here changes lead matching/routing (Phase 8) or the homeowner
-- planner (Phase 5) -- those tables/functions are untouched.

alter type public.subscription_status add value if not exists 'incomplete';
alter type public.subscription_status add value if not exists 'incomplete_expired';

alter table public.plans
  add column stripe_product_id text,
  add column stripe_price_id text unique,
  add column max_active_leads integer;

comment on column public.plans.stripe_product_id is 'Stripe Product id backing this plan (test or live mode, matching the active Stripe key).';
comment on column public.plans.stripe_price_id is 'Stripe Price id used to start Checkout for this plan. Null for plans that don''t go through Stripe (e.g. a free tier).';
comment on column public.plans.max_active_leads is 'Entitlement: max number of active (non-closed) matched leads a business on this plan may view. Null = unlimited.';

create table public.business_billing (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.business_billing is
  'Stripe customer linkage for a business. Split out from businesses (like business_profiles) because owners must never be able to write this directly -- only the service role (checkout action, webhook handler) or an admin may.';

create trigger set_business_billing_updated_at
  before update on public.business_billing
  for each row execute function public.set_updated_at();

create table public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text not null,
  created_at timestamptz not null default now()
);

comment on table public.stripe_webhook_events is
  'Processed Stripe event ids, recorded first so a replayed webhook delivery is a no-op. Written only by the webhook handler (service role).';

create index stripe_webhook_events_type_idx on public.stripe_webhook_events (type);

-- Row Level Security --------------------------------------------------

alter table public.business_billing enable row level security;
alter table public.stripe_webhook_events enable row level security;

-- Owners may only ever SELECT their own billing row (e.g. to show "Stripe
-- connected" state) -- there is deliberately no insert/update/delete
-- policy for `authenticated`, so those statements are denied by RLS even
-- though the blanket schema grant includes those verbs. Only the service
-- role (which bypasses RLS entirely) or an admin can write this table.
create policy "Owners view their own billing record"
  on public.business_billing for select
  to authenticated
  using (public.owns_business(business_id));

create policy "Admins manage business billing"
  on public.business_billing for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No policies for anon/authenticated at all: webhook event bookkeeping is
-- an internal, service-role-only concern. Admins can still see it for
-- troubleshooting.
create policy "Admins view webhook events"
  on public.stripe_webhook_events for select
  to authenticated
  using (public.is_admin());
