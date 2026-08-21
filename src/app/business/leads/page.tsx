import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { listBusinessOpportunities } from "@/lib/data/business-leads";
import {
  formatBudgetRange,
  formatOpportunityStatus,
  formatTimeline,
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

export default async function BusinessOpportunitiesPage() {
  const opportunities = await listBusinessOpportunities();

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
        <div className="border-border bg-secondary/30 mt-10 rounded-xl border p-8 text-center">
          <h2 className="font-display text-foreground text-xl">
            No opportunities yet
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm">
            Keep your services and service areas up to date. New homeowner
            projects are evaluated automatically.
          </p>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-foreground text-xl">
                      {opp.plan.title ||
                        opp.plan.categories.join(" + ") ||
                        "Backyard project"}
                    </h2>
                    <Badge>{Math.round(opp.matchScore)}% match</Badge>
                  </div>
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

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
        </div>
      )}
    </div>
  );
}
