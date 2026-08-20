"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description="We hit an unexpected error loading this page. You can try again, or head back home."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => retry()}>Try again</Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Back to Home
            </Button>
          </div>
        }
      />
    </div>
  );
}
