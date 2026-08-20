"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  deletePlanPhotoAction,
  removePlanInspirationAction,
} from "@/app/actions/plans";

export function RemovePhotoButton({
  planId,
  photoId,
}: {
  planId: string;
  photoId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Remove photo"
      onClick={() =>
        startTransition(async () => {
          const result = await deletePlanPhotoAction(planId, photoId);
          if (result.ok) router.refresh();
          else toast.error("Unable to remove photo. Please try again.");
        })
      }
      className="bg-background/90 hover:bg-background absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-sm disabled:opacity-60"
    >
      <X className="size-4" />
    </button>
  );
}

export function RemoveInspirationButton({
  planId,
  projectId,
}: {
  planId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Remove from inspiration"
      onClick={() =>
        startTransition(async () => {
          const result = await removePlanInspirationAction(planId, projectId);
          if (result.ok) router.refresh();
          else toast.error("Unable to remove. Please try again.");
        })
      }
      className="bg-background/90 hover:bg-background absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-sm disabled:opacity-60"
    >
      <X className="size-4" />
    </button>
  );
}
