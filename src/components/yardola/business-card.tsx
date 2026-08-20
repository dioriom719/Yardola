import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BusinessCardData } from "@/types/business";

interface BusinessCardProps {
  business: BusinessCardData;
}

/**
 * Portfolio-oriented business card for the professionals directory --
 * project preview thumbnails carry as much weight as the business
 * identity itself, so this doesn't read as a plain contractor listing.
 */
export function BusinessCard({ business }: BusinessCardProps) {
  const location = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <Link
      href={`/professionals/${business.slug}`}
      className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {business.previewPhotoUrls.length > 0 && (
        <div className="bg-border grid grid-cols-3 gap-px">
          {Array.from({ length: 3 }).map((_, index) => {
            const url = business.previewPhotoUrls[index];
            return (
              <div
                key={index}
                className="bg-muted relative aspect-square overflow-hidden"
              >
                {url && (
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 16vw, 33vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-full">
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
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-foreground truncate text-lg">
              {business.name}
            </h3>
            {business.verificationStatus === "verified" && (
              <BadgeCheck
                className="text-primary size-4 shrink-0"
                aria-label="Verified business"
              />
            )}
          </div>
          {location && (
            <p className="text-muted-foreground truncate text-sm">{location}</p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            {business.projectCount}{" "}
            {business.projectCount === 1 ? "project" : "projects"} on YARDOLO
          </p>
          {business.categoryNames.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {business.categoryNames.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
