import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import type { BusinessCardData } from "@/types/business";

/**
 * Homepage-specific professional card -- Phase 1.6 replaces the split
 * image-grid/beige-block treatment with one large project photo leading,
 * company details secondary underneath. Deliberately homepage-only (not
 * a change to the shared BusinessCard used on /professionals) so the
 * existing directory page is unaffected. Photography is still whatever
 * real preview photos the business has on file -- this only changes how
 * that photo is presented, never fabricates one.
 */
export function ProfessionalShowcaseCard({
  business,
}: {
  business: BusinessCardData;
}) {
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const photo = business.previewPhotoUrls[0] ?? null;

  return (
    <Link
      href={`/professionals/${business.slug}`}
      className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg">
        {photo && (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-1.5">
          <h3 className="font-display text-foreground text-xl">
            {business.name}
          </h3>
          {business.verificationStatus === "verified" && (
            <BadgeCheck
              className="text-primary size-4 shrink-0"
              aria-label="Verified business"
            />
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {business.categoryNames.slice(0, 2).join(" · ")}
          {location ? ` · ${location}` : ""}
        </p>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {business.projectCount}{" "}
          {business.projectCount === 1 ? "project" : "projects"}
        </p>
        <span className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium">
          View Professional
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
