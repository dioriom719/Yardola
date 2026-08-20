import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { updateBusinessTaxonomy } from "@/app/actions/business";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Services & Areas | YARDOLO",
  description: "Manage your YARDOLO services and service areas.",
  path: "/business/services",
  index: false,
});

interface ServiceOptionRow {
  id: string;
  name: string;
  categories: { name: string } | null;
}

export default async function BusinessServicesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const [
    { data: business },
    { data: services },
    { data: cities },
    { data: selectedServices },
    { data: selectedAreas },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name")
      .eq("id", businessId)
      .maybeSingle(),
    supabase
      .from("services")
      .select("id, name, categories(name)")
      .eq("is_active", true)
      .order("name")
      .returns<ServiceOptionRow[]>(),
    supabase.from("cities").select("id, name, slug").order("name"),
    supabase
      .from("business_services")
      .select("service_id")
      .eq("business_id", businessId),
    supabase
      .from("business_service_areas")
      .select("city_id")
      .eq("business_id", businessId),
  ]);
  if (!business) notFound();
  const serviceSet = new Set(
    (selectedServices ?? []).map((row) => row.service_id)
  );
  const citySet = new Set((selectedAreas ?? []).map((row) => row.city_id));
  const action = updateBusinessTaxonomy.bind(null, businessId);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professional Dashboard", href: "/business" },
          { label: "Services & Areas" },
        ]}
      />
      <div className="mt-6">
        <h1 className="font-display text-3xl">Services & service areas</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Tell homeowners exactly what {business.name} does and where you work.
        </p>
      </div>
      <form action={action} className="mt-8 space-y-8">
        <section className="border-border rounded-xl border p-6">
          <h2 className="font-display text-xl">Services</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(services ?? []).map((service) => (
              <label
                key={service.id}
                className="border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3"
              >
                <input
                  type="checkbox"
                  name="serviceId"
                  value={service.id}
                  defaultChecked={serviceSet.has(service.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">
                    {service.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {service.categories?.name ?? "Backyard service"}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
        <section className="border-border rounded-xl border p-6">
          <h2 className="font-display text-xl">Service areas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(cities ?? []).map((city) => (
              <label
                key={city.id}
                className="border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              >
                <input
                  type="checkbox"
                  name="cityId"
                  value={city.id}
                  defaultChecked={citySet.has(city.id)}
                />
                <span className="text-sm font-medium">{city.name}</span>
              </label>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save services & areas</Button>
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
