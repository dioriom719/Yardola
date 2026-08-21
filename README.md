# YARDOLO

YARDOLO is a visual backyard-project marketplace connecting homeowners with
backyard-project inspiration, project planning, and local professionals.
Initial market: Las Vegas, Nevada.

> **Discover what you want -> Plan what you want -> Find someone who can
> build it.**

This repository has completed **Phase 12: Production Launch Setup &
Deployment Preparation**. Phases 1-9 built the product end to end: the
public discovery/SEO surface, homeowner auth and project planner, lead
matching and routing, the business portal, and Stripe-backed business
billing. Phase 10 audited the whole codebase for production readiness.
Phase 11 re-verified every one of those claims live against a fresh
local stack. Phase 12 reviewed hosting/deployment readiness specifically
(Vercel/Next.js compatibility, environment-variable contract, a real
CI-reliability bug fixed in the `typecheck` script) and reorganized the
launch checklist around who can act on each remaining item. What remains
is exclusively what requires real production credentials and decisions
this repository cannot hold or make: a live Supabase project, a live
Stripe account with confirmed pricing, a chosen domain, and hosting
access -- see [`docs/PRODUCTION-LAUNCH.md`](docs/PRODUCTION-LAUNCH.md)
for the full launch checklist.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) primitives
- [Supabase](https://supabase.com) (Postgres, RLS-first schema, Auth, Storage)
- [Stripe](https://stripe.com) (Checkout, Customer Portal, webhooks) for business billing
- Deployed on [Vercel](https://vercel.com)

## What's implemented

**Public / SEO surface** -- homepage, project discovery (`/projects`,
category and category+location pages), individual project pages,
professional directory and profiles (`/professionals`), guides
(`/guides`), location pages (`/locations`). Every indexable page has
centralized metadata, Open Graph, JSON-LD structured data, breadcrumbs,
and indexability thresholds (thin pages stay `noindex` until they have
enough content). A split sitemap (`/sitemap/{section}.xml`) and
`robots.txt` list/exclude exactly the intended public URLs.

**Homeowner** -- signup/login/logout/password reset via Supabase Auth,
a 9-step project planner (`/plan`) with autosave-per-step, backyard photo
uploads to a private Supabase Storage bucket, saved projects
(`/account/saved`), a plan list with archive/restore/delete
(`/account/plans`), and plan submission that creates/routes a lead.
Homeowners are never charged.

**Lead matching & routing** -- submitting a plan creates a `lead` exactly
once (idempotent resubmission) and automatically scores and routes it to
up to 5 active businesses (`match_lead()`), weighted on category fit,
location fit, service fit, project-type fit, and business quality. Lead
status and `lead_events` track the lifecycle.

**Business portal** -- business signup/claim workflow, a dashboard
(`/business`), profile/services/service-area management, a lead inbox
(`/business/leads`) scoped to the business's own matched leads, and a
billing page (`/business/billing/[businessId]`).

**Business billing (Stripe)** -- a configurable plan catalog (`plans`
table: Basic/Featured/Premium in `supabase/seed.sql`, editable without a
code change), Stripe Checkout for subscribing, the Stripe Customer Portal
for payment-method/invoice management, a signature-verified idempotent
webhook handler (`/api/webhooks/stripe`) that is the sole writer of
subscription/transaction state, and a server-side lead-visibility
entitlement (`max_active_leads` per plan) that falls back to the Basic
plan's limit for businesses that haven't subscribed, so it never blocks
existing dev/test data.

## Route structure

```
/                                   Homepage
/projects, /projects/[category], /projects/[category]/[city]
/projects/[slug]                    Individual project
/professionals, /professionals/[slug]
/locations/[city]
/guides, /guides/[slug]

/login, /signup, /forgot-password, /reset-password, /auth/confirm

/account, /account/settings         Homeowner dashboard (auth required)
/account/saved                      Saved projects
/account/plans, /account/plans/[id] Project plans
/plan                               Planner wizard
/plan/start                         Start-a-plan redirect helper

/business                                    Dashboard (auth required)
/business/onboarding, /business/claim[/id]   Create/claim a listing
/business/settings/[id], /business/services/[id]
/business/leads                              Matched lead inbox
/business/billing/[id]                       Subscription/billing

/api/webhooks/stripe                Stripe webhook endpoint (unauthenticated, signature-verified)
/robots.txt, /sitemap/[section].xml
```

`/account`, `/plan`, and `/business` (and everything under them) require
authentication -- enforced by `proxy.ts` (Next.js 16's renamed
middleware) as a UX guard, with Row Level Security as the real
authorization layer underneath. All of them, plus the auth flow itself
and `/api/`, are excluded from `robots.txt` and carry `noindex` metadata.

## Database

Schema lives entirely in `supabase/migrations/*.sql`, applied in order;
`supabase/seed.sql` provides representative dev/demo data (fictional
businesses, projects, guides, and the pricing plan catalog -- no real
users, plans, leads, or billing data, since those need real Supabase Auth
users).

Every table has Row Level Security enabled and a policy set following one
recurring pattern: public tables (`categories`, `cities`, active
`businesses`, etc.) are readable by `anon`/`authenticated`; private
tables (`project_plans`, `leads`, `subscriptions`, `transactions`,
`business_billing`, ...) are scoped to their owner via a
`SECURITY DEFINER` helper function (`owns_business()`,
`owns_project_plan()`, `lead_belongs_to_caller()`, etc., each with a
pinned `search_path` to prevent hijacking); admins get a blanket
`is_admin()` policy on everything. Business billing state
(`subscriptions`, `transactions`, `business_billing`,
`stripe_webhook_events`) has **no owner-write policy at all** -- a
business can view its own billing state but cannot mutate it; only the
service role (used exclusively by the Stripe webhook handler and, after
independently re-verifying ownership, the checkout/portal server
actions) can write it.

Key tables: `profiles`, `businesses` (+ `business_profiles`,
`business_services`, `business_service_areas`, `business_claims`),
`projects` (+ photos/taxonomy), `project_plans` (+ categories/styles/
features/photos/inspiration), `leads` / `lead_matches` / `lead_events`,
`saved_projects`, `guides`, `plans` / `subscriptions` / `transactions` /
`business_billing` / `stripe_webhook_events`.

## Authentication

Supabase Auth (email/password). `src/lib/supabase/{client,server,
service}.ts` provide three clients: a browser client, a per-request
server client (cookie-based session, RLS-respecting -- used for
essentially everything), and a service-role client (bypasses RLS,
server-only, used only by the Stripe webhook handler and after an
explicit ownership check in billing server actions). `next` redirect
parameters are validated against same-site relative paths only (never an
attacker-supplied absolute URL) before being used in a redirect.

## SEO system

`src/lib/seo/` centralizes every indexability rule: `config.ts` holds
indexability thresholds and the `robots.txt` disallow list,
`metadata.ts` builds every page's title/description/canonical/OG/
Twitter/robots tags through one function (`buildMetadata`),
`structured-data.ts` emits JSON-LD, `sitemap-data.ts` / `counts.ts`
provide the qualifying-URL queries behind `app/sitemap.ts`. Nothing else
in the app should hand-roll metadata or hard-code a threshold number.

## Local development

### Prerequisites

- Node.js 20+
- npm
- [Docker](https://docs.docker.com/get-docker/) -- required to run Supabase locally

### Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npx supabase start           # starts the local Supabase stack
npx supabase db reset        # applies every migration + seed data
npm run dev
```

### Environment variables

See `.env.example` for the authoritative, up-to-date list. Summary:

| Variable                        | Required                   | Where                 | Notes                                                                                                                                                  |
| ------------------------------- | -------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | always                     | client + server       | from `supabase status` locally, or your Supabase project                                                                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | always                     | client + server       | anon/public key -- safe to expose                                                                                                                      |
| `NEXT_PUBLIC_SITE_URL`          | **required in production** | server (URL building) | optional locally (defaults to `http://localhost:3000`); in production a missing value now throws at request time instead of silently guessing a domain |
| `SUPABASE_SERVICE_ROLE_KEY`     | always                     | server only           | bypasses RLS -- never expose to the browser                                                                                                            |
| `STRIPE_SECRET_KEY`             | always                     | server only           | test-mode key locally, live key in production                                                                                                          |
| `STRIPE_WEBHOOK_SECRET`         | always                     | server only           | from `stripe listen` locally, or the Stripe dashboard's webhook endpoint in production                                                                 |

Server-only secrets are read through `src/lib/env.ts`'s `requireEnv()`
helper, which throws a clear `Missing required environment variable: X`
error rather than failing obscurely later. They're only ever imported
from Server Actions and Route Handlers (`src/app/actions/billing.ts`,
`src/app/api/webhooks/stripe/route.ts`, and the two server-only client
factories) -- never from a Client Component, and never inlined into the
client JS bundle (verified: only `NEXT_PUBLIC_`-prefixed variables are).

### Supabase

- `npm run db:start` / `db:stop` -- start/stop the local stack
- `npm run db:reset` -- drop, recreate, apply all migrations, seed
- `npm run db:migration:new <name>` -- scaffold a new migration
- Never edit an already-applied migration; add a new one instead
  (see `supabase/migrations/20260821010000_drop_dead_match_score_function.sql`
  for an example production-safe cleanup migration).

### Stripe (local)

Real Stripe API calls (Checkout/Customer Portal session creation) need a
real Stripe test-mode secret key. To exercise the webhook handler without
one, either:

- run the Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
  against a real test-mode account, or
- send a self-signed synthetic event using the `stripe` npm package's
  `stripe.webhooks.generateTestHeaderString()` against your own
  `STRIPE_WEBHOOK_SECRET` -- this is how Phase 9/10 testing verified
  signature verification, idempotency, and the full subscription/invoice
  lifecycle without any real Stripe credentials.

## Testing commands

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run format:check  # prettier --check .
npm run build         # production build
```

There is no automated test suite (unit/integration/e2e) checked into the
repo. Every phase's browser/API/RLS regression testing was performed
live against a local Supabase stack with Playwright and direct
`psql`/REST calls, then the temporary test scripts and dependencies were
removed before committing -- see each phase's commit history and
`docs/PRODUCTION-LAUNCH.md` for what was and wasn't verified this way.

## Production deployment

See [`docs/PRODUCTION-LAUNCH.md`](docs/PRODUCTION-LAUNCH.md) for the full
checklist. In short: provision a real Supabase project and apply every
migration, set all required environment variables (including a real
`NEXT_PUBLIC_SITE_URL`), configure Stripe in live mode (products/prices,
webhook endpoint, signing secret), and re-run the smoke tests against the
deployed environment -- local verification does not substitute for
production verification.
