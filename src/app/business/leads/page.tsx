import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { listBusinessLeads } from "@/lib/data/business-leads";
import { formatBudgetRange, formatTimeline } from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import type { BudgetRange, ProjectTimeline } from "@/types";

export const metadata = buildMetadata({
  title: "Lead Inbox | YARDOLO",
  description: "Review project leads matched to your YARDOLO business.",
  path: "/business/leads",
  index: false,
});

export default async function BusinessLeadsPage() {
  const leads = await listBusinessLeads();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Professional Leads" }]}
      />
      <div className="mt-5">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Professional leads
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Projects are routed here when YARDOLO finds a strong match between a
          homeowner&apos;s plan, your services, and your service area.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="border-border bg-secondary/30 mt-10 rounded-xl border p-8 text-center">
          <h2 className="font-display text-foreground text-xl">
            No matched leads yet
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm">
            Keep your services and service areas up to date. New homeowner plans
            will be evaluated automatically.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {leads.map((lead) => (
            <article
              key={lead.matchId}
              className="border-border bg-background rounded-xl border p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-foreground text-xl">
                      {lead.plan.title ||
                        lead.plan.categories.join(" + ") ||
                        "Backyard project"}
                    </h2>
                    <Badge>{Math.round(lead.matchScore)}% match</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {lead.plan.categories.join(", ") ||
                      "Project type not specified"}
                    {lead.plan.city ? ` · ${lead.plan.city}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">{lead.matchStatus}</Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Budget
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatBudgetRange(
                      lead.plan.budgetRange as BudgetRange | null
                    ) ?? "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Timeline
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatTimeline(
                      lead.plan.timeline as ProjectTimeline | null
                    ) ?? "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Homeowner
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {lead.homeownerName || "YARDOLO homeowner"}
                  </p>
                </div>
              </div>

              {lead.plan.description && (
                <p className="text-muted-foreground mt-5 border-t pt-4 text-sm">
                  {lead.plan.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {lead.homeownerPhone && (
                  <Button
                    nativeButton={false}
                    render={<a href={`tel:${lead.homeownerPhone}`} />}
                  >
                    Call homeowner
                  </Button>
                )}
                {lead.homeownerEmail && (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<a href={`mailto:${lead.homeownerEmail}`} />}
                  >
                    Email homeowner
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
