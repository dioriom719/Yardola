import Link from "next/link";
import { BadgeCheck, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectGallery } from "@/components/yardola/project-gallery";
import { ProjectShowcaseCard } from "@/components/yardola/home/project-showcase-card";
import { formatVerificationStatus } from "@/lib/format";
import { buildBusinessJsonLd } from "@/lib/seo/structured-data";
import type { BusinessDetail } from "@/types/business";
import type { ProjectCardData, ProjectPhoto } from "@/types/project";
import type { GuideSummary } from "@/types/guide";

interface ProfessionalProfileViewProps {
  business: BusinessDetail;
  primaryCategory: { name: string; slug: string } | null;
  /** Same-category project candidates, not yet filtered against `business`'s own projects. */
  moreProjectCandidates: ProjectCardData[];
  guides: GuideSummary[];
}

/**
 * A business has no photo library of its own -- its portfolio projects are
 * the only real photography available, so the hero gallery is a synthetic
 * ProjectPhoto[] built from up to 3 of the business's own project hero
 * shots, reusing ProjectGallery exactly as project-detail-view does.
 */
function toHeroPhotos(business: BusinessDetail): ProjectPhoto[] {
  return business.projects
    .filter((p): p is typeof p & { heroImageUrl: string } =>
      Boolean(p.heroImageUrl)
    )
    .slice(0, 3)
    .map((p, i) => ({
      id: p.id,
      url: p.heroImageUrl,
      altText: p.heroImageAlt,
      caption: null,
      photoType: "hero" as const,
      sortOrder: i,
    }));
}

export function ProfessionalProfileView({
  business,
  primaryCategory,
  moreProjectCandidates,
  guides,
}: ProfessionalProfileViewProps) {
  const location = [business.city, business.state].filter(Boolean).join(", ");

  const ownProjectIds = new Set(business.projects.map((p) => p.id));
  const moreProjects = moreProjectCandidates
    .filter((p) => !ownProjectIds.has(p.id))
    .slice(0, 6);

  const heroPhotos = toHeroPhotos(business);
  const portfolioProjects = business.projects.slice(0, 6);
  const soleProfessional =
    business.professionals.length === 1 ? business.professionals[0] : null;
  const aboutText = business.profile?.about ?? business.description;

  const dateline = [location, primaryCategory?.name ?? null]
    .filter((v): v is string => Boolean(v))
    .join(" · ");

  const factsLine = [
    business.profile?.yearEstablished
      ? `In business since ${business.profile.yearEstablished}`
      : null,
    business.professionals.length > 1
      ? `${business.professionals.length}-person team`
      : null,
  ].filter((v): v is string => Boolean(v));

  const startProjectHref = primaryCategory
    ? `/plan/start?${new URLSearchParams({ category: primaryCategory.slug }).toString()}`
    : "/plan/start";

  return (
    <div className="pb-16">
      <JsonLd data={buildBusinessJsonLd(business)} />

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <SeoBreadcrumbs
          className="opacity-70"
          items={[
            { label: "Home", href: "/" },
            { label: "Professionals", href: "/professionals" },
            { label: business.name },
          ]}
        />
      </div>

      {/* HERO -- synthetic multi-photo gallery when the business has 2+
          projects with photography, a single still image for exactly 1,
          and no photographic hero at all for 0 (identity block below still
          carries the page on its own in that case). */}
      {heroPhotos.length > 0 && (
        <div className="mx-auto mt-3 max-w-6xl px-4 sm:px-6 lg:px-8">
          <ProjectGallery photos={heroPhotos} title={business.name} />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-foreground text-4xl sm:text-5xl">
              {business.name}
            </h1>
            {business.verificationStatus === "verified" && (
              <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                <BadgeCheck className="size-4" aria-hidden="true" />
                {formatVerificationStatus(business.verificationStatus)}
              </span>
            )}
          </div>

          {dateline && (
            <p className="text-muted-foreground mt-2 text-sm">{dateline}</p>
          )}

          {business.profile?.tagline && (
            <p className="font-display text-foreground mt-7 text-xl leading-relaxed">
              {business.profile.tagline}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link href={startProjectHref} />}
            >
              Start Your Project
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
                <Globe className="size-4" /> Website
              </Button>
            )}
            {business.phone && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={`tel:${business.phone}`} />}
              >
                <Phone className="size-4" /> {business.phone}
              </Button>
            )}
          </div>
        </div>

        {/* ABOUT -- the narrative plus the sole real supporting facts
            (years in business, team size), merged into one section rather
            than splitting the same handful of fields across About / Company
            Story / Credentials / Team. When there's exactly one public
            professional, they appear as a byline here instead of a
            standalone Team section. */}
        {aboutText && (
          <section className="border-border mt-16 max-w-2xl border-t pt-12">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              About
            </p>
            <p className="font-display text-foreground mt-3 text-xl leading-relaxed whitespace-pre-line">
              {aboutText}
            </p>
            {soleProfessional && (
              <p className="text-muted-foreground mt-4 text-sm">
                {soleProfessional.name}
                {soleProfessional.title ? `, ${soleProfessional.title}` : ""}
              </p>
            )}
            {business.profile?.highlights &&
              business.profile.highlights.length > 0 && (
                <ul className="mt-4 space-y-1">
                  {business.profile.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-muted-foreground text-sm"
                    >
                      &bull; {highlight}
                    </li>
                  ))}
                </ul>
              )}
            {factsLine.length > 0 && (
              <p className="text-muted-foreground mt-8 text-xs">
                {factsLine.join(" · ")}
              </p>
            )}
          </section>
        )}

        {/* PORTFOLIO */}
        {portfolioProjects.length > 0 && (
          <section className="border-border mt-16 border-t pt-12">
            <h2 className="font-display text-foreground text-2xl sm:text-3xl">
              Portfolio
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioProjects.map((project) => (
                <ProjectShowcaseCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* SPECIALTIES -- services and service areas as one consolidated,
            quiet block of inline text links rather than badge pills. */}
        {(business.services.length > 0 || business.serviceAreas.length > 0) && (
          <section className="border-border mt-16 max-w-2xl border-t pt-12">
            <h2 className="font-display text-foreground text-2xl sm:text-3xl">
              Specialties
            </h2>
            {business.services.length > 0 && (
              <div className="mt-6">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Services
                </p>
                <p className="text-foreground mt-2 text-sm">
                  {business.services.map((service, i) => (
                    <span key={service.slug}>
                      {i > 0 && ", "}
                      {service.categorySlug ? (
                        <Link
                          href={`/projects/${service.categorySlug}`}
                          className="hover:text-primary underline-offset-4 hover:underline"
                        >
                          {service.name}
                        </Link>
                      ) : (
                        service.name
                      )}
                    </span>
                  ))}
                </p>
              </div>
            )}
            {business.serviceAreas.length > 0 && (
              <div className="mt-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Service Areas
                </p>
                <p className="text-foreground mt-2 text-sm">
                  {business.serviceAreas.map((area) => area.name).join(", ")}
                </p>
              </div>
            )}
          </section>
        )}

        {/* MORE [CATEGORY] PROJECTS -- other businesses' work in the same
            category, explicitly excluding this business's own projects. */}
        {primaryCategory && moreProjects.length > 0 && (
          <section className="border-border mt-16 border-t pt-12">
            <h2 className="font-display text-foreground text-2xl sm:text-3xl">
              More {primaryCategory.name} Projects
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              See how other professionals approach{" "}
              {primaryCategory.name.toLowerCase()}.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {moreProjects.map((project) => (
                <ProjectShowcaseCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* PRIMARY CTA -- matching is algorithmic (match_lead), so the copy
            never implies a homeowner is contacting or hiring this specific
            business directly. */}
        <section className="border-border mt-16 border-t py-16 text-center">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl">
            Bring This Idea to Life
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
            Start your project and we&apos;ll match you with qualified
            professionals in your area.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 px-8 text-base"
            nativeButton={false}
            render={<Link href={startProjectHref} />}
          >
            Start Your Project
          </Button>
        </section>

        {/* GUIDES */}
        {guides.length > 0 && (
          <section className="border-border border-t pt-12">
            <h2 className="font-display text-foreground text-lg">
              Guides you might like
            </h2>
            <ul className="mt-4 space-y-2">
              {guides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="text-foreground hover:text-primary focus-visible:ring-ring text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
