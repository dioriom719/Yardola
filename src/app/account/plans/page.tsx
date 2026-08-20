import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { PlanActionsMenu } from "./plan-actions-menu";
import {
  formatBudgetRange,
  formatDate,
  formatPlanTitle,
  formatTimeline,
} from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { listPlans } from "@/lib/data/plans";

export const metadata = buildMetadata({
  title: "My Plans | YARDOLO",
  description: "Your backyard project plans.",
  path: "/account/plans",
  index: false,
});

export default async function PlansPage(props: PageProps<"/account/plans">) {
  const searchParams = await props.searchParams;
  const showArchived = searchParams.archived === "1";

  const plans = await listPlans({ includeArchived: showArchived });
  const visiblePlans = showArchived
    ? plans.filter((p) => p.status === "closed")
    : plans;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My YARDOLO", href: "/account" },
          { label: "My Plans" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-3xl sm:text-4xl">
            {showArchived ? "Archived Plans" : "My Plans"}
          </h1>
          {!showArchived && (
            <p className="text-muted-foreground mt-2">
              {plans.length} project {plans.length === 1 ? "plan" : "plans"}
            </p>
          )}
        </div>
        <Button nativeButton={false} render={<Link href="/plan" />}>
          Start a Project
        </Button>
      </div>

      {visiblePlans.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Sparkles}
            title={showArchived ? "No archived plans" : "No project plans yet"}
            description={
              showArchived
                ? "Plans you archive will show up here."
                : "Ready to start planning your backyard?"
            }
            action={
              !showArchived && (
                <Button nativeButton={false} render={<Link href="/plan" />}>
                  Start a Project
                </Button>
              )
            }
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {visiblePlans.map((plan) => {
            const categoryNames = plan.categories.map((c) => c.name);
            const meta = [
              plan.cityName,
              formatBudgetRange(plan.budgetRange),
              formatTimeline(plan.timeline),
            ].filter(Boolean);

            return (
              <li
                key={plan.id}
                className="border-border bg-card hover:border-primary/40 group relative rounded-lg border p-5 transition-colors"
              >
                <Link
                  href={`/account/plans/${plan.id}`}
                  className="focus-visible:ring-ring absolute inset-0 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="sr-only">
                    {formatPlanTitle(plan.title, categoryNames)}
                  </span>
                </Link>
                <div className="pointer-events-none flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-foreground text-lg">
                      {formatPlanTitle(plan.title, categoryNames)}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {meta.length > 0
                        ? meta.join(" · ")
                        : "Just getting started"}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {plan.inspirationCount} inspiration · {plan.photoCount}{" "}
                      photo{plan.photoCount === 1 ? "" : "s"}
                      {" · "}Updated {formatDate(plan.updatedAt)}
                    </p>
                  </div>
                  <div className="pointer-events-auto relative z-10">
                    <PlanActionsMenu
                      planId={plan.id}
                      isArchived={plan.status === "closed"}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8 text-center">
        <Link
          href={showArchived ? "/account/plans" : "/account/plans?archived=1"}
          className="text-muted-foreground text-sm hover:underline"
        >
          {showArchived ? "Back to active plans" : "View archived plans"}
        </Link>
      </div>
    </div>
  );
}
