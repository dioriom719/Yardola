import Link from "next/link";
import { MapPin } from "lucide-react";
import type { City } from "@/types/location";

interface LocationCardProps {
  city: City;
  projectCount?: number;
}

/**
 * Entry point into projects/professionals for a specific service area
 * (e.g. Las Vegas, Henderson).
 */
export function LocationCard({ city, projectCount }: LocationCardProps) {
  return (
    <Link
      href={`/locations/${city.slug}`}
      className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex items-center justify-between rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="text-foreground flex items-center gap-2 font-medium">
        <MapPin className="text-primary size-4" aria-hidden="true" />
        {city.name}, {city.stateAbbreviation}
      </span>
      {typeof projectCount === "number" && (
        <span className="text-muted-foreground text-sm">
          {projectCount} {projectCount === 1 ? "project" : "projects"}
        </span>
      )}
    </Link>
  );
}
