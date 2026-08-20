import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Claim Your Business | YARDOLO",
  description: "Find and claim your YARDOLO business listing.",
  path: "/business/claim",
  index: false,
});

export default async function ClaimBusinessPage() {
  const supabase = await createClient();
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, city, state, verification_status")
    .eq("status", "active")
    .is("owner_id", null)
    .order("name")
    .limit(24);
  if (error) throw error;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professional Dashboard", href: "/business" },
          { label: "Claim Business" },
        ]}
      />
      <div className="mt-6">
        <h1 className="font-display text-3xl sm:text-4xl">
          Claim your business
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Choose an unclaimed YARDOLO listing. Claim requests are reviewed
          before ownership is transferred.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(businesses ?? []).map((business) => (
          <article
            key={business.id}
            className="border-border rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{business.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {business.city && business.state
                    ? `${business.city}, ${business.state}`
                    : "Las Vegas area"}
                </p>
              </div>
              <Badge variant="secondary">{business.verification_status}</Badge>
            </div>
            <div className="mt-5">
              <Button
                nativeButton={false}
                render={<Link href={`/business/claim/${business.id}`} />}
              >
                Claim this listing
              </Button>
            </div>
          </article>
        ))}
      </div>
      {(businesses ?? []).length === 0 && (
        <div className="border-border mt-8 rounded-xl border p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No active unclaimed listings are available yet.
          </p>
        </div>
      )}
    </div>
  );
}
