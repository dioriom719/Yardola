"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resumePendingPlanAction } from "@/app/actions/anonymous-plan";
import {
  PENDING_PLAN_STORAGE_KEY,
  type PendingPlanPayload,
} from "@/lib/pending-plan";

/**
 * Completes a homepage-builder project that couldn't be saved at signup
 * time because email confirmation was required (see
 * src/app/actions/anonymous-plan.ts). Renders nothing in the common case
 * (no ?resume=1, or nothing pending) -- the normal wizard underneath is
 * unaffected. Only shows a full-screen loading state while the one-time
 * resume call is in flight, then redirects to the new plan.
 */
function readPendingPayload(
  hasResumeParam: boolean
): PendingPlanPayload | null {
  if (typeof window === "undefined" || !hasResumeParam) return null;
  try {
    const raw = localStorage.getItem(PENDING_PLAN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingPlanPayload) : null;
  } catch {
    return null;
  }
}

export function ResumePendingPlan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read once, synchronously, during the first render -- the resume
  // action below fires from an effect keyed on this same value, so
  // `isResuming`'s true initial state comes from here rather than from a
  // setState call inside the effect body.
  const [payload] = useState(() =>
    readPendingPayload(searchParams.get("resume") === "1")
  );
  const [isResuming, setIsResuming] = useState(payload !== null);

  useEffect(() => {
    if (!payload) return;

    resumePendingPlanAction(payload).then((result) => {
      try {
        localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
      } catch {
        // Best-effort cleanup only.
      }
      if (result.ok) {
        router.replace(`/account/plans/${result.planId}`);
      } else {
        setIsResuming(false);
        toast.error(result.error);
      }
    });
  }, [payload, router]);

  if (!isResuming) return null;

  return (
    <div className="bg-background/95 fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 backdrop-blur">
      <div
        className="border-muted border-t-primary size-8 animate-spin rounded-full border-4"
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm">Saving your project…</p>
    </div>
  );
}
