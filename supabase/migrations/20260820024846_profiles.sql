-- profiles: one row per authenticated user (1:1 with auth.users).
--
-- Supabase Auth (auth.users) owns credentials -- no passwords or auth
-- secrets are stored here. `email` is cached on the profile for
-- convenient querying/joins but auth.users remains the source of truth.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'homeowner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Application profile for an authenticated user. 1:1 with auth.users.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create index profiles_role_idx on public.profiles (role);

-- Automatically create a profile row whenever a new Supabase Auth user is
-- created, seeded from whatever the client passed as signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'homeowner')
  );
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a public.profiles row whenever a new auth.users row is inserted.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Role-check helpers ---------------------------------------------------
--
-- SECURITY DEFINER + a fixed search_path lets these bypass RLS internally
-- so they can safely be called *from inside* RLS policies (including
-- policies on public.profiles itself) without recursing back through RLS.

create or replace function public.current_role_name()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

comment on function public.current_role_name() is
  'Returns the caller''s profiles.role, or null if unauthenticated / no profile.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() = 'admin', false);
$$;

comment on function public.is_admin() is 'True if the calling user has the admin role.';

-- Row Level Security --------------------------------------------------

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Profiles are updatable by their owner"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "Admins can manage all profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
