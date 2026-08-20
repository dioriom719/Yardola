import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { listMyBusinessClaims, listOwnedBusinesses } from "@/lib/data/business-portal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Professional Dashboard | Yardola",
  description: "Manage your Yardola business profile and homeowner leads.",
  path: "/business",
  index: false,
});

export default async function BusinessDashboardPage() {
  const [businesses, claims] = await Promise.all([listOwnedBusinesses(), listMyBusinessClaims()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Professional Dashboard" }]} />
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Professional dashboard</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">Manage your Yardola presence and the homeowner projects matched to your business.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/business/onboarding" />}>Add a business</Button>
      </div>

      {businesses.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Your businesses</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {businesses.map((business) => (
              <article key={business.id} className="border-border rounded-xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl">{business.name}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{business.city && business.state ? `${business.city}, ${business.state}` : "Location not set"}</p>
                  </div>
                  <Badge variant={business.status === "active" ? "default" : "secondary"}>{business.status}</Badge>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-secondary/40 rounded-lg p-3"><div className="font-display text-xl">{business.leadCount}</div><div className="text-muted-foreground text-xs">Leads</div></div>
                  <div className="bg-secondary/40 rounded-lg p-3"><div className="font-display text-xl">{business.serviceCount}</div><div className="text-muted-foreground text-xs">Services</div></div>
                  <div className="bg-secondary/40 rounded-lg p-3"><div className="font-display text-xl">{business.areaCount}</div><div className="text-muted-foreground text-xs">Areas</div></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button nativeButton={false} render={<Link href={`/business/settings/${business.id}`} />}>Edit profile</Button>
                  <Button variant="outline" nativeButton={false} render={<Link href="/business/leads" />}>View leads</Button>
                  {business.status === "active" && <Button variant="ghost" nativeButton={false} render={<Link href={`/business/${business.slug}`} />}>View public profile</Button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="border-border bg-secondary/20 mt-10 rounded-xl border p-8">
          <h2 className="font-display text-2xl">Get your business on Yardola</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">Create a professional listing or claim an existing Yardola business so you can keep your information current and receive matched homeowner projects.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button nativeButton={false} render={<Link href="/business/onboarding" />}>Create a business</Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/business/claim" />}>Claim an existing listing</Button>
          </div>
        </section>
      )}

      {claims.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Claim requests</h2>
          <div className="mt-4 space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div><p className="font-medium">{claim.businesses?.name ?? "Business listing"}</p><p className="text-muted-foreground text-sm">Submitted {new Date(claim.created_at).toLocaleDateString()}</p></div>
                <Badge variant="secondary">{claim.status}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
