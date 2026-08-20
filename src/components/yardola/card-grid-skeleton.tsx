import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardGridSkeletonProps {
  count?: number;
  columns?: string;
}

export function CardGridSkeleton({
  count = 8,
  columns = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}: CardGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-6", columns)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border-border overflow-hidden rounded-lg border"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
