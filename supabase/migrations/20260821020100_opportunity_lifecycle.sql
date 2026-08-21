-- Phase 13: marketplace opportunity lifecycle -- schema + matcher update
-- + lifecycle RPCs.
--
-- Extends (does not replace) the Phase 8 matcher and the lead_matches
-- table it writes to. Lifecycle stages map onto match_status like this:
--
--   New/Matched  -> 'pending' / 'sent'   (lead_matches row exists)
--   Viewed       -> 'viewed'             (mark_opportunity_viewed)
--   Interested   -> 'interested'         (express_interest)
--   Connected    -> 'connected'          (connect_opportunity, homeowner-initiated)
--   Won / Lost   -> 'won' / 'lost'       (mark_opportunity_won / mark_opportunity_lost)
--
-- All writes to lead_matches for these transitions go through the
-- SECURITY DEFINER functions below -- exactly the same pattern already
-- used by match_lead()/submit_project_lead() -- rather than a direct
-- table UPDATE policy, so every transition can enforce its own ownership
-- check, valid-from-state check, and idempotency in one place.

-- Per-stage timestamps, for funnel measurement (opportunities viewed /
-- pursued / connected / resolved) independent of the current
-- match_status, which only holds the *current* stage.
alter table public.lead_matches
  add column viewed_at timestamptz,
  add column interested_at timestamptz,
  add column connected_at timestamptz,
  add column resolved_at timestamptz;

comment on column public.lead_matches.viewed_at is 'First time the matched business opened this opportunity.';
comment on column public.lead_matches.interested_at is 'First time the matched business expressed interest.';
comment on column public.lead_matches.connected_at is 'When the homeowner facilitated a connection with this business.';
comment on column public.lead_matches.resolved_at is 'When the opportunity was marked won or lost (see match_status).';

-- ---------------------------------------------------------------------
-- match_lead(): extend with a hard 5-match cap and an explicit,
-- documented, bounded plan-tier priority bonus.
--
-- Priority weighting (v1, intentionally simple and centralized here so
-- it's the one place to tune -- see docs/OPPORTUNITY-MARKETPLACE.md):
--   Premium plan : +6
--   Featured plan: +3
--   Basic / none : +0
--
-- The bonus is added only when ranking/selecting the top matches; the
-- match_score persisted to lead_matches stays the raw compatibility
-- score (category/location/service/type/quality), so "match quality" as
-- displayed to homeowners and businesses is never inflated by plan tier.
-- The bonus is also always smaller than every individual scoring factor
-- (the smallest is business quality at up to 10 points), so it can only
-- ever reorder candidates that are already close in raw quality -- it
-- cannot make a materially worse match outrank a materially better one,
-- and it cannot rescue a business that scored 0 (unqualified), since the
-- `score > 0` eligibility filter is applied before the bonus.
create or replace function public.match_lead(
  target_lead_id uuid,
  result_limit integer default 5
)
returns table (
  matched_business_id uuid,
  match_score numeric(5,2)
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_plan public.project_plans%rowtype;
  -- Hard product rule: a project is never exposed to more than 5
  -- contractors through the normal matching system.
  v_limit integer := greatest(1, least(coalesce(result_limit, 5), 5));
begin
  select * into v_lead
  from public.leads
  where id = target_lead_id;

  if v_lead.id is null then
    raise exception 'Lead not found';
  end if;

  if coalesce(v_lead.homeowner_id, '00000000-0000-0000-0000-000000000000'::uuid) <> (select auth.uid())
     and not public.is_admin() then
    raise exception 'Not authorized to match this lead';
  end if;

  if v_lead.project_plan_id is null then
    raise exception 'Lead has no project plan to match';
  end if;

  select * into v_plan
  from public.project_plans
  where id = v_lead.project_plan_id;

  if v_plan.id is null then
    raise exception 'Project plan not found';
  end if;

  -- Remove only untouched matches so an explicit re-match can refresh
  -- scores without destroying a business's engagement history (viewed,
  -- interested, connected, won, lost all survive a re-match).
  delete from public.lead_matches
  where lead_id = target_lead_id
    and match_status = 'pending';

  return query
  with plan_categories as (
    select ppc.category_id
    from public.project_plan_categories ppc
    where ppc.plan_id = v_plan.id
    union
    select v_plan.category_id
    where v_plan.category_id is not null
  ),
  candidates as (
    select
      b.id,
      (
        -- Category fit: 30 points.
        case when exists (
          select 1
          from public.business_services bs
          join public.services s on s.id = bs.service_id
          join plan_categories pc on pc.category_id = s.category_id
          where bs.business_id = b.id
        ) then 30 else 0 end
        +
        -- Location fit: 25 points. City service area is preferred; the
        -- business's physical city is a valid fallback.
        case when v_plan.city_id is not null and (
          exists (
            select 1 from public.business_service_areas bsa
            where bsa.business_id = b.id
              and bsa.city_id = v_plan.city_id
          )
          or b.city = (select c.name from public.cities c where c.id = v_plan.city_id)
        ) then 25 else 0 end
        +
        -- Service fit: 20 points. The planner currently captures category,
        -- not a specific service, so any offered service in a selected
        -- category counts as a service match.
        case when exists (
          select 1
          from public.business_services bs
          join public.services s on s.id = bs.service_id
          join plan_categories pc on pc.category_id = s.category_id
          where bs.business_id = b.id
        ) then 20 else 0 end
        +
        -- Project type fit: 15 points for an exact primary-category match.
        case when v_plan.category_id is not null and exists (
          select 1
          from public.business_services bs
          join public.services s on s.id = bs.service_id
          where bs.business_id = b.id
            and s.category_id = v_plan.category_id
        ) then 15 else 0 end
        +
        -- Business quality: 10 points. Verified + active + complete public
        -- profile earns the full score; active but unverified earns less.
        case
          when b.status = 'active' and b.verification_status = 'verified'
            and exists (
              select 1 from public.business_profiles bp
              where bp.business_id = b.id
                and coalesce(nullif(trim(bp.about), ''), '') <> ''
            ) then 10
          when b.status = 'active' and b.verification_status = 'verified' then 8
          when b.status = 'active' then 5
          else 0
        end
      )::numeric(5,2) as score,
      -- Plan-tier priority bonus (selection/ordering only -- see
      -- function comment above). A business counts as subscribed to a
      -- tier only while its most recent subscription is in one of the
      -- same statuses the entitlement system treats as "subscribed"
      -- (active/trialing/past_due) -- kept in sync with
      -- src/lib/data/billing.ts's SUBSCRIBED_STATUSES.
      coalesce((
        select case p.slug
          when 'premium' then 6
          when 'featured' then 3
          else 0
        end
        from public.subscriptions sub
        join public.plans p on p.id = sub.plan_id
        where sub.business_id = b.id
          and sub.status in ('active', 'trialing', 'past_due')
        order by sub.created_at desc
        limit 1
      ), 0) as tier_bonus
    from public.businesses b
    where b.status = 'active'
  ),
  qualified as (
    -- Eligibility is decided on the raw compatibility score alone --
    -- plan tier never makes an otherwise-unqualified business eligible.
    select id, score, tier_bonus
    from candidates
    where score > 0
  ),
  ranked as (
    select id, score
    from qualified
    order by (score + tier_bonus) desc, score desc, id
    limit v_limit
  ),
  inserted as (
    insert into public.lead_matches (lead_id, business_id, match_score, match_status)
    select target_lead_id, r.id, r.score, 'pending'::public.match_status
    from ranked r
    on conflict (lead_id, business_id)
    do update set match_score = excluded.match_score,
                  match_status = 'pending',
                  updated_at = now()
    returning lead_matches.business_id, lead_matches.match_score
  )
  select inserted.business_id, inserted.match_score
  from inserted;

  if exists (select 1 from public.lead_matches where lead_id = target_lead_id) then
    update public.leads
    set status = 'matched', updated_at = now()
    where id = target_lead_id;

    update public.project_plans
    set status = 'matched', updated_at = now()
    where id = v_plan.id;

    insert into public.lead_events (lead_id, business_id, actor_id, event_type, metadata)
    select target_lead_id, lm.business_id, (select auth.uid()), 'matched',
           jsonb_build_object('match_score', lm.match_score)
    from public.lead_matches lm
    where lm.lead_id = target_lead_id
      and lm.match_status = 'pending';
  end if;
end;
$$;

comment on function public.match_lead(uuid, integer) is
  'Create or refresh up to 5 scored, priority-ordered business matches for a homeowner lead. Authorized for the lead owner or admins.';

revoke all on function public.match_lead(uuid, integer) from public;
grant execute on function public.match_lead(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------
-- Contractor-side lifecycle actions.

-- Marks an opportunity as viewed by the matched business. Idempotent:
-- only the first call sets viewed_at / logs an event / advances the
-- status; later calls (or a business re-opening the same opportunity)
-- are a silent no-op. Never downgrades a status past 'viewed'.
create or replace function public.mark_opportunity_viewed(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.lead_matches%rowtype;
begin
  select * into v_match from public.lead_matches where id = target_match_id;
  if v_match.id is null then
    raise exception 'Opportunity not found';
  end if;
  if not public.owns_business(v_match.business_id) then
    raise exception 'Not authorized for this opportunity';
  end if;

  if v_match.viewed_at is null then
    update public.lead_matches
    set viewed_at = now(),
        match_status = case when match_status in ('pending', 'sent') then 'viewed' else match_status end,
        updated_at = now()
    where id = target_match_id;

    insert into public.lead_events (lead_id, business_id, actor_id, event_type)
    values (v_match.lead_id, v_match.business_id, (select auth.uid()), 'viewed');
  end if;
end;
$$;

comment on function public.mark_opportunity_viewed(uuid) is
  'Idempotently marks a matched opportunity as viewed by its owning business.';

revoke all on function public.mark_opportunity_viewed(uuid) from public;
grant execute on function public.mark_opportunity_viewed(uuid) to authenticated;

-- The matched business chooses to pursue the opportunity. Idempotent
-- (repeated calls are a no-op once interested_at is set) and only valid
-- from an un-actioned or viewed state -- a business cannot "express
-- interest" in an opportunity it has already moved past (connected,
-- won, lost), and cannot act on another business's opportunity.
create or replace function public.express_interest(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.lead_matches%rowtype;
begin
  select * into v_match from public.lead_matches where id = target_match_id;
  if v_match.id is null then
    raise exception 'Opportunity not found';
  end if;
  if not public.owns_business(v_match.business_id) then
    raise exception 'Not authorized for this opportunity';
  end if;

  if v_match.interested_at is not null then
    return; -- already interested; idempotent no-op
  end if;

  if v_match.match_status not in ('pending', 'sent', 'viewed') then
    raise exception 'This opportunity is no longer available to express interest in';
  end if;

  update public.lead_matches
  set match_status = 'interested',
      interested_at = now(),
      viewed_at = coalesce(viewed_at, now()),
      updated_at = now()
  where id = target_match_id;

  insert into public.lead_events (lead_id, business_id, actor_id, event_type)
  values (v_match.lead_id, v_match.business_id, (select auth.uid()), 'interested');
end;
$$;

comment on function public.express_interest(uuid) is
  'Idempotently records the owning business''s interest in a matched opportunity.';

revoke all on function public.express_interest(uuid) from public;
grant execute on function public.express_interest(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Homeowner-side connection action. The homeowner retains control over
-- when a connection is facilitated -- interest alone never reveals
-- contact information (see the PII-masking view in the next migration).
create or replace function public.connect_opportunity(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.lead_matches%rowtype;
begin
  select * into v_match from public.lead_matches where id = target_match_id;
  if v_match.id is null then
    raise exception 'Opportunity not found';
  end if;
  if not public.lead_belongs_to_caller(v_match.lead_id) then
    raise exception 'Not authorized for this opportunity';
  end if;

  if v_match.connected_at is not null then
    return; -- already connected; idempotent no-op
  end if;

  if v_match.match_status <> 'interested' then
    raise exception 'A business must be interested before a connection can be made';
  end if;

  update public.lead_matches
  set match_status = 'connected',
      connected_at = now(),
      updated_at = now()
  where id = target_match_id;

  insert into public.lead_events (lead_id, business_id, actor_id, event_type)
  values (v_match.lead_id, v_match.business_id, (select auth.uid()), 'connected');
end;
$$;

comment on function public.connect_opportunity(uuid) is
  'Idempotently facilitates a connection between the homeowner and an interested business. Homeowner-only.';

revoke all on function public.connect_opportunity(uuid) from public;
grant execute on function public.connect_opportunity(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Outcome tracking. A business can only report an outcome once a
-- connection has actually happened, and the outcome is one-way (once
-- won/lost, further calls are a no-op rather than flip-flopping).
create or replace function public.mark_opportunity_won(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.lead_matches%rowtype;
begin
  select * into v_match from public.lead_matches where id = target_match_id;
  if v_match.id is null then
    raise exception 'Opportunity not found';
  end if;
  if not public.owns_business(v_match.business_id) then
    raise exception 'Not authorized for this opportunity';
  end if;
  if v_match.match_status in ('won', 'lost') then
    return; -- already resolved; idempotent no-op
  end if;
  if v_match.match_status <> 'connected' then
    raise exception 'An opportunity must be connected before an outcome can be recorded';
  end if;

  update public.lead_matches
  set match_status = 'won', resolved_at = now(), updated_at = now()
  where id = target_match_id;

  insert into public.lead_events (lead_id, business_id, actor_id, event_type)
  values (v_match.lead_id, v_match.business_id, (select auth.uid()), 'won');
end;
$$;

comment on function public.mark_opportunity_won(uuid) is
  'Idempotently records that the owning business won a connected opportunity.';

revoke all on function public.mark_opportunity_won(uuid) from public;
grant execute on function public.mark_opportunity_won(uuid) to authenticated;

create or replace function public.mark_opportunity_lost(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.lead_matches%rowtype;
begin
  select * into v_match from public.lead_matches where id = target_match_id;
  if v_match.id is null then
    raise exception 'Opportunity not found';
  end if;
  if not public.owns_business(v_match.business_id) then
    raise exception 'Not authorized for this opportunity';
  end if;
  if v_match.match_status in ('won', 'lost') then
    return; -- already resolved; idempotent no-op
  end if;
  if v_match.match_status <> 'connected' then
    raise exception 'An opportunity must be connected before an outcome can be recorded';
  end if;

  update public.lead_matches
  set match_status = 'lost', resolved_at = now(), updated_at = now()
  where id = target_match_id;

  insert into public.lead_events (lead_id, business_id, actor_id, event_type)
  values (v_match.lead_id, v_match.business_id, (select auth.uid()), 'lost');
end;
$$;

comment on function public.mark_opportunity_lost(uuid) is
  'Idempotently records that the owning business lost a connected opportunity.';

revoke all on function public.mark_opportunity_lost(uuid) from public;
grant execute on function public.mark_opportunity_lost(uuid) to authenticated;
