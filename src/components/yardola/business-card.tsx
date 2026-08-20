import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BusinessSummary } from "@/types";

interface BusinessCardProps {
  business: BusinessSummary;
}

/**
 * Presentational card for a single professional/business. Phase 1
 * structure only -- not yet wired to real business data or a profile route.
 */
export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/professionals/${business.id}`}
      className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex items-center gap-4 rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-full">
        {business.logoUrl && (
          <Image
            src={business.logoUrl}
            alt={business.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-foreground truncate text-lg">
          {business.name}
        </h3>
        <p className="text-muted-foreground truncate text-sm">
          {business.location}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {business.categories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
