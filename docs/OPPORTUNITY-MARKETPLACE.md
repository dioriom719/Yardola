# YARDOLO Opportunity & Connection Marketplace (v1)

Phase 13 turns the Phase 8 lead-matching pipeline into a two-sided
opportunity/connection marketplace. This document explains what's
implemented now, why it's designed this way, and what's deliberately
deferred to future data-driven decisions.

YARDOLO connects homeowners planning real projects with qualified
contractors. A contractor's value here is access to **qualified
homeowner opportunities** -- not a promise of unlimited leads, and not a
raw database dump of homeowner contact information.

## Implemented now

### Matching (extends Phase 8, does not replace it)

`match_lead()` (`supabase/migrations/20260821020100_opportunity_lifecycle.sql`)
is the same function Phase 8 built, extended in place:

- **Hard cap: 5 matches.** A project is never exposed to more than 5
  contractors through the normal matching system. This was already the
  practical behavior (the one caller always requested 5), but the
  function itself now clamps `result_limit` to a maximum of 5 regardless
  of what's passed in, so the rule holds even if a future caller asks
  for more.
- **Eligibility is unchanged**: category (30%), location (25%), service
  (20%), project type (15%), business quality (10%) -- the same
  weighted compatibility score from Phase 8. A business with a raw score
  of 0 is never eligible, no matter its plan.
- **Plan-tier priority is new, and intentionally small and bounded.**
  Among businesses that are already qualified, a business's current plan
  adds a fixed bonus used only for selecting/ordering the top 5:
  - Premium: +6
  - Featured: +3
  - Basic / no subscription: +0

  This bonus is centralized in one place in `match_lead()` (search for
  "plan-tier priority bonus") rather than scattered through the
  application, so it's the one spot to tune. It is smaller than every
  individual scoring factor (the smallest, business quality, is worth up
  to 10), so it can only reorder candidates that are already close in
  raw quality -- it cannot make a materially worse match outrank a
  materially better one, and the score>0 eligibility filter is applied
  _before_ the bonus, so it can never rescue an unqualified business.
  Verified directly: a Premium business with zero category overlap for a
  project did not appear in that project's matches, while several
  same-quality Basic/Premium/Featured businesses correctly filled the
  top 5 with Premium and Featured ranked first among ties.

- The persisted `match_score` is always the raw compatibility score, not
  the tier-boosted total -- plan tier affects ranking, never the
  displayed "match quality."

### Opportunity lifecycle

`lead_matches.match_status` now carries the full lifecycle, via new enum
values added to the existing `match_status` type (nothing was renamed or
removed, so this is backward compatible with every Phase 8/9 row and
query):

```
pending/sent  --match_lead()-->        (a fresh match; "New")
     |
     v  mark_opportunity_viewed()
   viewed
     |
     v  express_interest()          (business action)
 interested
     |
     v  connect_opportunity()       (homeowner action)
 connected
     |
     v  mark_opportunity_won() / mark_opportunity_lost()   (business action)
  won / lost
```

Four new timestamp columns on `lead_matches` (`viewed_at`,
`interested_at`, `connected_at`, `resolved_at`) record when each stage
was first reached, independent of the current status -- the foundation
for the funnel measurement in section 7 of the phase brief (opportunities
received/viewed/pursued, connections, won/lost) once there's enough real
volume to report on.

Every transition is a `SECURITY DEFINER` function
(`mark_opportunity_viewed`, `express_interest`, `connect_opportunity`,
`mark_opportunity_won`, `mark_opportunity_lost` -- same pattern as the
existing `match_lead`/`submit_project_lead`), not a direct table
`UPDATE` policy, so each one enforces its own ownership check, valid-from
state, and idempotency in one place:

- **Idempotent**: calling any of these more than once has no additional
  effect after the first call -- verified live (see Testing below):
  repeated `express_interest` calls produced exactly one `interested`
  event and one `interested_at` timestamp, not one per call.
- **Ownership-checked**: `mark_opportunity_viewed`/`express_interest`/
  `mark_opportunity_won`/`mark_opportunity_lost` require the caller to
  own the matched business (`owns_business()`); `connect_opportunity`
  requires the caller to be the lead's homeowner
  (`lead_belongs_to_caller()`). A business acting on another business's
  opportunity, or a business trying to call the homeowner-only connect
  action, is rejected -- verified live.
- **Ordered**: a business can't skip from "new" straight to "connected,"
  and can't report a won/lost outcome before a connection exists.
  `won`/`lost` are one-way -- once set, a later call to the other
  outcome function is a no-op rather than flipping the result.

Every lifecycle event (`viewed`, `interested`, `connected`, `won`,
`lost`, alongside the existing `created`/`matched`) is also logged to
`lead_events`, attributed to the actor who caused it -- the same table
Phase 8 already used for the lifecycle log, extended rather than
duplicated.

### PII protection

Before this phase, a matched business could read a homeowner's full
contact info (`leads.contact_name/email/phone`) the instant a match was
created -- via a blanket RLS policy that granted row access to the whole
`leads` row, columns included. RLS in Postgres is row-level only, so it
could not be narrowed to "project info yes, contact info only once
connected."

That policy is dropped. Businesses now reach their opportunities
exclusively through `get_business_opportunities()`, a `SECURITY DEFINER`
function that:

- is scoped to the caller's own businesses (`owns_business()`), and
- returns `contact_name`/`contact_email`/`contact_phone` as `null`
  unless `match_status` has reached `connected`, `won`, or `lost`.

This is enforced at the database layer, not just hidden in the UI: a
business calling the REST API directly (e.g.
`.../rest/v1/leads?select=contact_email`) can no longer read another
opportunity's contact fields early, because no RLS policy grants row
access to `leads` for businesses anymore -- only this function's own
internal check does. Verified live: an opportunity's `contact_*` fields
were `null` through pending/viewed/interested, and populated only after
`connect_opportunity()` ran; a second business could not read the first
business's opportunity (masked or not) at any stage; direct-table access
patterns were exercised via the REST API with real Supabase Auth tokens,
not just the UI.

### Homeowner experience

The plan detail page (`/account/plans/[plan-id]`) shows a short,
reassuring summary -- "3 professionals matched · 2 interested · 1
connected" -- plus a "Connection available" badge when at least one
business is interested, and a **Connect** button per interested match.
Connecting is the homeowner's own action (`connect_opportunity`); nothing
auto-connects on the business's interest alone. The homeowner never sees
a raw count implying their information has been "blasted" to a large
contractor list -- only their own up-to-5 matches and those businesses'
engagement status.

**Phase 14** added a confirmation dialog before the Connect action
actually fires: "Connect with {business}? Your name, email, and phone
number will be shared with {business}..." with "Not yet" / "Yes,
connect" -- so sharing contact info is always a deliberate, explained
choice, never a single accidental click. Phase 14 also recast the raw
0-100 match score as a plain-English tier ("Strong match" / "Good
match" / "Fair match") on both the homeowner's match cards and the
business's opportunity cards, and added a short "why you're a match"
line on the business side.

**Phase 17** removed the raw percentage that had shipped alongside the
tier label on the homeowner's match cards (`/account/plans/[plan-id]`)
-- a homeowner should never see an internal match score, only the
qualitative tier -- and added an equivalent "why this professional"
line there (`matchReason()`, mirroring the business side's), built only
from facts the match already carries (the plan's categories and the
business's city). Phase 17 also distinguished "not yet submitted" from
"submitted, no matches yet" on that page (previously both states
rendered the same "Ready to find a professional?" prompt with a
resubmit button, which was misleading once a plan had actually been
submitted), and added a homeowner-friendly status badge per plan on
`/account/plans` (Draft / Finding professionals / Waiting for a
professional / Ready to connect / Connected) via
`listPlanEngagement()`/`formatPlanEngagement()` in `src/lib/data/leads.ts` --
two batched, RLS-scoped queries regardless of how many plans the
homeowner has, never a raw DB status.

### Business experience

`/business/leads` ("Opportunities") shows each matched opportunity's
project info, a status badge (New/Viewed/Interested/Connected/Won/Lost),
and the one action available at that stage: **I'm interested** before a
connection, **Mark won**/**Mark lost** after one. Homeowner contact info
and the "Call"/"Email" actions appear only once the opportunity reaches
Connected. Opening the page marks any new opportunity as Viewed (there's
no separate detail route in v1, so viewing the list _is_ opening the
opportunity).

**Contractor dashboard/onboarding conventions (Phase 16).** `/business`
computes one contextual primary action per business, in priority order:
an incomplete profile (`profileComplete`/`missingSteps` in
`listOwnedBusinesses()`, derived from already-fetched fields -- no new
columns) always wins over everything else, since YARDOLO can't present or
match a business it doesn't have basic information for; then getting
matched at all; then the day-to-day "view opportunities" loop. A plan
upgrade is never the primary action -- `nextPlanSlug()`/
`formatUpgradeReason()` in `src/lib/format.ts` surface it as a quiet,
secondary nudge only once the core loop already has activity (an active
business with opportunities), on the dashboard card and at the bottom of
`/business/leads`. This keeps with the standing rule that paying more
changes marketplace priority, never qualification, and that upgrade
messaging stays contextual rather than a constant banner. Future phases
adding more dashboard entry points should reuse `primaryAction()`'s
priority order rather than inventing a new one.

### Entitlements

The Phase 9 entitlement system (`plans.max_active_leads`,
`getLeadEntitlement()`) is unchanged in shape and continues to gate how
many **active** (non-terminal: pending/sent/viewed/interested/connected)
opportunities are returned per business -- resolved (won/lost)
opportunities are always shown as history and never count against the
cap. `max_active_leads` is still a plain, already-configurable database
column: Basic is capped, Featured/Premium are `null` (unlimited) in
today's seed data. **No capacity decision was made or changed this
phase** -- this is the same fallback that existed before Phase 13, called
out explicitly here per the standing instruction not to invent a
permanent limit. Nothing about the matching or opportunity code hardcodes
"unlimited" -- it reads whatever `max_active_leads` says, so introducing
a real Featured/Premium cap later is a data change, not a code or
matching-logic change.

**Pricing was locked in Phase 15**: Basic $0/mo, Featured $299/mo,
Premium $699/mo (see `supabase/seed.sql` and
`docs/PRODUCTION-LAUNCH.md`). This is approved launch pricing, not a
placeholder. Real Stripe Products/Prices have still not been created --
`plans.stripe_price_id` remains `null` for every tier -- so production
billing is still pending Stripe configuration. Entitlements across all
three tiers remain priority/exposure within the unchanged matching and
5-match cap above, never a promise of a guaranteed or fixed number of
leads, and the homeowner-facing PII protection above applies identically
regardless of the connected business's plan.

## Explicitly not built this phase (see the Phase 13 brief's "not in scope")

- Real Stripe Products/Prices, final pricing, or any change to Stripe
  Products/Prices.
- Market/category capacity limits ("5 Premium contractors per Las Vegas")
  or any scarcity messaging ("only X spots left"). The schema doesn't
  prevent adding this later -- `plans`/`subscriptions`/`businesses`
  already carry everything a future capacity rule would need (plan
  tier, city, category) -- but nothing enforces or fakes it today.
- A decline/reject action for businesses. A business simply not engaging
  requires no action in v1; a later phase could add an explicit "not a
  fit" action using the same idempotent-RPC pattern.
- Messaging/chat infrastructure. The connection flow is a single
  homeowner-initiated action that reveals contact info -- no in-app
  conversation thread.
- Contractor reviews/ratings, bidding, or an auction system.

## Future marketplace capacity (not implemented)

The phase brief describes a possible future rule limiting Premium/
Featured _positions_ by market + category (e.g., a fixed number of
Premium slots per city per category). The data model already supports
building this without a redesign: `subscriptions.plan_id` +
`businesses.city`/`business_service_areas` + `business_services` ->
`categories` already express "which plan, which market, which
category" for every business. A future capacity feature would most
naturally add a small reference table (e.g., market+category capacity
limits) and a check inside `match_lead()`'s existing tier-bonus CTE --
it would not need to touch the matching algorithm's core scoring, the
opportunity lifecycle, or the PII-protection function. We're
deliberately not building that check yet: real marketplace volume,
which doesn't exist yet, should inform what capacity (if any) actually
makes sense.

## Testing

Verified live against a freshly reset local Supabase stack, using real
Supabase Auth tokens for multiple homeowner and business accounts (not
just UI clicks) -- see the Phase 13 final report for the complete list
of scenarios and results.
