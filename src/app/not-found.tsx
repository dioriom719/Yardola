import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <EmptyState
        icon={CompassIcon}
        title="We couldn't find that page"
        description="The project, professional, or page you're looking for may have moved or no longer exists."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button nativeButton={false} render={<Link href="/" />}>
              Back to Home
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/projects" />}
            >
              Explore Projects
            </Button>
          </div>
        }
      />
    </div>
  );
}
