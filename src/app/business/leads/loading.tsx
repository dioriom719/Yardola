import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-5 h-9 w-56" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-1 h-5 w-2/3 max-w-2xl" />

      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-border rounded-xl border p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-4 w-56" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="mt-5 h-9 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
