import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import {
  listMyBusinessClaims,
  listOwnedBusinesses,
  type OwnedBusiness,
} from "@/lib/data/business-portal";
import { listActivePlans } from "@/lib/data/billing";
import {
  formatPlanAdvantage,
  formatPriceCents,
  formatUpgradeReason,
  nextPlanSlug,
} from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Professional Dashboard | YARDOLO",
  description:
    "Manage your YARDOLO business profile and qualified homeowner opportunities.",
  path: "/business",
  index: false,
});

/**
 * The one primary action for this business right now, in priority order:
 * an incomplete profile always wins (nothing else matters until YARDOLO
 * can actually present and match the business), then getting matched at
 * all, then the day-to-day loop of reviewing opportunities. Upgrading is
 * never the primary action -- it's offered as a quiet secondary nudge
 * once the core loop is already working. See docs/OPPORTUNITY-MARKETPLACE.md.
 */
function primaryAction(business: OwnedBusiness): {
  label: string;
  href: string;
} {
  if (!business.profileComplete) {
    const needsCoreInfo = business.missingSteps.some(
      (step) =>
        step !== "Add your services" && step !== "Add your service areas"
    );
    return {
      label: "Complete profile",
      href: needsCoreInfo
        ? `/business/settings/${business.id}`
        : `/business/services/${business.id}`,
    };
  }
  if (business.leadCount === 0) {
    return {
      label: "Improve your profile",
      href: `/business/services/${business.id}`,
    };
  }
  return { label: "View opportunities", href: "/business/leads" };
}

export default async function BusinessDashboardPage() {
  const [businesses, claims, plans] = await Promise.all([
    listOwnedBusinesses(),
    listMyBusinessClaims(),
    listActivePlans(),
  ]);
  const priceBySlug = new Map(plans.map((p) => [p.slug, p.priceCents]));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professional Dashboard" },
        ]}
      />
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">
            Professional dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Manage your YARDOLO presence and the homeowner projects matched to
            your business.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/business/onboarding" />}
        >
          Add a business
        </Button>
      </div>
      {businesses.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Your businesses</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {businesses.map((business) => {
              const action = primaryAction(business);
              const upgradeSlug = nextPlanSlug(business.planSlug);
              const showUpgradeNudge =
                business.profileComplete &&
                business.leadCount > 0 &&
                upgradeSlug !== null;
              return (
                <article
                  key={business.id}
                  className="border-border rounded-xl border p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl">{business.name}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {business.city && business.state
                          ? `${business.city}, ${business.state}`
                          : "Location not set"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        business.status === "active" ? "default" : "secondary"
                      }
                    >
                      {business.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{business.planName}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatPlanAdvantage(business.planSlug)}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-secondary/40 rounded-lg p-3">
                      <div className="font-display text-xl">
                        {business.leadCount}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Opportunities
                      </div>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3">
                      <div className="font-display text-xl">
                        {business.serviceCount}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Services
                      </div>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3">
                      <div className="font-display text-xl">
                        {business.areaCount}
                      </div>
                      <div className="text-muted-foreground text-xs">Areas</div>
                    </div>
                  </div>

                  {!business.profileComplete && (
                    <div className="border-border bg-secondary/20 mt-5 flex items-start gap-2 rounded-lg border p-3">
                      <CircleAlert
                        className="text-muted-foreground mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground text-xs">
                        Finish your profile so YARDOLO knows what projects are a
                        fit:{" "}
                        <span className="text-foreground font-medium">
                          {business.missingSteps.join(", ")}
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Button
                      nativeButton={false}
                      render={<Link href={action.href} />}
                    >
                      {action.label}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link href={`/business/settings/${business.id}`} />
                      }
                    >
                      Edit profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link href={`/business/services/${business.id}`} />
                      }
                    >
                      Services & areas
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link href={`/business/billing/${business.id}`} />
                      }
                    >
                      Billing
                    </Button>
                    {business.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link href={`/professionals/${business.slug}`} />
                        }
                      >
                        View public profile
                      </Button>
                    )}
                  </div>

                  {showUpgradeNudge && upgradeSlug && (
                    <p className="text-muted-foreground mt-4 border-t pt-4 text-xs">
                      {formatUpgradeReason(upgradeSlug)}{" "}
                      <Link
                        href={`/business/billing/${business.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        Explore{" "}
                        {upgradeSlug === "premium" ? "Premium" : "Featured"}
                        {priceBySlug.has(upgradeSlug)
                          ? ` — ${formatPriceCents(priceBySlug.get(upgradeSlug)!)}/mo`
                          : ""}
                      </Link>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="border-border bg-secondary/20 mt-10 rounded-xl border p-8">
          <h2 className="font-display text-2xl">
            Get your business on YARDOLO
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Create a professional listing or claim an existing YARDOLO business
            so you can keep your information current and receive matched
            homeowner projects.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
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
        </section>
      )}
      {claims.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Claim requests</h2>
          <div className="mt-4 space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">
                    {claim.businesses?.name ?? "Business listing"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Submitted {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">{claim.status}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
