import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { updateBusinessProfile } from "@/app/actions/business";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Business Profile Settings | YARDOLO",
  description: "Manage your YARDOLO business profile.",
  path: "/business/settings",
  index: false,
});

export default async function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, description, website, phone, email, address, city, state, zip"
    )
    .eq("id", businessId)
    .maybeSingle();
  if (!business) notFound();
  const action = updateBusinessProfile.bind(null, business.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professional Dashboard", href: "/business" },
          { label: "Edit Profile" },
        ]}
      />
      <div className="mt-6">
        <h1 className="font-display text-3xl">Edit business profile</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Keep your core business information accurate. YARDOLO uses this
          information when presenting you to homeowners.
        </p>
      </div>
      <form
        action={action}
        className="border-border mt-8 space-y-5 rounded-xl border p-6 sm:p-8"
      >
        <div>
          <label className="text-sm font-medium" htmlFor="name">
            Business name *
          </label>
          <input
            className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
            id="name"
            name="name"
            defaultValue={business.name}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            className="border-border bg-background mt-2 min-h-28 w-full rounded-md border px-3 py-2 text-sm"
            id="description"
            name="description"
            defaultValue={business.description ?? ""}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="website">
              Website
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="website"
              name="website"
              type="url"
              defaultValue={business.website ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="phone">
              Phone
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="phone"
              name="phone"
              defaultValue={business.phone ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="email"
              name="email"
              type="email"
              defaultValue={business.email ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="address"
              name="address"
              defaultValue={business.address ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="city">
              City
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="city"
              name="city"
              defaultValue={business.city ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="state">
              State
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="state"
              name="state"
              defaultValue={business.state ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="zip">
              ZIP
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="zip"
              name="zip"
              defaultValue={business.zip ?? ""}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save changes</Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/business" />}
          >
            Back to dashboard
          </Button>
        </div>
      </form>
    </div>
  );
}
