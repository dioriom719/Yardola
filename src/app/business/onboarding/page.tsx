import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { createBusiness } from "@/app/actions/business";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Add Your Business | YARDOLO",
  description: "Create a YARDOLO professional listing.",
  path: "/business/onboarding",
  index: false,
});

export default function BusinessOnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professional Dashboard", href: "/business" },
          { label: "Add Business" },
        ]}
      />
      <div className="mt-6">
        <h1 className="font-display text-3xl sm:text-4xl">Add your business</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Create your listing with the information homeowners need to understand
          who you are and where you work.
        </p>
      </div>
      <form
        action={createBusiness}
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
              type="tel"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Business email
            </label>
            <input
              className="border-border bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              id="email"
              name="email"
              type="email"
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
              defaultValue="NV"
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
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit">Create listing</Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/business" />}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
