# Yardola Production Launch Checklist

This is the practical launch checklist produced by the Phase 10
production-readiness audit. It distinguishes what's already done in code
from what genuinely requires a human with real credentials.

**Local verification is not production verification.** Everything marked
"LOCAL VERIFIED" below was tested against a local Supabase stack with
synthetic/test-mode data (Playwright, direct RLS tests with real
Supabase Auth tokens, self-signed Stripe webhook events). None of it was
run against a real production Supabase project, real Stripe test or live
keys, or a real domain. Section F is not optional.

---

## A. Completed automatically (this phase)

- [x] Full RLS audit across all 38 tables -- every table has RLS enabled,
      every `SECURITY DEFINER` helper function has a pinned `search_path`,
      confirmed via a full migration-file sweep (not sampling).
- [x] Live RLS/security tests with 4 real Supabase Auth accounts (2
      homeowners, 2 businesses) covering: `project_plans`,
      `project_plan_photos`, `saved_projects`, `leads`, `lead_matches`,
      `lead_events`, `businesses`, `business_claims`, `subscriptions`,
      `transactions`, `business_billing`, `stripe_webhook_events`, and
      `storage.objects` cross-account isolation. 22/22 assertions passed.
- [x] Full production smoke test (40 scenarios: homeowner signup through
      Stripe webhook idempotency to SEO metadata) against a fresh
      `supabase db reset`. 39/40 passed; the 1 failure was confirmed to be
      a test-script timing artifact, not a product bug (see the Phase 10
      report for detail).
- [x] **Bug fixed:** `/business` dashboard returned HTTP 500 for every
      business owner (a broken `leads(count)` embed with no underlying
      foreign key -- `leads` has no `business_id` column, only
      `lead_matches` does). This was a pre-existing bug from Phase 7,
      undetected until this phase because no earlier test actually
      browser-visited `/business` with a real owned business. Fixed in
      `src/lib/data/business-portal.ts` by counting `lead_matches`
      instead.
- [x] **Bug fixed:** `env.siteUrl` silently fell back to a hardcoded
      guessed domain (`https://yardola.com`) in production if
      `NEXT_PUBLIC_SITE_URL` was unset, which would have silently sent
      auth confirmation emails, Stripe checkout/portal return URLs, and
      SEO canonical/OG URLs to the wrong domain with no error. Now throws
      a clear error in production if the variable is missing.
- [x] **Gap fixed:** `robots.txt` never disallowed `/business` (the
      entire business-private route tree added in Phases 7-9), even
      though every page under it correctly sets `noindex`. Added, for
      consistency with `/account` and `/plan`.
- [x] **Hygiene fixed:** dropped `calculate_lead_match_score()`, dead
      code since Phase 8 replaced the matching pipeline it was called
      from (was already `revoke all`'d from every client role, so no
      access-control risk -- purely a cleanup migration).
- [x] `/api/*` excluded from the session-refresh middleware matcher (the
      only route there is the unauthenticated Stripe webhook -- no
      Supabase session is involved, so the middleware's cookie-refresh
      work was pure overhead on a payment webhook's hot path).
- [x] Confirmed server-only secrets (`STRIPE_SECRET_KEY`,
      `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) never reach
      the client bundle -- verified empirically by grepping the built
      `.next/static/` output, not just by code review.
- [x] Confirmed no hardcoded secrets, no `select("*")`, no
      service-role/Stripe imports in any Client Component, no debug
      routes, no leftover scratch files, no stray `console.log` of
      sensitive data.
- [x] `.env.example` audited and confirmed to document every environment
      variable the app actually reads.
- [x] Pricing/lead-cap configurability confirmed: the `plans` table
      (name, price, interval, `stripe_price_id`, `max_active_leads`) is
      the single source of configuration -- nothing is hard-coded in the
      application.

## B. Requires production credentials (cannot be tested from this sandbox)

- [ ] **Stripe live/test-mode secret key.** Checkout Session creation,
      Customer Portal session creation, and `stripe.subscriptions.update`
      (cancel/resume) all require a real `STRIPE_SECRET_KEY` with network
      access to the real Stripe API. This was implemented against the
      Stripe SDK's documented contract and structurally reviewed, but
      never executed against Stripe's real API -- there is no way to do
      that without a real key.
- [ ] **Real Stripe Products & Prices.** `plans.stripe_price_id` is
      `null` for all three seeded plans (Basic/Featured/Premium) in dev
      seed data. Checkout correctly refuses with a clear error for a
      plan with no `stripe_price_id` rather than crashing.
- [ ] **A reachable production webhook endpoint.** Stripe needs to reach
      `https://<your-domain>/api/webhooks/stripe` to deliver real events.
      The handler's signature verification, idempotency, and event
      handling logic were fully exercised locally with self-signed
      synthetic events (see Phase 10 report) -- what's untested is Stripe
      _actually_ reaching this endpoint over the internet.
- [ ] **A real Supabase project** (not the local Docker stack) for
      staging/production data.

## C. Requires manual Supabase configuration

1. Create a Supabase project (or use an existing staging/production one).
2. Apply every migration in order: `supabase db push` (or run each file
   in `supabase/migrations/` via the SQL editor, in filename order --
   never skip or reorder them).
3. **Do not run `supabase/seed.sql` against production** -- it is
   explicitly fictional/dev-only data (fake businesses, projects,
   guides, and placeholder-image URLs).
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
7. Confirm the `homeowner-uploads` storage bucket exists and is private
   (the migration creates it with `public: false` -- verify this wasn't
   overridden in the dashboard).

## D. Requires manual Stripe configuration

1. Create the Basic/Featured/Premium Products and Prices in the Stripe
   dashboard (test mode first, then live mode) matching the pricing
   already defined in `supabase/seed.sql` (or your finalized pricing --
   this phase did not invent new pricing).
2. Copy each Price's id into the corresponding `plans.stripe_price_id`
   row (step C.5).
3. Create a webhook endpoint in the Stripe dashboard pointing at
   `https://<your-domain>/api/webhooks/stripe`, subscribed to at least:
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.paid`, `invoice.payment_failed`.
4. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Copy the account's secret key into `STRIPE_SECRET_KEY` (test mode for
   staging, live mode for production -- never the same key in both).
6. Enable the Stripe Customer Portal (Settings -> Billing -> Customer
   portal) and configure what it allows (cancel, update payment method,
   etc.) to match what the app's billing page expects.

## E. Requires domain/DNS configuration

1. Point your production domain at your hosting provider (Vercel or
   otherwise).
2. Set `NEXT_PUBLIC_SITE_URL` to the real `https://` production domain
   in your hosting provider's environment variables -- **this is now a
   hard requirement in production**; the app will throw rather than
   silently guess if it's missing (see the Phase 10 report).
3. Verify HTTPS is enforced (Vercel does this by default for custom
   domains once DNS is configured).
4. Re-check Supabase Auth's site URL / redirect URL allowlist (C.6)
   matches this exact domain.

## F. Final smoke tests to perform after deployment

Local verification (section A) does not substitute for this. After
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
   reachable and processing).
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
