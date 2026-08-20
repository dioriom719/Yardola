import type { ReactNode } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessCard } from "@/components/yardola/business-card";
import type { BusinessCardData } from "@/types/business";

interface BusinessGridProps {
  businesses: BusinessCardData[];
  emptyState?: ReactNode;
}

export function BusinessGrid({ businesses, emptyState }: BusinessGridProps) {
  if (businesses.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          icon={Users}
          title="No professionals found"
          description="Try a different category or location."
        />
      )
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}
