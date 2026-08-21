import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { listActivePlans } from "@/lib/data/billing";
import {
  formatBillingInterval,
  formatPlanFeature,
  formatPlanTagline,
  formatPriceCents,
} from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "For Professionals | YARDOLO",
  description:
    "Get discovered by homeowners planning real backyard projects in Las Vegas. Compare YARDOLO's Basic, Featured, and Premium marketplace plans for professionals.",
  path: "/for-professionals",
  index: true,
});

export default async function ForProfessionalsPage() {
  const plans = await listActivePlans();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "For Professionals" }]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Grow your business on YARDOLO
        </h1>
        <p className="text-muted-foreground mt-3">
          YARDOLO connects Las Vegas homeowners planning real backyard projects
          with qualified professionals. Every plan gives you access to qualified
          marketplace opportunities -- Featured and Premium add priority
          placement and exposure among them.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isFeatured = plan.slug === "featured";
          return (
            <article
              key={plan.id}
              className={
                isFeatured
                  ? "border-primary bg-card relative flex flex-col rounded-xl border-2 p-6 sm:p-8"
                  : "border-border bg-card flex flex-col rounded-xl border p-6 sm:p-8"
              }
            >
              {isFeatured && (
                <Badge className="absolute -top-3 left-6">Most popular</Badge>
              )}
              <h2 className="font-display text-foreground text-xl">
                {plan.name}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                {formatPlanTagline(plan.slug)}
              </p>
              <p className="mt-4 text-3xl font-semibold">
                {formatPriceCents(plan.priceCents)}
                {plan.priceCents > 0 && (
                  <span className="text-muted-foreground text-base font-normal">
                    {formatBillingInterval(plan.billingInterval)}
                  </span>
                )}
              </p>
              {plan.description && (
                <p className="text-muted-foreground mt-3 text-sm">
                  {plan.description}
                </p>
              )}

              <ul className="mt-6 space-y-2 text-sm">
                {plan.slug !== "basic" && (
                  <li className="text-muted-foreground">
                    Everything in{" "}
                    {plan.slug === "premium" ? "Featured" : "Basic"}, plus:
                  </li>
                )}
                {plan.features.map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <Check
                      className="text-primary mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{formatPlanFeature(key)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  className="w-full"
                  variant={isFeatured ? "default" : "outline"}
                  nativeButton={false}
                  render={<Link href="/business/onboarding" />}
                >
                  {plan.priceCents === 0 ? "Get started free" : "Get started"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-xs">
        YARDOLO matches qualified professionals to homeowner projects based on
        service, location, and project fit -- a higher plan increases your
        priority and exposure among qualified opportunities, not the number of
        opportunities YARDOLO has to route.
      </p>
    </div>
  );
}
