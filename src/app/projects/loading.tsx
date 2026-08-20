import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/yardola/card-grid-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-9 w-96 max-w-full" />
      <Skeleton className="mt-3 h-5 w-72 max-w-full" />
      <div className="mt-8 flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28" />
        ))}
      </div>
      <div className="mt-10">
        <CardGridSkeleton />
      </div>
    </div>
  );
}
