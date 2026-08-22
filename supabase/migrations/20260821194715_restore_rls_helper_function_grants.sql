-- Restore EXECUTE privileges required by RLS policies.
-- These functions remain SECURITY DEFINER with fixed search_path; granting
-- EXECUTE does not bypass the RLS predicates that call them.
grant execute on function public.business_is_public(uuid) to anon, authenticated;
grant execute on function public.project_is_public(uuid) to anon, authenticated;
grant execute on function public.current_role_name() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_business(uuid) to authenticated;
grant execute on function public.owns_project(uuid) to authenticated;
grant execute on function public.owns_project_plan(uuid) to authenticated;
grant execute on function public.lead_belongs_to_caller(uuid) to authenticated;
grant execute on function public.lead_matches_caller_business(uuid) to authenticated;