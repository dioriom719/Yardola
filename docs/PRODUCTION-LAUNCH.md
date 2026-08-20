# YARDOLO Production Launch Checklist

This document is the Phase 10 production-readiness checklist for YARDOLO. The codebase is built around Next.js, Supabase, and Stripe. Complete the verification sections before exposing the application to production users.

## 1. Repository and deployment

- [ ] Deploy the Phase 10 branch to the intended production Vercel project.
- [ ] Confirm the production branch and deployment URL.
- [ ] Confirm the custom YARDOLO domain resolves over HTTPS.
- [ ] Confirm the production deployment uses the intended environment variables only.
- [ ] Confirm no `.env.local`, service-role key, Stripe secret, webhook secret, or other credential is committed.

## 2. Required production environment variables

Set these in the production deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are server-only secrets and must never be exposed to browser code.

## 3. Supabase production setup

- [ ] Link the CLI to the correct production Supabase project.
- [ ] Apply every versioned migration in order with the normal production migration workflow.
- [ ] Confirm Auth email configuration and redirect URLs for the production domain.
- [ ] Confirm the private `homeowner-uploads` storage bucket exists.
- [ ] Confirm storage policies restrict objects to the owning homeowner folder.
- [ ] Confirm all application tables retain RLS enabled.
- [ ] Confirm production seed fixtures are not loaded as production data.
- [ ] Verify anonymous access cannot read homeowner plans, saved projects, photos, leads, or private billing data.
- [ ] Verify one homeowner cannot read another homeowner's plans/photos/leads.
- [ ] Verify one business owner cannot read another business's leads or billing data.

## 4. Stripe production setup

- [ ] Create the production Stripe products/prices for the paid YARDOLO business plans.
- [ ] Put the real Stripe Price IDs into the corresponding production `plans` rows.
- [ ] Confirm Basic remains the intended free/default plan.
- [ ] Configure a production Stripe webhook pointing to `/api/webhooks/stripe`.
- [ ] Subscribe the webhook to the event types supported by the application:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] Store the production webhook signing secret as `STRIPE_WEBHOOK_SECRET`.
- [ ] Verify a test checkout in the production Stripe environment before public launch.
- [ ] Verify subscription activation, renewal/payment success, payment failure, cancellation, and portal access.
- [ ] Confirm webhook replay is idempotent and does not duplicate transactions or subscriptions.

## 5. Authentication and authorization smoke test

Use separate test accounts for each role.

- [ ] Sign up, sign in, sign out, and password reset.
- [ ] Signed-out users are redirected away from protected account/planner routes.
- [ ] Homeowner A cannot access homeowner B's plans, saved projects, photos, or leads by changing URLs/IDs.
- [ ] Business A cannot access business B's dashboard, leads, or billing page.
- [ ] Homeowners cannot access business-only routes.
- [ ] Business users cannot mutate subscription state from the client.
- [ ] Stripe-controlled subscription state can only change through verified server-side processing.

## 6. Core homeowner journey

- [ ] Browse public project/category/location pages.
- [ ] Save and unsave a project.
- [ ] Start a planner project.
- [ ] Upload and remove inspiration photos.
- [ ] Attach saved/inspiration projects.
- [ ] Resume a saved plan.
- [ ] Submit a plan once and confirm exactly one lead is created.
- [ ] Confirm matching produces the expected capped number of matches.
- [ ] Resubmit the same plan and confirm no duplicate lead/matches are created.
- [ ] Confirm matched businesses only see matches for their own business.

## 7. SEO and public-site checks

- [ ] Homepage remains `index, follow`.
- [ ] Intended public discovery/category/location/guide pages remain indexable.
- [ ] Private account, planner, lead, and billing routes remain `noindex`.
- [ ] `robots.txt` disallows private application areas as intended.
- [ ] Sitemap contains only intended public URLs.
- [ ] Canonicals use the production YARDOLO domain.
- [ ] No staging/local hostname appears in production metadata.

## 8. Performance and reliability

- [ ] Run a production build successfully.
- [ ] Confirm all image hosts used in production are configured in `next.config.ts`.
- [ ] Check the homepage and primary public landing pages on mobile and desktop.
- [ ] Check planner controls at a 390px-wide viewport.
- [ ] Confirm no console errors during the primary homeowner and business journeys.
- [ ] Confirm signed photo URLs remain short-lived and private.

## 9. Launch-day smoke test

After deployment, perform a short end-to-end pass in production:

1. Open the public homepage.
2. Create/sign into a test homeowner account.
3. Save a project.
4. Create a planner project and upload a photo.
5. Submit the plan and verify the lead/matches.
6. Sign into a test business account and verify the appropriate match appears.
7. Open billing and verify the current plan.
8. Trigger/inspect a Stripe test event and verify the local subscription state.
9. Check application logs for errors.
10. Remove or disable test accounts/data before public launch.

## 10. Rollback plan

If a production regression is discovered:

1. Stop new paid acquisition/traffic if necessary.
2. Revert the application deployment to the last known-good commit.
3. Do not roll back database migrations destructively.
4. If a migration is the source of the issue, create a forward-fix migration.
5. Preserve Stripe webhook processing and idempotency records.
6. Re-run the smoke tests before restoring normal traffic.

## 11. Local verification already required by Phase 10

Before calling Phase 10 complete, the implementation branch should pass:

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- Fresh local Supabase migration reset
- Browser regression coverage for Phases 5–9
- Direct RLS/security checks
- Stripe webhook signature and idempotency checks
- SEO/noindex regression checks

Local verification and manual production setup are intentionally separated. A local green build does not mean production credentials, Stripe products, DNS, email delivery, or deployment configuration have been verified.
