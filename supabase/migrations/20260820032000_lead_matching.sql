-- Phase 6: homeowner-to-professional matching and lead routing.
--
-- A submitted project plan becomes a lead and is matched to up to five
-- active Yardola businesses. The score follows the V1 weighting defined
-- in Phase 2: category 30%, location 25%, service 20%, project type 15%,
-- business quality 10%.
--
-- The planner currently captures project category rather than a separate
-- service field. For V1, "service" means the business offers at least one
-- active service belonging to one of the plan's selected categories; the
-- project-type component is the strength of that category fit. This keeps
-- the planner simple while making the routing engine useful immediately.

create index if not exists business_services_service_business_idx
  on public.business_services (service_id, business_id);

create index if not exists business_service_areas_city_business_idx
  on public.business_service_areas (city_id, business_id);

create index if not exists project_plans_city_status_idx
  on public.project_plans (city_id, status);

create index if not exists lead_matches_lead_score_idx
  on public.lead_matches (lead_id, match_score desc);

-- Returns the candidate score and its components for one plan/business.
-- Kept as a private helper because the public-facing operation is the
-- submit_project_plan() function below.
create or replace function public.calculate_lead_match_score(
  target_plan_id uuid,
  target_business_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  with plan as (
    select p.id, p.city_id,
           coalesce(array_agg(distinct pc.category_id) filter (where pc.category_id is not null), '{}'::uuid[]) as category_ids
    from public.project_plans p
    left join public.project_plan_categories pc on pc.plan_id = p.id
    where p.id = target_plan_id
    group by p.id, p.city_id
  ),
  business_category_fit as (
    select exists (
      select 1
      from public.business_services bs
      join public.services s on s.id = bs.service_id
      where bs.business_id = target_business_id
        and s.is_active = true
        and s.category_id = any(plan.category_ids)
    ) as fits,
    plan.city_id,
    plan.category_ids
    from plan
  ),
  quality as (
    select
      case when b.verification_status = 'verified' then 5 else 0 end
      + case when bp.business_id is not null then 2 else 0 end
      + case when exists (
          select 1 from public.projects p
          where p.business_id = b.id and p.status = 'published'
        ) then 3 else 0 end as quality_score
    from public.businesses b
    left join public.business_profiles bp on bp.business_id = b.id
    where b.id = target_business_id
  )
  select least(100::numeric,
    (case when business_category_fit.fits then 30 else 0 end)
    + (case when exists (
        select 1 from public.business_service_areas bsa
        where bsa.business_id = target_business_id
          and bsa.city_id = business_category_fit.city_id
      ) then 25 else 0 end)
    + (case when business_category_fit.fits then 20 else 0 end)
    + (case when business_category_fit.fits then 15 else 0 end)
    + coalesce(quality.quality_score, 0)
  )
  from business_category_fit cross join quality;
$$;

comment on function public.calculate_lead_match_score(uuid, uuid) is
  'V1 deterministic lead score: category 30, location 25, service 20, project type 15, business quality 10.';

-- Atomically submit a homeowner plan, create its lead, calculate matches,
-- and record lifecycle events. SECURITY DEFINER is used so the operation
-- can safely update the related lifecycle records without exposing broad
-- write access to lead_matches.
create or replace function public.submit_project_plan(target_plan_id uuid)
returns table (
  lead_id uuid,
  match_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := (select auth.uid());
  new_lead_id uuid;
  inserted_count integer := 0;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.project_plans
    where id = target_plan_id and user_id = caller_id
  ) then
    raise exception 'Plan not found';
  end if;

  if not exists (
    select 1 from public.project_plans p
    join public.project_plan_categories pc on pc.plan_id = p.id
    where p.id = target_plan_id
  ) then
    raise exception 'Project type is required';
  end if;

  if not exists (
    select 1 from public.project_plans
    where id = target_plan_id and city_id is not null
  ) then
    raise exception 'Project location is required';
  end if;

  -- Prevent duplicate lead creation when a homeowner retries the submit
  -- request after a network interruption.
  select l.id into new_lead_id
  from public.leads l
  where l.project_plan_id = target_plan_id
    and l.homeowner_id = caller_id
  order by l.created_at desc
  limit 1;

  if new_lead_id is null then
    insert into public.leads (project_plan_id, homeowner_id, status, source)
    values (target_plan_id, caller_id, 'new', 'planner')
    returning id into new_lead_id;

    insert into public.lead_events (lead_id, actor_id, event_type)
    values (new_lead_id, caller_id, 'created');
  end if;

  -- Replace only pending/rejected/expired matches. Existing accepted or
  -- viewed matches are left intact if a homeowner resubmits a plan.
  delete from public.lead_matches
  where lead_id = new_lead_id
    and match_status in ('pending', 'rejected', 'expired');

  insert into public.lead_matches (lead_id, business_id, match_score, match_status)
  select
    new_lead_id,
    b.id,
    public.calculate_lead_match_score(target_plan_id, b.id),
    'pending'
  from public.businesses b
  where b.status = 'active'
    and exists (
      select 1
      from public.business_services bs
      join public.services s on s.id = bs.service_id
      join public.project_plans p on p.id = target_plan_id
      join public.project_plan_categories pc on pc.plan_id = p.id and pc.category_id = s.category_id
      where bs.business_id = b.id
        and s.is_active = true
    )
  order by public.calculate_lead_match_score(target_plan_id, b.id) desc, b.created_at asc
  limit 5
  on conflict (lead_id, business_id) do update
    set match_score = excluded.match_score,
        match_status = case
          when public.lead_matches.match_status in ('accepted', 'viewed', 'sent') then public.lead_matches.match_status
          else 'pending'
        end,
        updated_at = now();

  select count(*) into inserted_count
  from public.lead_matches lm
  where lm.lead_id = new_lead_id;

  update public.leads
  set status = case when inserted_count > 0 then 'matched' else 'new' end,
      updated_at = now()
  where id = new_lead_id;

  update public.project_plans
  set status = case when inserted_count > 0 then 'matched' else 'submitted' end,
      updated_at = now()
  where id = target_plan_id;

  if inserted_count > 0 then
    insert into public.lead_events (lead_id, actor_id, event_type, metadata)
    values (
      new_lead_id,
      caller_id,
      'matched',
      jsonb_build_object('match_count', inserted_count)
    );
  end if;

  return query select new_lead_id, inserted_count;
end;
$$;

comment on function public.submit_project_plan(uuid) is
  'Submit an owned homeowner plan, create/reuse its lead, and route it to the top matching active businesses.';

revoke all on function public.calculate_lead_match_score(uuid, uuid) from public, anon, authenticated;
revoke all on function public.submit_project_plan(uuid) from public, anon, authenticated;
grant execute on function public.submit_project_plan(uuid) to authenticated;
