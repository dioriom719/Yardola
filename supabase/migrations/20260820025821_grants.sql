-- Data API role grants.
--
-- Supabase's PostgREST layer only reaches tables the `anon` /
-- `authenticated` roles have been GRANTed access to -- Row Level Security
-- then narrows that down to specific rows. As of the newer Supabase
-- default, new tables are NOT auto-exposed to these roles, so every
-- table needs an explicit grant here. RLS (enabled on every table above)
-- remains the real access-control layer; these grants only open the
-- door for RLS to be evaluated at all.
--
-- `authenticated` is granted write verbs broadly -- RLS policies (not
-- these grants) are what actually stop e.g. a homeowner writing to
-- another user's rows. `anon` is granted read-only access, matching that
-- every RLS select policy for anon is a "publicly visible" policy.

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

grant execute on all functions in schema public to anon, authenticated, service_role;

-- Ensure any table added by a later migration (run by the same role) is
-- automatically exposed the same way, without needing its own grants.
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
