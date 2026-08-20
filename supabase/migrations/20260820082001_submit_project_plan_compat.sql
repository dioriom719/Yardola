-- Keep the existing planner action/API stable while routing submission through
-- the Phase 8 matcher. The UI already calls submit_project_plan(target_plan_id).
-- This wrapper snapshots the homeowner's current profile contact details.

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
  v_uid uuid := (select auth.uid());
  v_profile public.profiles%rowtype;
  v_lead_id uuid;
  v_match_count integer;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_uid;

  if not exists (
    select 1 from public.project_plans
    where id = target_plan_id and user_id = v_uid
  ) then
    raise exception 'Project plan not found';
  end if;

  -- Idempotent submission: if this plan already has a lead, return the
  -- current match count rather than creating duplicate leads.
  select l.id into v_lead_id
  from public.leads l
  where l.project_plan_id = target_plan_id
    and l.homeowner_id = v_uid
  order by l.created_at desc
  limit 1;

  if v_lead_id is null then
    v_lead_id := public.submit_project_lead(
      target_plan_id,
      coalesce(nullif(trim(concat_ws(' ', v_profile.first_name, v_profile.last_name)), ''), v_profile.email),
      v_profile.email,
      v_profile.phone
    );
  else
    -- Refresh pending matches when the homeowner explicitly resubmits.
    perform public.match_lead(v_lead_id, 5);
  end if;

  select count(*)::integer into v_match_count
  from public.lead_matches
  where lead_matches.lead_id = v_lead_id;

  return query select v_lead_id, v_match_count;
end;
$$;

revoke all on function public.submit_project_plan(uuid) from public;
grant execute on function public.submit_project_plan(uuid) to authenticated;
