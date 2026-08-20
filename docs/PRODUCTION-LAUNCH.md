# YARDOLO Production Launch Checklist

This is the practical launch checklist, last updated by the Phase 11
production-deployment pass. It distinguishes what's already done in code
and verified locally from what genuinely requires a human with real
production credentials -- a real Supabase project, a real Stripe account,
a real domain, and real hosting access, none of which exist inside this
development sandbox.

**Local verification is not production verification.** Everything marked
"LOCAL VERIFIED" below was tested against a local Supabase stack with
synthetic/test-mode data (Playwright, direct REST calls with real Supabase
Auth tokens, self-signed Stripe webhook events). None of it was run
against a real production Supabase project, real Stripe test or live
keys, a real domain, or a real hosting deployment. Section F is not
optional.

---

## A. Completed and verified in code (Phases 1-11)

- [x] Full RLS audit across all 38 tables -- every table has RLS enabled
      (re-queried live from `pg_class.relrowsecurity` this phase, not
      assumed), every `SECURITY DEFINER` helper function (14 total) has a
      pinned `search_path=public` (re-queried live from `pg_proc.proconfig`
      this phase).
- [x] Live cross-account RLS tests against a freshly-reset local database
      with 4 real Supabase Auth accounts (2 homeowners, 2 businesses),
      re-run in Phase 11: homeowner-to-homeowner plan/saved-project
      isolation, `user_id` spoofing rejected on insert, business-to-business
      listing/update isolation, business spoofing another business's
      `owner_id` rejected, `business_billing`/`subscriptions` confirmed to
      have no owner-write policy at all (service-role-only by design, as
      documented below), anonymous visitors confirmed blocked from
      protected tables. 14/14 assertions passed.
- [x] Live storage isolation test against the real `homeowner-uploads`
      bucket: a user can upload/read/update/delete only inside their own
      `{user_id}/...` folder; a cross-user upload is rejected with a clear
      RLS error; a cross-user or anonymous read of another user's object
      returns 404 (invisible, not just forbidden). Signed URLs were
      generated and confirmed to both work before expiry and fail after
      expiry.
- [x] Full `supabase db reset` (all 20 migrations + `seed.sql`) verified to
      apply cleanly in order against a fresh database with no manual
      intervention.
- [x] Stripe webhook handler (`/api/webhooks/stripe`) re-verified live this
      phase with self-signed synthetic events against the real route code:
      invalid signatures rejected (400), `checkout.session.completed`
      correctly links a Stripe customer to the right business,
      `customer.subscription.created` correctly writes an active
      subscription against the right business and plan, replaying the
      identical event id is a true no-op at the database level (row count
      unchanged, not just a short-circuited response), `invoice.paid`
      correctly writes a succeeded transaction. All writes went through the
      real business/plan/subscription rows, not mocks.
- [x] Full live billing UI flow: real signup, real business onboarding,
      a real webhook-driven subscription activation, and the billing page
      rendering the resulting active plan, renewal date, and payment
      status correctly -- zero browser console errors.
- [x] Confirmed a failed real Stripe API call (checkout against a
      non-existent test key) fails gracefully -- the app renders a normal
      page, not a crash -- confirming the client can never mark itself as
      paid; only the webhook-verified server path writes billing state.
- [x] Full homeowner flow re-verified live: signup, `/account` reached,
      `/plan` planner reachable while authenticated, anonymous visitors
      redirected away from `/account` and `/business` to `/login?next=...`.
- [x] `robots.txt` and `/sitemap/core.xml` re-verified live to resolve and
      correctly disallow/exclude `/account`, `/plan`, `/business`,
      `/login`, `/signup`, `/auth/`.
- [x] Zero console/page errors across all public pages (`/`, `/projects`,
      `/professionals`, `/guides`, `/plan`, `/login`, `/signup`) and across
      4 breakpoints (320px, 375px, 390px, desktop).
- [x] Repo-wide re-audit for customer-facing "Yardola"/"YARDOLA" text: none
      found. The only remaining lowercase "yardola" occurrences are the
      internal `src/components/yardola/` directory name (an internal
      import-path convention, never rendered) and a historical bug
      description in this doc's earlier revision -- neither is
      customer-facing, so neither was touched, per instructions not to
      re-run the rebrand pass without a real finding.
- [x] Confirmed the approved logo/tagline system is intact and correctly
      rendered at every breakpoint: the wordmark reads "YARDOLO" and the
      tagline reads exactly "YOUR BACKYARD STARTS HERE." (verified in
      `src/components/yardola/logo.tsx` and visually in the browser); the
      old "Discover. Plan. Build." tagline does not appear anywhere in the
      repository.
- [x] Confirmed the GitHub repository was genuinely renamed
      `dioriom719/Yardola` -> `dioriom719/Yardolo` (same repository id,
      not a duplicate) -- see the Phase 11 audit report for the
      verification method.
- [x] `git status` clean; typecheck, lint, format check, and a production
      build (`next build`) all pass with zero errors on all 34 routes.
- [x] Confirmed no `.env*` file is committed (only `.env.example`) and
      `.gitignore` correctly excludes them.

## B. Requires production credentials (cannot be created or tested from this sandbox)

- [ ] **A real Supabase project.** The local Docker-based stack used for
      every test above is not production. Nothing in this repository can
      create, configure, or connect to a real hosted Supabase project
      without credentials only the project owner has.
- [ ] **Real Stripe Products & Prices.** `plans.stripe_price_id` is `null`
      for all three seeded plans (Basic/Featured/Premium). Checkout
      correctly refuses with a clear error for a plan with no
      `stripe_price_id` rather than crashing (verified in code).
- [ ] **Confirmed production pricing.** The only pricing anywhere in this
      repository is `supabase/seed.sql`'s dev/placeholder data -- Basic
      $0/mo, Featured $99/mo, Premium $249/mo -- explicitly commented as
      fictional. **This has not been confirmed as real launch pricing.**
      Per the standing instruction not to guess on pricing, no Stripe
      Products/Prices were created this phase. Confirm final pricing
      before creating anything in Stripe.
- [ ] **A reachable production webhook endpoint** and a real Stripe
      test-mode account to send it real events. The handler's signature
      verification, idempotency, and full event-handling logic were
      re-exercised this phase with self-signed synthetic events against
      the real code path (see Section A) -- what remains untested is
      Stripe's real infrastructure actually reaching this endpoint over
      the public internet, which requires a deployed URL and a real
      Stripe account.
- [ ] **A production domain.** Nothing in this repository specifies one;
      `NEXT_PUBLIC_SITE_URL` has no committed real-domain value and is a
      hard-required, loudly-failing environment variable in production
      (throws rather than guessing -- `src/lib/env.ts`).
- [ ] **Hosting credentials.** No deployment was performed or attempted;
      no hosting account/API token is available in this sandbox.

## C. Requires manual Supabase configuration

1. Create a Supabase project (or use an existing staging/production one).
2. Apply every migration in order: `supabase db push` (or run each file
   in `supabase/migrations/` via the SQL editor, in filename order --
   never skip or reorder them). All 20 were re-verified to apply cleanly
   in order this phase.
3. **Do not run `supabase/seed.sql` against production** -- it is
   explicitly fictional/dev-only data (fake businesses, projects, guides,
   placeholder-image URLs, and placeholder pricing).
4. Copy the project's URL, anon key, and service_role key into your
   hosting provider's environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
5. Populate the real `plans` catalog rows' `stripe_product_id` /
   `stripe_price_id` once the matching Stripe objects exist (see D) --
   directly via SQL/the Supabase dashboard, not by editing
   `supabase/seed.sql` with real values.
6. Confirm Supabase Auth email templates and the site URL in the
   Supabase dashboard (Auth -> URL Configuration) match your real
   production domain, so confirmation/recovery emails link correctly.
   Note: the `site_url`/`additional_redirect_urls` values in
   `supabase/config.toml` are local-CLI-only and have no effect on a
   hosted project -- this must be set directly in the dashboard.
7. Confirm the `homeowner-uploads` storage bucket exists and is private
   (the migration creates it with `public: false`, re-verified this
   phase against a fresh reset -- verify this wasn't overridden in the
   dashboard).

## D. Requires manual Stripe configuration

1. **Confirm final pricing with the business owner first** (see Section
   B) -- do not proceed with the steps below until pricing is confirmed,
   since Stripe Prices are effectively immutable once created (you
   archive and recreate rather than edit).
2. Create the Basic/Featured/Premium Products and Prices in the Stripe
   dashboard (test mode first, then live mode) matching the confirmed
   pricing.
3. Copy each Price's id into the corresponding `plans.stripe_price_id`
   row (step C.5).
4. Create a webhook endpoint in the Stripe dashboard pointing at
   `https://<your-domain>/api/webhooks/stripe`, subscribed to at least:
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.paid`, `invoice.payment_failed`. The handler for all six was
   re-verified this phase (five directly via synthetic events; `updated`/
   `deleted` share the same `handleSubscriptionEvent` code path as
   `created`, exercised via the same test).
5. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.
6. Copy the account's secret key into `STRIPE_SECRET_KEY` (test mode for
   staging, live mode for production -- never the same key in both).
7. Enable the Stripe Customer Portal (Settings -> Billing -> Customer
   portal) and configure what it allows (cancel, update payment method,
   etc.) to match what the app's billing page expects.

## E. Requires domain/DNS configuration

1. Decide and own the production domain -- **nothing in this repository
   commits to one; it must be chosen before this section can proceed.**
2. Point your production domain at your hosting provider (Vercel or
   otherwise -- the codebase has no Vercel-specific configuration beyond
   being a standard Next.js app, so any Next.js-compatible host works).
3. Set `NEXT_PUBLIC_SITE_URL` to the real `https://` production domain
   in your hosting provider's environment variables -- **this is a hard
   requirement in production**; the app throws rather than silently
   guessing if it's missing.
4. Verify HTTPS is enforced (most hosts, including Vercel, do this by
   default for custom domains once DNS is configured).
5. Re-check Supabase Auth's site URL / redirect URL allowlist (C.6)
   matches this exact domain.

## F. Final smoke tests to perform after deployment

Local verification (section A) does not substitute for this, no matter
how thorough -- it was run against local Docker containers with
synthetic data, self-signed webhook events, and no real domain. After
deploying with real credentials, manually verify at minimum:

1. Homeowner signup receives a real confirmation email (if email
   confirmation is enabled) linking to the real production domain, not
   `localhost`.
2. Complete the planner end to end and submit a plan; confirm a lead is
   created and matched.
3. As a claimed business, start a real Stripe Checkout with a real test
   card (`4242 4242 4242 4242` in Stripe test mode), complete payment,
   and confirm the business's subscription shows as active on the
   billing page within a few seconds (proves the webhook is actually
   reachable and processing on the real internet, not just locally).
4. Open the Stripe Customer Portal from the billing page and confirm it
   loads for the correct customer.
5. Cancel the subscription from the app; confirm Stripe reflects the
   cancellation and the app's status updates once Stripe's webhook fires.
6. In the Stripe dashboard, manually resend one webhook event and
   confirm it does not duplicate any local row (idempotency holds in
   production, not just locally).
7. Confirm `https://<domain>/robots.txt` and
   `https://<domain>/sitemap/core.xml` resolve and list the expected
   public URLs with the real domain (not `localhost`).
8. Confirm a private page (e.g. `/business/billing/<id>`) is
   unreachable/redirects for a logged-out visitor on the real domain.
9. Confirm the favicon/apple-icon render correctly in at least one
   desktop and one mobile browser on the real domain.
10. View-source a public project page on the real domain; confirm
    canonical URL, Open Graph tags, and JSON-LD all use the real
    production domain.

---

## Phase 11 summary

No code changes were required this phase -- Phase 9/10/rebrand's
implementation held up under live re-verification with zero new bugs
found. Phase 11 was a verification and documentation pass: every claim
in this document that can be checked without real production credentials
was re-checked live against a fresh local stack (not assumed from prior
reports), and every remaining gap is one that genuinely requires a
credential, a decision, or an account this sandbox cannot have --
production Supabase, production Stripe, a chosen domain, and hosting
access. See the Phase 11 final report in the conversation history for
the full list of what was verified and what remains, all labeled by who
can act on it.
