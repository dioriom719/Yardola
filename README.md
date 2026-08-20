# Yardola

Yardola is a visual backyard-project marketplace connecting homeowners with
backyard-project inspiration, project planning, and local professionals.
Initial market: Las Vegas, Nevada.

> **Discover what you want -> Plan what you want -> Find someone who can
> build it.**

This repository is currently in **Phase 1: Foundation**. It establishes the
app shell, design system, and component structure that later phases will
build on. No database schema, authentication, or discovery features exist
yet.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, client utilities only for now)
- Deployed on [Vercel](https://vercel.com)

## Getting started

### Prerequisites

- Node.js 20+
- npm

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

## What's not built yet

By design, Phase 1 does not include: database schema, authentication,
project/business discovery pages, the project planner, the lead system,
dashboards, SEO page generation, payments, or AI features. These are
scoped for later phases.
