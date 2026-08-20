-- Editorial guides (e.g. "How to Plan a Pool Remodel in Las Vegas").

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  -- Markdown body. A structured/block-based format can replace this
  -- later without touching the rest of the schema.
  content text,
  featured_image_url text,
  author_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  status public.guide_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.guides is 'Editorial content (how-tos, inspiration articles).';

create trigger set_guides_updated_at
  before update on public.guides
  for each row execute function public.set_updated_at();

create index guides_status_idx on public.guides (status);
create index guides_published_at_idx on public.guides (published_at);
create index guides_category_id_idx on public.guides (category_id);
create index guides_author_id_idx on public.guides (author_id);

-- Row Level Security --------------------------------------------------

alter table public.guides enable row level security;

create policy "Published guides are publicly readable"
  on public.guides for select
  to anon, authenticated
  using (status = 'published');

create policy "Authors view their own guides"
  on public.guides for select
  to authenticated
  using (author_id = (select auth.uid()));

create policy "Admins manage guides"
  on public.guides for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
