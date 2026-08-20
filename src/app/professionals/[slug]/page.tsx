import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgeCheck, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumbs } from "@/components/yardola/page-breadcrumbs";
import { ProjectGrid } from "@/components/yardola/project-grid";
import { getBusinessBySlug } from "@/lib/data/businesses";
import { listGuides } from "@/lib/data/guides";
import { formatVerificationStatus } from "@/lib/format";

export async function generateMetadata(
  props: PageProps<"/professionals/[slug]">
) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: "Yardola" };
  return { title: `${business.name} | Yardola` };
}

export default async function ProfessionalPage(
  props: PageProps<"/professionals/[slug]">
) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const location = [business.city, business.state].filter(Boolean).join(", ");
  const guides = business.services.length > 0 ? await listGuides(3) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Professionals", href: "/professionals" },
          { label: business.name },
        ]}
      />

      {/* Header */}
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-full">
          {business.logoUrl && (
            <Image
              src={business.logoUrl}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-foreground text-3xl">
              {business.name}
            </h1>
            {business.verificationStatus === "verified" && (
              <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                <BadgeCheck className="size-4" aria-hidden="true" />
                {formatVerificationStatus(business.verificationStatus)}
              </span>
            )}
          </div>
          {business.profile?.tagline && (
            <p className="text-muted-foreground mt-1 text-lg">
              {business.profile.tagline}
            </p>
          )}
          {location && (
            <p className="text-muted-foreground mt-2 text-sm">{location}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/plan" />}>
              Request a Project
            </Button>
            {business.website && (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Globe className="size-4" />
                Website
              </Button>
            )}
            {business.phone && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={`tel:${business.phone}`} />}
              >
                <Phone className="size-4" />
                {business.phone}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {(business.profile?.about || business.description) && (
            <section>
              <h2 className="font-display text-foreground text-xl">About</h2>
              <p className="text-muted-foreground mt-3 whitespace-pre-line">
                {business.profile?.about ?? business.description}
              </p>
            </section>
          )}

          {business.profile?.highlights &&
            business.profile.highlights.length > 0 && (
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {business.profile.highlights.map((highlight) => (
                  <li key={highlight} className="text-muted-foreground text-sm">
                    &bull; {highlight}
                  </li>
                ))}
              </ul>
            )}

          {/* Portfolio */}
          <section className="mt-10">
            <h2 className="font-display text-foreground text-xl">Portfolio</h2>
            <div className="mt-4">
              <ProjectGrid projects={business.projects} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {business.services.length > 0 && (
            <div className="border-border bg-card rounded-lg border p-5">
              <h2 className="font-display text-foreground text-lg">Services</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {business.services.map((service) => (
                  <Badge key={service.slug} variant="secondary">
                    {service.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {business.serviceAreaCityNames.length > 0 && (
            <div className="border-border bg-card rounded-lg border p-5">
              <h2 className="font-display text-foreground text-lg">
                Service Areas
              </h2>
              <p className="text-muted-foreground mt-3 text-sm">
                {business.serviceAreaCityNames.join(", ")}
              </p>
            </div>
          )}

          {business.profile?.yearEstablished && (
            <div className="border-border bg-card rounded-lg border p-5">
              <h2 className="font-display text-foreground text-lg">
                Credentials
              </h2>
              <p className="text-muted-foreground mt-3 text-sm">
                In business since {business.profile.yearEstablished}
              </p>
            </div>
          )}

          {business.professionals.length > 0 && (
            <div className="border-border bg-card rounded-lg border p-5">
              <h2 className="font-display text-foreground text-lg">Team</h2>
              <ul className="mt-3 space-y-3">
                {business.professionals.map((professional) => (
                  <li key={professional.id} className="flex items-center gap-3">
                    <div className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-full">
                      {professional.photoUrl && (
                        <Image
                          src={professional.photoUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-medium">
                        {professional.name}
                      </p>
                      {professional.title && (
                        <p className="text-muted-foreground truncate text-xs">
                          {professional.title}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {guides.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Related guides
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring block rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <h3 className="font-display text-foreground text-lg">
                  {guide.title}
                </h3>
                {guide.excerpt && (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                    {guide.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
