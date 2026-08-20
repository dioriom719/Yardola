import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { submitBusinessClaim } from "@/app/actions/business";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Claim Business | YARDOLO",
  description: "Request ownership of a YARDOLO business listing.",
  path: "/business/claim",
  index: false,
});

export default async function ClaimBusinessDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, description, city, state, owner_id, status")
    .eq("id", businessId)
    .maybeSingle();
  if (!business || business.status !== "active" || business.owner_id)
    notFound();

  const action = submitBusinessClaim.bind(null, business.id);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Claim Business", href: "/business/claim" },
          { label: business.name },
        ]}
      />
      <div className="border-border mt-6 rounded-xl border p-6 sm:p-8">
        <h1 className="font-display text-3xl">Claim {business.name}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {business.city && business.state
            ? `${business.city}, ${business.state}`
            : "YARDOLO listing"}
        </p>
        {business.description && (
          <p className="text-muted-foreground mt-5 text-sm">
            {business.description}
          </p>
        )}
        <form action={action} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium" htmlFor="verificationInfo">
              Tell us why you represent this business
            </label>
            <textarea
              className="border-border bg-background mt-2 min-h-32 w-full rounded-md border px-3 py-2 text-sm"
              id="verificationInfo"
              name="verificationInfo"
              placeholder="Website, license, business email, or other information our team can use to verify your request."
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Submit claim</Button>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/business/claim" />}
            >
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
