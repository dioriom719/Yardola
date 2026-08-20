-- Fix: match_lead() failed on every call with
--   ERROR: column reference "business_id" is ambiguous
-- PL/pgSQL implicitly declares a variable for each `returns table (...)`
-- output column, so the function's own `business_id` output column
-- shadowed `lead_matches.business_id` inside `on conflict (lead_id,
-- business_id)` -- a clause that (unlike most SQL) cannot be
-- table-qualified. Renaming the output column to `matched_business_id`
-- removes the collision; nothing else calls match_lead() by column name
-- (submit_project_lead/submit_project_plan only `perform` it), so this
-- is a safe rename.

-- CREATE OR REPLACE cannot change a function's OUT-parameter names/types;
-- the old signature must be dropped first.
drop function if exists public.match_lead(uuid, integer);

create function public.match_lead(
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
  v_limit integer := greatest(1, least(coalesce(result_limit, 5), 10));
begin
  select * into v_lead
  from public.leads
  where id = target_lead_id;

  if v_lead.id is null then
    raise exception 'Lead not found';
  end if;

  -- Only the homeowner who owns the lead, or an admin, can initiate a match.
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

  -- Remove only pending matches so an explicit re-match can refresh scores
  -- without destroying a business's accepted/rejected history.
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
      )::numeric(5,2) as score
    from public.businesses b
    where b.status = 'active'
  ),
  ranked as (
    select id, score
    from candidates
    where score > 0
    order by score desc, id
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
  'Create or refresh up to N scored business matches for a homeowner lead. Authorized for the lead owner or admins.';

revoke all on function public.match_lead(uuid, integer) from public;
grant execute on function public.match_lead(uuid, integer) to authenticated;
