-- Monetization foundation: pricing plans, subscriptions, transactions.
--
-- No payment provider integration yet (no Stripe customer/price IDs
-- assumed) -- `external_*` columns are placeholders for whatever
-- provider is wired up in a later phase. Shaped to support paid business
-- plans, featured placements, and subscriptions generally.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null default 0,
  billing_interval public.billing_interval not null default 'month',
  -- Free-form list of plan features/entitlements, e.g. ["featured_placement", "unlimited_projects"].
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is 'Catalog of monetization plans (business subscription tiers, featured placements, etc).';

create trigger set_plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

create index plans_is_active_idx on public.plans (is_active);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete restrict,
  status public.subscription_status not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  external_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'A business''s subscription to a plan.';

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create index subscriptions_business_id_idx on public.subscriptions (business_id);
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index subscriptions_status_idx on public.subscriptions (status);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses (id) on delete set null,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'usd',
  status public.transaction_status not null default 'pending',
  external_transaction_id text unique,
  description text,
  created_at timestamptz not null default now()
);

comment on table public.transactions is 'A billing transaction (payment, refund) tied to a business/subscription.';

create index transactions_business_id_idx on public.transactions (business_id);
create index transactions_subscription_id_idx on public.transactions (subscription_id);
create index transactions_status_idx on public.transactions (status);
create index transactions_created_at_idx on public.transactions (created_at);

-- Row Level Security --------------------------------------------------

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;

create policy "Active plans are publicly readable"
  on public.plans for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins manage plans"
  on public.plans for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Owners view their own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (public.owns_business(business_id));

create policy "Admins manage subscriptions"
  on public.subscriptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Owners view their own transactions"
  on public.transactions for select
  to authenticated
  using (business_id is not null and public.owns_business(business_id));

create policy "Admins manage transactions"
  on public.transactions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
