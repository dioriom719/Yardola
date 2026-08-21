import Link from "next/link";
import { Handshake, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { listBusinessOpportunities } from "@/lib/data/business-leads";
import { listActivePlans } from "@/lib/data/billing";
import { listOwnedBusinesses } from "@/lib/data/business-portal";
import {
  formatBudgetRange,
  formatMatchTier,
  formatOpportunityStatus,
  formatPriceCents,
  formatTimeline,
  formatUpgradeReason,
  nextPlanSlug,
} from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { OpportunityActions } from "./opportunity-actions";
import type { BudgetRange, ProjectTimeline } from "@/types";

export const metadata = buildMetadata({
  title: "Opportunities | YARDOLO",
  description:
    "Review qualified homeowner opportunities matched to your YARDOLO business.",
  path: "/business/leads",
  index: false,
});

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  pending: "outline",
  sent: "outline",
  viewed: "secondary",
  interested: "default",
  connected: "default",
  won: "default",
  lost: "secondary",
};

/** A short, honest reason this opportunity was routed to this business -- what the homeowner is looking for that matched. */
function matchReason(categories: string[], city: string | null): string {
  const what =
    categories.length > 0 ? categories.join(" and ") + " services" : "services";
  return city ? `You offer ${what} in ${city}.` : `You offer ${what}.`;
}

export default async function BusinessOpportunitiesPage() {
  const [opportunities, businesses, plans] = await Promise.all([
    listBusinessOpportunities(),
    listOwnedBusinesses(),
    listActivePlans(),
  ]);

  // Only shown for a single-business owner -- with multiple businesses on
  // different plans, "explore Featured" would be ambiguous about which
  // business it applies to, so we skip the nudge rather than guess.
  const soleBusiness = businesses.length === 1 ? businesses[0] : null;
  const upgradeSlug = soleBusiness ? nextPlanSlug(soleBusiness.planSlug) : null;
  const upgradePriceCents = upgradeSlug
    ? (plans.find((p) => p.slug === upgradeSlug)?.priceCents ?? null)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Opportunities" }]}
      />
      <div className="mt-5">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Opportunities
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          YARDOLO routes qualified homeowner opportunities here when a
          homeowner&apos;s project is a strong fit for your services and service
          area. Project details come first -- homeowner contact information is
          shared only once you&apos;ve expressed interest and the homeowner has
          connected with you.
        </p>
      </div>

      {opportunities.length === 0 ? (
        <div className="mt-10">
          {businesses.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Add your business to start receiving opportunities"
              description="YARDOLO matches homeowner projects to businesses with a listing. Create or claim your business to get started."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    nativeButton={false}
                    render={<Link href="/business/onboarding" />}
                  >
                    Create a business
                  </Button>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/business/claim" />}
                  >
                    Claim an existing listing
                  </Button>
                </div>
              }
            />
          ) : (
            <EmptyState
              icon={Handshake}
              title="No opportunities yet"
              description="YARDOLO is looking for projects that match your services and service area. New projects are evaluated automatically -- keeping your profile current is the best way to improve your odds."
              action={
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href={`/business/services/${businesses[0].id}`} />
                  }
                >
                  Review my profile
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {opportunities.map((opp) => (
            <article
              key={opp.matchId}
              className="border-border bg-background rounded-xl border p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-foreground text-xl">
                    {opp.plan.title ||
                      opp.plan.categories.join(" + ") ||
                      "Backyard project"}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {opp.plan.categories.join(", ") ||
                      "Project type not specified"}
                    {opp.plan.city ? ` · ${opp.plan.city}` : ""}
                  </p>
                </div>
                <Badge
                  variant={STATUS_BADGE_VARIANT[opp.matchStatus] ?? "secondary"}
                >
                  {formatOpportunityStatus(opp.matchStatus)}
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Budget
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatBudgetRange(
                      opp.plan.budgetRange as BudgetRange | null
                    ) ?? "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Timeline
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatTimeline(
                      opp.plan.timeline as ProjectTimeline | null
                    ) ?? "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Why you&apos;re a match
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatMatchTier(opp.matchScore)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {matchReason(opp.plan.categories, opp.plan.city)}
                  </p>
                </div>
              </div>

              {opp.plan.description && (
                <p className="text-muted-foreground mt-5 border-t pt-4 text-sm">
                  {opp.plan.description}
                </p>
              )}

              {(opp.homeownerName ||
                opp.homeownerEmail ||
                opp.homeownerPhone) && (
                <div className="border-border bg-secondary/30 mt-5 rounded-lg border p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Connected -- homeowner contact
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {opp.homeownerName || "YARDOLO homeowner"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opp.homeownerPhone && (
                      <Button
                        size="sm"
                        nativeButton={false}
                        render={<a href={`tel:${opp.homeownerPhone}`} />}
                      >
                        Call homeowner
                      </Button>
                    )}
                    {opp.homeownerEmail && (
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={<a href={`mailto:${opp.homeownerEmail}`} />}
                      >
                        Email homeowner
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <OpportunityActions
                  matchId={opp.matchId}
                  status={opp.matchStatus}
                />
              </div>
            </article>
          ))}

          {soleBusiness && upgradeSlug && (
            <div className="border-border bg-secondary/20 rounded-xl border p-5 text-sm sm:p-6">
              <p className="text-muted-foreground">
                Want more marketplace visibility?{" "}
                {formatUpgradeReason(upgradeSlug)}
              </p>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/business/billing/${soleBusiness.id}`} />}
              >
                Explore {upgradeSlug === "premium" ? "Premium" : "Featured"}
                {upgradePriceCents != null
                  ? ` — ${formatPriceCents(upgradePriceCents)}/mo`
                  : ""}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
