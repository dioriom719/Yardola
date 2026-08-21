-- Phase 13: opportunity PII protection.
--
-- Before this migration, "Matched businesses view their leads" granted a
-- matched business full row access to `leads` -- including
-- contact_name/contact_email/contact_phone -- the instant a match was
-- created, before the business had even opened the opportunity. RLS is
-- row-level only, so that policy could not be narrowed to "project
-- fields yes, contact fields only once connected" -- it had to be
-- dropped and replaced with a function that applies that exact rule.
--
-- Businesses now reach their opportunities exclusively through
-- get_business_opportunities(), which:
--   * is scoped to the caller's own businesses via owns_business(),
--     exactly like the existing SECURITY DEFINER helpers, and
--   * returns contact_name/contact_email/contact_phone as null unless
--     match_status has reached 'connected' (or a later terminal state).
--
-- This closes the gap at the database layer, not just in the UI: a
-- business calling the REST API directly (e.g. `select=contact_email`
-- against `/rest/v1/leads`) can no longer read another opportunity's
-- contact fields early, because no RLS policy grants it row access to
-- `leads` at all anymore -- only this function's own internal check does.
drop policy "Matched businesses view their leads" on public.leads;

create or replace function public.get_business_opportunities(target_match_id uuid default null)
returns table (
  match_id uuid,
  lead_id uuid,
  business_id uuid,
  match_score numeric(5,2),
  match_status public.match_status,
  matched_at timestamptz,
  viewed_at timestamptz,
  interested_at timestamptz,
  connected_at timestamptz,
  resolved_at timestamptz,
  plan_title text,
  plan_description text,
  budget_range public.budget_range,
  timeline public.project_timeline,
  city_name text,
  category_names text[],
  contact_name text,
  contact_email text,
  contact_phone text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    lm.id as match_id,
    lm.lead_id,
    lm.business_id,
    lm.match_score,
    lm.match_status,
    lm.created_at as matched_at,
    lm.viewed_at,
    lm.interested_at,
    lm.connected_at,
    lm.resolved_at,
    pp.title as plan_title,
    pp.description as plan_description,
    pp.budget_range,
    pp.timeline,
    c.name as city_name,
    (
      select array_agg(cat.name order by cat.name)
      from public.project_plan_categories ppc
      join public.categories cat on cat.id = ppc.category_id
      where ppc.plan_id = pp.id
    ) as category_names,
    -- Project information first; personal information only once a
    -- legitimate connection has occurred.
    case when lm.match_status in ('connected', 'won', 'lost') then l.contact_name else null end as contact_name,
    case when lm.match_status in ('connected', 'won', 'lost') then l.contact_email else null end as contact_email,
    case when lm.match_status in ('connected', 'won', 'lost') then l.contact_phone else null end as contact_phone
  from public.lead_matches lm
  join public.leads l on l.id = lm.lead_id
  left join public.project_plans pp on pp.id = l.project_plan_id
  left join public.cities c on c.id = pp.city_id
  where public.owns_business(lm.business_id)
    and (target_match_id is null or lm.id = target_match_id)
  order by lm.created_at desc;
$$;

comment on function public.get_business_opportunities(uuid) is
  'Returns the calling user''s own businesses'' matched opportunities, with homeowner contact fields masked until match_status reaches connected/won/lost. Pass a match id to fetch a single opportunity, or omit for the full list.';

revoke all on function public.get_business_opportunities(uuid) from public;
grant execute on function public.get_business_opportunities(uuid) to authenticated;
