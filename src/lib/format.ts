import type {
  BillingInterval,
  BudgetRange,
  ProjectTimeline,
  PropertyType,
  SubscriptionStatus,
  VerificationStatus,
} from "@/types/enums";
import type { OpportunityStatus } from "@/lib/data/business-leads";

const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_10k: "Under $10K",
  "10k_25k": "$10K–$25K",
  "25k_50k": "$25K–$50K",
  "50k_100k": "$50K–$100K",
  "100k_250k": "$100K–$250K",
  over_250k: "$250K+",
};

export function formatBudgetRange(value: BudgetRange | null | undefined) {
  return value ? BUDGET_RANGE_LABELS[value] : null;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  single_family: "Single Family Home",
  townhome: "Townhome",
  condo: "Condo",
  multi_family: "Multi-Family",
  commercial: "Commercial",
  other: "Other",
};

export function formatPropertyType(value: PropertyType | null | undefined) {
  return value ? PROPERTY_TYPE_LABELS[value] : null;
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Verification Pending",
  unverified: "Unverified",
};

export function formatVerificationStatus(value: VerificationStatus) {
  return VERIFICATION_LABELS[value];
}

export function formatProjectYear(value: number | null | undefined) {
  return value ? String(value) : null;
}

const TIMELINE_LABELS: Record<ProjectTimeline, string> = {
  planning_only: "Just researching",
  asap: "As soon as possible",
  "1_3_months": "Within 1–3 months",
  "3_6_months": "3–6 months",
  "6_12_months": "6–12 months",
};

export function formatTimeline(value: ProjectTimeline | null | undefined) {
  return value ? TIMELINE_LABELS[value] : null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(value: string | null | undefined) {
  return value ? DATE_FORMATTER.format(new Date(value)) : null;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPriceCents(cents: number): string {
  if (cents === 0) return "Free";
  return CURRENCY_FORMATTER.format(cents / 100);
}

const BILLING_INTERVAL_LABELS: Record<BillingInterval, string> = {
  month: "/month",
  year: "/year",
  one_time: " one-time",
};

export function formatBillingInterval(value: BillingInterval): string {
  return BILLING_INTERVAL_LABELS[value];
}

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Payment past due",
  canceled: "Canceled",
  expired: "Expired",
  incomplete: "Payment required",
  incomplete_expired: "Payment window expired",
};

export function formatSubscriptionStatus(value: SubscriptionStatus): string {
  return SUBSCRIPTION_STATUS_LABELS[value];
}

const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  pending: "New",
  sent: "New",
  viewed: "Viewed",
  interested: "Interested",
  connected: "Connected",
  won: "Won",
  lost: "Lost",
  accepted: "Interested",
  rejected: "Lost",
  expired: "Expired",
};

/** Maps the internal match_status lifecycle onto the "qualified opportunity" language used everywhere in the product. */
export function formatOpportunityStatus(value: OpportunityStatus): string {
  return OPPORTUNITY_STATUS_LABELS[value];
}

/**
 * Recasts a raw 0-100 match score as a plain-English tier so homeowners
 * and businesses read "Strong match" rather than interpreting a bare
 * percentage. The number is still shown alongside it -- this reframes
 * the score, it doesn't hide it.
 */
export function formatMatchTier(score: number): string {
  if (score >= 70) return "Strong match";
  if (score >= 40) return "Good match";
  return "Fair match";
}

/**
 * Customer-facing text for each plan's `features` entries (Phase 15
 * locked pricing). `plans.features` in the database is the single
 * source of truth for which entitlements a tier has; this only supplies
 * the display label for each key -- never expose the raw key itself.
 */
const PLAN_FEATURE_LABELS: Record<string, string> = {
  business_profile: "YARDOLO business profile",
  qualified_opportunities: "Qualified opportunities",
  contractor_dashboard: "Contractor dashboard",
  opportunity_notifications: "Opportunity notifications",
  standard_priority: "Standard marketplace priority",
  priority_matching: "Priority marketplace matching",
  featured_placement: "Featured placement",
  enhanced_profile: "Enhanced business profile",
  featured_badge: "Featured badge",
  increased_exposure: "Increased marketplace exposure",
  highest_priority: "Highest marketplace priority",
  maximum_exposure: "Maximum marketplace exposure",
  premium_badge: "Premium badge",
  priority_support: "Priority support",
};

/** Falls back to the raw key (title-cased) for a feature added to the database without a matching label here. */
export function formatPlanFeature(key: string): string {
  return (
    PLAN_FEATURE_LABELS[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** One-line marketplace advantage per plan, shown wherever a contractor needs to understand what their plan actually does for them. */
const PLAN_ADVANTAGE_LABELS: Record<string, string> = {
  basic: "Standard marketplace priority",
  featured: "Priority marketplace visibility",
  premium: "Highest marketplace priority",
};

export function formatPlanAdvantage(slug: string): string {
  return PLAN_ADVANTAGE_LABELS[slug] ?? "Standard marketplace priority";
}

/** Short CTA-style tagline for the pricing page's plan cards. */
const PLAN_TAGLINE_LABELS: Record<string, string> = {
  basic: "Get Started",
  featured: "Get More Exposure",
  premium: "Maximum Exposure",
};

export function formatPlanTagline(slug: string): string {
  return PLAN_TAGLINE_LABELS[slug] ?? "Get Started";
}

/** A plan without a homeowner-chosen name falls back to its first project type. */
export function formatPlanTitle(
  title: string | null,
  categoryNames: string[]
): string {
  if (title) return title;
  if (categoryNames.length > 0) return `My ${categoryNames[0]} Project`;
  return "My Backyard Plan";
}
