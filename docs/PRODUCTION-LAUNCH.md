# YARDOLO Production Launch Checklist

Last updated by Phase 19. This document is organized around one question
for every item: **who or what can act on this next?** Five categories:

- **COMPLETED IN CODE** -- implemented and verified (see verification
  method for each item); no further code work is needed.
- **REQUIRES USER CREDENTIALS** -- blocked purely on access this sandbox
  does not have (a real Supabase project, a real Stripe account, hosting
  access). No decision is needed, just the credential.
- **REQUIRES USER DECISION** -- blocked on a choice only the product
  owner can make (domain). Providing credentials alone would not unblock
  these. (Pricing was in this category through Phase 14; it was locked in
  Phase 15 -- see below.)
- **REQUIRES DEPLOYMENT** -- can only be done once the app is actually
  running somewhere real (not local Docker).
- **REQUIRES POST-DEPLOYMENT VERIFICATION** -- must be manually re-checked
  against the real deployed app; local verification does not substitute.

**Nothing in this document is marked complete because it "works
locally."** Every COMPLETED IN CODE item below states its verification
method. Everything else is genuinely blocked on something outside this
repository.

---

## Phase 19 update: hosted preview deployment preparation

Phase 19's goal was LOCAL -> VERCEL PREVIEW -> real Supabase/Stripe test
environment -> hosted QA -> production-ready. As of this phase: **no
Vercel, Supabase, or Stripe credentials or connectors are available in
this sandbox** -- the same credential boundary documented since Phase 10.
Nothing was deployed anywhere. This phase therefore prepared the
repository so a Preview deployment works cleanly once you connect a real
Vercel project, and documented the exact manual steps below instead of
fabricating a deployment.

Two real (not hypothetical) deployment blockers were found and fixed in
code this phase:

- [x] **`env.siteUrl` would throw on Vercel Preview deployments.**
      `NEXT_PUBLIC_SITE_URL` is intentionally required in any
      `NODE_ENV=production` build (see above) -- but Vercel builds _both_
      Preview and Production deployments with `NODE_ENV=production`, and
      Preview deployments each get a unique, dynamically-assigned URL, so
      there is no single domain to hardcode into `NEXT_PUBLIC_SITE_URL`
      for Preview. Fixed in `src/lib/env.ts`: `siteUrl` now falls back to
      Vercel's auto-injected `NEXT_PUBLIC_VERCEL_URL` (that deployment's
      own host) before failing. Leave `NEXT_PUBLIC_SITE_URL` **unset** on
      the Preview environment in Vercel so this fallback engages; set it
      explicitly to the real domain on Production once one exists.
- [x] **No preview-vs-production indexability distinction existed.**
      `robots.ts` unconditionally allowed crawling and every page's
      `index` flag was honored as-is, which would let a temporary
      `*.vercel.app` preview link get crawled and indexed by search
      engines under YARDOLO's name before a real domain exists. Fixed
      with one new flag, `SITE_IS_PUBLICLY_INDEXABLE`
      (`src/lib/seo/config.ts`) -- `false` whenever `SITE_URL` contains
      `.vercel.app`, `true` otherwise (including local dev and, once set,
      a real production domain -- no further code change needed then).
      Wired into three layers of defense: `src/app/robots.ts` returns a
      blanket `disallow: "/"` instead of the normal ruleset;
      `src/lib/seo/metadata.ts`'s `robotsFor()` forces every page's meta
      `robots` tag to `noindex` regardless of what the caller asked for;
      `src/app/sitemap.ts` returns empty sections rather than real
      content URLs. All three self-correct automatically once
      `NEXT_PUBLIC_SITE_URL` is set to a real (non-`vercel.app`) domain.

No other code changes were required -- `package.json`, `next.config.ts`,
`proxy.ts`/`src/lib/supabase/middleware.ts`, the auth server actions, the
Stripe billing/webhook routes, and `.env.example` were all re-audited this
phase and found already correct for Preview deployment (all redirect/
canonical/checkout URLs already route through `env.siteUrl`, which now
resolves correctly on Preview thanks to the fix above).

### Exact steps to get a real Vercel Preview deployment

1. In the Vercel dashboard, "Add New... -> Project", import
   `dioriom719/Yardola` (or `dioriom719/Yardolo` -- same repository, see
   below) from GitHub.
2. Framework preset: Next.js (auto-detected). Build/output settings:
   leave at Vercel's Next.js defaults -- nothing in this repo needs a
   custom build command, output directory, or root directory.
3. In Project Settings -> Git, confirm the Production Branch is whatever
   you intend for eventual production (do **not** set it to `yardolo` if
   you want Production to stay untouched during this preview phase) --
   pushing to `yardolo` will still trigger a Preview deployment for that
   branch regardless of which branch is set as Production.
4. In Project Settings -> Environment Variables, add these for the
   **Preview** environment only (uncheck Production/Development if the UI
   defaults to all three):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY` (test mode)
   - `STRIPE_WEBHOOK_SECRET` (test mode)
   - Do **not** set `NEXT_PUBLIC_SITE_URL` for Preview -- leave it unset
     so the `NEXT_PUBLIC_VERCEL_URL` fallback added this phase engages.
5. In Project Settings -> Environment Variables (bottom of page), enable
   "Automatically expose System Environment Variables" -- this is what
   makes `NEXT_PUBLIC_VERCEL_URL` exist at build time; without it the
   fallback in step 4 has nothing to read and the build will fail on the
   missing-`NEXT_PUBLIC_SITE_URL` error by design (fail loud, not guess).
6. Deploy the `yardolo` branch (push to it, or trigger manually from the
   Vercel dashboard). Do not promote the result to Production and do not
   attach a custom domain -- this is a Preview-only exercise per this
   phase's explicit instructions.
7. Once the four remaining sections below (Supabase, Auth, Stripe) are
   also configured with real test-mode credentials, the Preview URL
   Vercel gives you is what hosted QA (hosted browser testing, hosted
   security verification, visual QA, performance) in a later phase will
   run against. None of that testing was possible this phase since no
   Preview deployment exists yet.

**Production-safety confirmation:** this phase created no live Stripe
Products/Prices/customers/billing objects (no Stripe credentials were
available to create anything with, test or live), purchased no domain,
made no DNS change, deployed nothing anywhere, and did not alter
marketplace scoring, RLS policies, PII masking, or locked pricing. Every
change this phase was either a documentation update or one of the two
code fixes described above.

---

## COMPLETED IN CODE

Verified as of Phase 12 (branch `yardolo`, commit `d62e99b` and this
phase's follow-up commit). Phase 11 already performed comprehensive live
verification (RLS, storage isolation, Stripe webhook, homeowner/business
flows, SEO, branding) against a fresh local Supabase stack -- that work
is not repeated here since the schema and application code are unchanged
since then. Phase 12 re-confirmed the baseline (`git status`, brand text,
quality gate) and reviewed hosting/deployment-specific concerns.

- [x] **Database schema & RLS.** All 20 migrations apply cleanly in
      order against a fresh database; RLS is enabled on all 38 tables;
      all 14 `SECURITY DEFINER` functions have a pinned `search_path`.
      Verified live in Phase 11 via direct `pg_class`/`pg_proc` queries
      and a full `supabase db reset`; unchanged since (no migration
      files were added or modified this phase).
- [x] **Cross-account security isolation.** Homeowner-to-homeowner,
      business-to-business, and anonymous-access isolation, including
      rejected id-spoofing attempts. Verified live in Phase 11 with 4 real
      Supabase Auth accounts against the REST API (14/14 assertions).
- [x] **Storage bucket isolation.** `homeowner-uploads` is private;
      per-user folder isolation enforced by RLS on `storage.objects`;
      signed URLs work before expiry and are rejected after. Verified
      live in Phase 11 with real uploads/reads across two accounts.
- [x] **Stripe webhook handler** (`/api/webhooks/stripe`): signature
      verification (invalid signatures rejected with 400), idempotency
      (a replayed event id produces zero new database rows, not just a
      short-circuited HTTP response), and correct event handling for
      `checkout.session.completed`, `customer.subscription.created`
      (shares its handler with `.updated`/`.deleted`), and `invoice.paid`
      (shares its handler with `.payment_failed`). Verified live in
      Phase 11 with self-signed synthetic Stripe events against the real
      route and real database writes.
- [x] **Billing UI + entitlement logic.** Full live flow -- signup,
      business onboarding, webhook-driven subscription activation,
      billing page rendering the resulting plan/status/renewal date --
      with zero browser console errors. `getLeadEntitlement`'s per-plan
      lead cap reviewed this phase (`src/lib/data/business-leads.ts`):
      server-side, scoped to the caller's own `owner_id`-filtered
      businesses, falls back to the Basic plan's limit for businesses
      with no subscription. The client cannot mark itself paid -- only
      the signature-verified webhook path (service-role client) writes
      `subscriptions`/`transactions`/`business_billing`; a failed real
      Stripe API call (tested this phase against a placeholder key)
      fails gracefully rather than crashing.
- [x] **URL/domain construction.** Reviewed this phase: canonical URLs,
      Open Graph, Twitter metadata, and JSON-LD all resolve through
      `SITE_URL` (`src/lib/seo/config.ts`, derived from `env.siteUrl`);
      the sitemap and `robots.txt` do the same; Stripe Checkout/Portal
      success/cancel/return URLs use `env.siteUrl` directly
      (`src/app/actions/billing.ts`); the password-recovery email link
      uses `absoluteUrl()` (also `SITE_URL`-derived), not the inbound
      request's origin, so a spoofed `Host` header can't redirect a
      recovery email. No hardcoded domain exists anywhere in the
      application. `NEXT_PUBLIC_SITE_URL` is a hard-required environment
      variable in production -- `env.siteUrl` throws rather than
      guessing if it's missing (`src/lib/env.ts`).
- [x] **Hosting compatibility reviewed** (Phase 12, see PART 2 notes
      below): no `vercel.json` or other hosting-specific configuration
      file exists, and none was added -- this is a standard Next.js App
      Router app with no monorepo, custom output mode, or non-standard
      runtime requirement. `next.config.ts` only configures
      `images.remotePatterns` (a dev placeholder host plus the Supabase
      storage host, derived from `NEXT_PUBLIC_SUPABASE_URL` at build
      time -- this must be set as a build-time environment variable on
      whatever host is used, not just a runtime one). `proxy.ts`
      (Next.js 16's middleware) uses `@supabase/ssr`'s fetch-based
      client with no Node-only APIs, so it is Edge-runtime compatible.
      The Stripe webhook route has no `runtime` export, so it correctly
      uses the default Node.js runtime (required for the Stripe SDK and
      raw-body signature verification).
- [x] **Bug fixed this phase:** `npm run typecheck` was a bare
      `tsc --noEmit`, which fails on a completely clean checkout (a new
      CI runner, a fresh clone with no cached `.next/`) because Next.js
      16's route/layout prop types (`PageProps`, `LayoutProps`) are
      generated into `.next/types/` and are not committed to the repo.
      `next build` generates them internally so a full build always
      works, but an isolated typecheck-only CI step would fail on a
      clean checkout. Fixed by changing the script to
      `next typegen && tsc --noEmit` (`package.json`). Verified by
      deleting `.next` and re-running `npm run typecheck` from a
      genuinely clean state.
- [x] **Quality gate:** typecheck, lint, format check, and a production
      build (`next build`, 34 routes) all pass with zero errors on the
      `yardolo` branch after the fix above.
- [x] **Repository/branch state.** Working tree clean; current branch
      `yardolo` is up to date with `origin/yardolo` and is GitHub's
      default branch (confirmed via `git remote show origin`), containing
      all Phase 1-11 work. The remote origin URL still reads
      `dioriom719/Yardola`, which is the same repository as
      `dioriom719/Yardolo` under GitHub's rename redirect (confirmed in
      Phase 11 via `search_repositories`: one repository, one id, renamed
      -- not a duplicate).
- [x] **Branding.** The wordmark reads "YARDOLO" and the tagline reads
      exactly "YOUR BACKYARD STARTS HERE." (`src/components/yardola/logo.tsx`).
      The old "Discover. Plan. Build." tagline does not exist anywhere in
      the repository. No customer-facing "Yardola"/"YARDOLA" text remains
      -- the only lowercase "yardola" left is the internal
      `src/components/yardola/` directory name, an import-path
      convention that is never rendered, left untouched per the standing
      instruction not to rename internal paths without an actual
      user-facing problem.
- [x] No `.env*` file is committed (only `.env.example`), and
      `.gitignore` excludes them; `.env.example` contains variable names
      only, no values.

## REQUIRES USER CREDENTIALS

Purely blocked on access -- no decision needed once you provide these.

- [ ] **A real Supabase project.** Nothing in this repository can create
      or connect to one without a project URL and keys only you can
      generate from the Supabase dashboard.
- [ ] **A real Stripe account** (test mode to start). Needed before a
      webhook endpoint, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET`
      can exist.
- [ ] **Hosting account access** (e.g. a Vercel account/API token, or
      whatever host you choose). No deployment was attempted -- none is
      available in this sandbox.

## REQUIRES USER DECISION

Blocked on a choice, not a credential -- providing access alone would not
unblock these.

- [x] ~~Confirmed production pricing~~ -- **locked as of Phase 15**: Basic
      $0/mo, Featured $299/mo, Premium $699/mo. `supabase/seed.sql`
      reflects this. This is approved launch pricing, not placeholder
      data. What's still pending is the credential/action items below --
      creating the matching Stripe Products/Prices -- not the pricing
      decision itself.
- [ ] **A production domain.** Nothing in this repository specifies or
      guesses one. `NEXT_PUBLIC_SITE_URL` remains unset with no
      committed real-domain value.
- [ ] **Hosting platform choice.** Vercel is implied by the existing
      docs/README as the presumed target, but no Vercel account has been
      connected and nothing in the codebase requires Vercel specifically
      -- confirm Vercel or name another Next.js-compatible host.

## REQUIRES DEPLOYMENT

Can only happen once the app is running somewhere real.

- [ ] Deploy the application to the chosen host with all six required
      environment variables set (`NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
      `NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- [ ] Point the production domain's DNS at the host once both are chosen.
- [ ] Create the Stripe webhook endpoint pointing at
      `https://<domain>/api/webhooks/stripe` (requires a live, reachable
      URL, so this necessarily comes after deployment).

## REQUIRES POST-DEPLOYMENT VERIFICATION

Local verification (see COMPLETED IN CODE) does not substitute for this,
no matter how thorough -- it ran against local Docker containers with
synthetic data, self-signed webhook events, and no real domain. After
deploying with real credentials, manually verify at minimum:

1. Homepage and public project/category/location pages load.
2. Homeowner signup receives a real confirmation email (if enabled)
   linking to the real production domain, not `localhost`.
3. Login/logout works; planner submission creates and matches a lead.
4. Business onboarding, dashboard, and billing page load correctly.
5. Stripe Checkout completes in TEST mode with a test card
   (`4242 4242 4242 4242`) and the billing page shows the subscription
   active within a few seconds -- proves the webhook is reachable over
   the real internet, not just locally.
6. The Stripe Customer Portal opens for the correct customer.
7. Cancelling a subscription updates status once Stripe's webhook fires.
8. Manually resending one webhook event from the Stripe dashboard does
   not duplicate any row (idempotency holds in production, not just
   locally).
9. `https://<domain>/robots.txt` and `https://<domain>/sitemap/core.xml`
   resolve with the real domain, not `localhost`.
10. Canonical URLs, Open Graph tags, and JSON-LD on a public page use the
    real production domain (view-source to confirm).
11. Favicon and Apple touch icon render correctly on the real domain.
12. A private page (e.g. `/business/billing/<id>`) redirects a
    logged-out visitor on the real domain.
13. No console errors on the homepage, planner, business dashboard, or
    billing page in production.

**Phase 19 status: none of the above 13 items have been verified against
a real hosted deployment.** No Preview URL exists yet (see the Phase 19
section above) -- this whole checklist, plus the phase's additional
hosted-security and visual-QA checklists, remain blocked until you
complete the Vercel + Supabase + Stripe setup steps in this document and
share the resulting Preview URL.

---

## Manual Supabase setup steps (for whoever has project access)

1. Create a Supabase project.
2. Apply every migration in order: `supabase db push`, or run each file
   in `supabase/migrations/` via the SQL editor in filename order --
   never skip, reorder, or edit an already-applied one.
3. **Do not run `supabase/seed.sql` against production.** It is
   explicitly fictional/dev-only data: fake businesses, projects,
   guides, and placeholder images. Production should receive migrations
   only -- no seed data of any kind, not even the `plans` rows (the
   locked pricing they contain is correct -- see below -- but the row
   still needs to be inserted directly, not via this file). This
   repository's development data and its production setup are
   intentionally two separate paths; nothing in `supabase/seed.sql`
   should ever be copied into a production database, in whole or in
   part.
4. Copy the project's URL, anon key, and service_role key into your
   hosting provider's environment variables.
5. Once real Stripe Products/Prices exist (see below), populate the
   production `plans` table's `stripe_product_id`/`stripe_price_id`
   columns directly via SQL or the Supabase dashboard -- never by
   editing `supabase/seed.sql` with real values.
6. In the Supabase dashboard (Auth -> URL Configuration), set the site
   URL and redirect URL allowlist to your real production domain. The
   `site_url`/`additional_redirect_urls` values in
   `supabase/config.toml` are local-CLI-only and have no effect on a
   hosted project. **For a Vercel Preview deployment specifically**
   (Phase 19), each deployment/push gets its own unique
   `*.vercel.app` URL, so a single exact redirect URL won't cover every
   preview build -- add a wildcard entry to the redirect allowlist, e.g.
   `https://your-project-*.vercel.app/**` (adjust the prefix to match
   your actual Vercel project's URL pattern), in addition to your
   eventual real-domain entry. Every auth redirect in this codebase
   (signup confirmation, login, logout, password reset, `/auth/confirm`)
   already builds its URL from `env.siteUrl` / `absoluteUrl()`, which
   Phase 19 taught to resolve to the correct per-deployment
   `NEXT_PUBLIC_VERCEL_URL` automatically -- so the only remaining
   Preview-specific action is this Supabase-side allowlist entry.
7. Confirm the `homeowner-uploads` storage bucket is private (created
   with `public: false` by migration; verify this wasn't overridden in
   the dashboard).

## Manual Stripe setup steps

Locked launch pricing (Phase 15): **Basic $0/mo (free, no Stripe object
needed), Featured $299/mo, Premium $699/mo.**

1. Create the Featured ($299/mo) and Premium ($699/mo) Products and
   Prices in Stripe -- test mode first, live mode only once test mode is
   fully verified. Basic is free and needs no Stripe Product/Price.
2. Copy each Price's id into the corresponding `plans.stripe_price_id`
   row.
3. Once deployed, create a webhook endpoint pointing at
   `https://<domain>/api/webhooks/stripe`, subscribed to at least:
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.paid`, `invoice.payment_failed`.
4. Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` and
   the account's secret key into `STRIPE_SECRET_KEY` (test mode for
   staging, live mode for production -- never the same key in both).
5. Enable the Stripe Customer Portal (Settings -> Billing -> Customer
   portal) with cancel/payment-method-update permissions matching what
   the billing page expects.
6. Repeat in live mode only after test mode is fully verified end to end.
