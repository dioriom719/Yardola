import Link from "next/link";
import { MapPin } from "lucide-react";
import type { LocationSummary } from "@/types";

interface LocationCardProps {
  location: LocationSummary;
}

/**
 * Entry point into projects/professionals for a specific service area
 * (e.g. Las Vegas, Henderson). Phase 1 structure only.
 */
export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={`/locations/${location.slug}`}
      className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex items-center justify-between rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="text-foreground flex items-center gap-2 font-medium">
        <MapPin className="text-primary size-4" aria-hidden="true" />
        {location.name}
      </span>
      {typeof location.projectCount === "number" && (
        <span className="text-muted-foreground text-sm">
          {location.projectCount} projects
        </span>
      )}
    </Link>
  );
}
