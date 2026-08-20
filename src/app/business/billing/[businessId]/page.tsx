import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import {
  cancelSubscription,
  openCustomerPortal,
  resumeSubscription,
  startCheckout,
} from "@/app/actions/billing";
import {
  getBusinessSubscription,
  listActivePlans,
  listBusinessTransactions,
} from "@/lib/data/billing";
import {
  formatBillingInterval,
  formatDate,
  formatPriceCents,
  formatSubscriptionStatus,
} from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Billing | YARDOLO",
  description: "Manage your YARDOLO business subscription and billing.",
  path: "/business/billing",
  index: false,
});

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

export default async function BusinessBillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { businessId } = await params;
  const { checkout } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Explicit owner_id filter, not just id -- businesses are publicly
  // readable when active, so an id-only lookup would leak another
  // owner's business into this billing page.
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) notFound();

  const { data: billing } = await supabase
    .from("business_billing")
    .select("stripe_customer_id")
    .eq("business_id", businessId)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  const [subscription, transactions, plans] = await Promise.all([
    getBusinessSubscription(businessId),
    listBusinessTransactions(businessId),
    listActivePlans(),
  ]);

  const hasStripeCustomer = Boolean(billing?.stripe_customer_id);
  const isSubscribed = subscription
    ? ACTIVE_STATUSES.includes(subscription.status)
    : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professional Dashboard", href: "/business" },
          { label: "Billing" },
        ]}
      />
      <div className="mt-6">
        <h1 className="font-display text-3xl">Billing</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage {business.name}&apos;s YARDOLO subscription.
        </p>
      </div>

      {checkout === "success" && (
        <div className="border-border bg-secondary/30 mt-6 rounded-xl border p-4 text-sm">
          Thanks! We&apos;re finalizing your subscription -- this page will
          update automatically once Stripe confirms payment.
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="border-border bg-secondary/30 mt-6 rounded-xl border p-4 text-sm">
          Checkout was cancelled. No changes were made to your subscription.
        </div>
      )}

      <section className="border-border mt-8 rounded-xl border p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">
              {subscription ? subscription.plan.name : "Basic (free)"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {subscription
                ? `${formatPriceCents(subscription.plan.priceCents)}${formatBillingInterval(subscription.plan.billingInterval)}`
                : "No active subscription"}
            </p>
          </div>
          {subscription && (
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {formatSubscriptionStatus(subscription.status)}
            </Badge>
          )}
        </div>

        {subscription && (
          <dl className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                {subscription.cancelAtPeriodEnd
                  ? "Access ends"
                  : "Renews / current period ends"}
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDate(subscription.currentPeriodEnd) ?? "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                Payment status
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {subscription.status === "past_due"
                  ? "Payment past due -- update your payment method"
                  : subscription.status === "incomplete"
                    ? "Payment required to activate"
                    : "Up to date"}
              </dd>
            </div>
          </dl>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <p className="text-muted-foreground mt-3 text-sm">
            Your subscription is set to cancel at the end of the current period.
            You can resume any time before then.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {hasStripeCustomer && (
            <form action={openCustomerPortal.bind(null, businessId)}>
              <Button type="submit" variant="outline">
                Manage payment method & invoices
              </Button>
            </form>
          )}
          {isSubscribed &&
            (subscription?.cancelAtPeriodEnd ? (
              <form action={resumeSubscription.bind(null, businessId)}>
                <Button type="submit" variant="outline">
                  Resume subscription
                </Button>
              </form>
            ) : (
              <form action={cancelSubscription.bind(null, businessId)}>
                <Button type="submit" variant="ghost">
                  Cancel subscription
                </Button>
              </form>
            ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">
          {isSubscribed ? "Change plan" : "Choose a plan"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan.id === plan.id && isSubscribed;
            const canCheckout = Boolean(plan.stripePriceId) && !isCurrent;
            return (
              <article
                key={plan.id}
                className="border-border bg-card flex flex-col rounded-xl border p-5"
              >
                <h3 className="font-display text-lg">{plan.name}</h3>
                <p className="mt-1 text-2xl font-semibold">
                  {formatPriceCents(plan.priceCents)}
                  <span className="text-muted-foreground text-sm font-normal">
                    {plan.priceCents > 0
                      ? formatBillingInterval(plan.billingInterval)
                      : ""}
                  </span>
                </p>
                {plan.description && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {plan.description}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  {isCurrent ? (
                    <Badge>Current plan</Badge>
                  ) : canCheckout ? (
                    <form action={startCheckout.bind(null, businessId)}>
                      <input type="hidden" name="planId" value={plan.id} />
                      <Button type="submit" className="w-full">
                        {isSubscribed ? "Switch to this plan" : "Choose plan"}
                      </Button>
                    </form>
                  ) : (
                    <Button type="button" className="w-full" disabled>
                      Not available yet
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {transactions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Billing history</h2>
          <div className="mt-4 space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {tx.description ?? "Subscription payment"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formatPriceCents(tx.amountCents)}
                  </span>
                  <Badge
                    variant={
                      tx.status === "succeeded" ? "default" : "secondary"
                    }
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/business" />}
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
