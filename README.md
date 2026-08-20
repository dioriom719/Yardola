# Yardola

Yardola is a visual backyard-project marketplace connecting homeowners with
backyard-project inspiration, project planning, and local professionals.
Initial market: Las Vegas, Nevada.

> **Discover what you want -> Plan what you want -> Find someone who can
> build it.**

This repository is currently through **Phase 2: Database Foundation**.
Phase 1 established the app shell, design system, and component structure.
Phase 2 adds the production-ready Supabase/Postgres schema, RLS policies,
and dev seed data. No public discovery pages, authentication UI, project
planner, lead routing, or dashboards exist yet -- see
[What's not built yet](#whats-not-built-yet).

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, with a full V1 schema + RLS -- see [Database](#database))
- Deployed on [Vercel](https://vercel.com)

## Getting started

### Prerequisites

- Node.js 20+
- npm
- [Docker](https://docs.docker.com/get-docker/) -- required to run Supabase locally (`supabase start`)

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project
values (from Project Settings -> API in the Supabase dashboard):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The app will build and run without these set, but any code that calls the
Supabase client utilities will throw until they're provided.

### Database

The schema lives entirely in versioned SQL migrations under
`supabase/migrations/`, applied in filename (timestamp) order. Nothing
touches a database outside of a migration -- see
[Migrations](#migrations) below.

#### Run Supabase locally

```bash
npm run db:start   # starts local Postgres + Studio + Auth via Docker
```

This prints a local `API URL`, `anon key`, and `service_role key` --
copy the `API URL` and `anon key` into `.env.local` as
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Local
Supabase Studio (a database browser/UI) is available at the printed
Studio URL (typically http://localhost:54323).

```bash
npm run db:stop    # stops the local stack
```

#### Migrations

```bash
npm run db:migration:new <name>   # scaffold a new timestamped migration file
npm run db:reset                  # re-applies every migration from scratch, then runs supabase/seed.sql
```

`db:reset` is destructive to your **local** database only -- it drops and
rebuilds it from the migrations. Never run it against a production
project. Production schema changes are applied by pushing new migration
files through your normal deploy process (e.g. `supabase db push` against
a linked project) -- the database itself is never edited by hand.

#### Seed data

`supabase/seed.sql` is dev-only fixture data (~10 businesses, ~30
projects, categories/services/features/styles, and Las Vegas-area
locations) -- clearly not production data (every business/project is
fictional and photos are placeholder images). It runs automatically as
part of `npm run db:reset`.

#### Generate TypeScript types from the schema

```bash
npm run db:types   # writes src/types/database.types.ts from the local database
```

Requires the local Supabase stack to be running (`npm run db:start`).

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

```bash
npm run build         # production build
npm run start          # run the production build locally
npm run lint            # eslint
npm run typecheck      # tsc --noEmit
npm run format         # prettier -- write
npm run format:check  # prettier -- check only
```

## Project structure

```
src/
  app/                  # Next.js App Router routes, layout, global styles
  components/
    ui/                 # Foundational, generic UI primitives (shadcn/ui)
    layout/              # App shell: navbar, footer
    yardola/             # Yardola-specific components (project cards, etc.)
  lib/
    supabase/            # Supabase client/server utility factories
    env.ts               # Typed environment variable access
    utils.ts              # Shared helpers (e.g. `cn`)
  types/                 # Shared TypeScript types
supabase/
  migrations/            # Versioned SQL migrations (schema, RLS, indexes)
  seed.sql                # Dev-only fixture data -- not production data
  config.toml             # Local Supabase stack configuration
```

## Design system

Brand tokens (colors, fonts, radii) live in `src/app/globals.css` as CSS
custom properties consumed by Tailwind v4's `@theme inline`. Key tokens:

- Colors: `primary` (Yardola Green), `secondary`/`accent` (Warm Sand),
  `background` (Cream), plus raw brand colors `yardola-green`,
  `deep-forest`, `warm-sand`, `cream`, `charcoal`.
- Fonts: `font-display` (DM Serif Display, used for headings) and
  `font-sans` (Inter, used for body/UI text).

The visual direction favors editorial layouts, generous white space, and
photography over heavy color, gradients, or shadows.

## Database schema overview

The full schema is defined across `supabase/migrations/`. Broad groups:

- **Identity**: `profiles` (1:1 with Supabase `auth.users`, created
  automatically on signup via a trigger).
- **Locations**: `states` -> `metros` -> `cities` -> `neighborhoods` ->
  `zip_codes`, Yardola's curated taxonomy for browse/SEO pages (V1 seeds
  Nevada / Las Vegas metro only).
- **Taxonomy**: `categories`, `services` (per category), `features`,
  `styles` -- lookup tables rather than enums so admins can expand them
  without a migration.
- **Businesses**: `businesses`, `business_profiles` (public presentation
  content), `professionals`, `business_services`,
  `business_service_areas`.
- **Projects**: `projects` (the core entity) plus `project_categories`,
  `project_services`, `project_styles`, `project_features`,
  `project_photos`.
- **Planning & leads**: `project_plans`, `leads`, `lead_matches`,
  `lead_events`. Match scoring and lead routing logic land in a later
  phase -- this phase only stores the resulting data.
- **Saved projects & claims**: `saved_projects`, `business_claims`.
- **Content**: `guides`.
- **Monetization**: `plans`, `subscriptions`, `transactions` -- schema
  only, no payment provider wired up yet.

Every table has Row Level Security enabled. Roughly: reference/lookup
data and published content is publicly readable; homeowners manage their
own profile, project plans, saved projects, and leads; business users
manage businesses/projects they own; admins can manage everything. See
the RLS policies inline in each migration for the exact rules.

## What's not built yet

By design, this repository does not yet include: authentication UI,
public project/business discovery pages, the project planner UI, lead
routing/matching logic, business dashboards, admin dashboards, SEO page
generation, Stripe/payment integration, or AI features. These are scoped
for later phases.
