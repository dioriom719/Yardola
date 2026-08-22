import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfessionalShowcaseCard } from "@/components/yardola/home/professional-showcase-card";
import type { BusinessCardData } from "@/types/business";

export function ProfessionalsSection({
  businesses,
}: {
  businesses: BusinessCardData[];
}) {
  if (businesses.length === 0) return null;

  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl lg:text-5xl">
            Find the right professional.
          </h2>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/professionals" />}
          >
            Browse all professionals
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <ProfessionalShowcaseCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    </section>
  );
}
