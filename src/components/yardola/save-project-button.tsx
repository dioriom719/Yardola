"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  saveProjectAction,
  unsaveProjectAction,
} from "@/app/actions/saved-projects";
import { AuthPromptDialog } from "@/components/yardola/auth-prompt-dialog";

interface SaveProjectButtonProps {
  projectId: string;
  initialSaved?: boolean;
  /** "icon" for a compact overlay on a project card; "full" for a labeled button on the detail page. */
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Optimistic save/unsave with rollback on failure. A signed-out click
 * shows an auth prompt instead of failing silently; the prompt's
 * sign-in/sign-up links carry `?save=<projectId>` in `next` so this same
 * component can auto-complete the save the moment the homeowner lands
 * back here, already authenticated -- no need to find the project again.
 */
export function SaveProjectButton({
  projectId,
  initialSaved = false,
  variant = "icon",
  className,
}: SaveProjectButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const shouldResumeSave =
    searchParams.get("save") === projectId && !initialSaved;

  // Render as already-saved on the very first paint when resuming --
  // the actual request fires in the effect below, but the UI shouldn't
  // flash from unsaved to saved.
  const [saved, setSaved] = useState(initialSaved || shouldResumeSave);
  const [isPending, startTransition] = useTransition();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const hasResumedRef = useRef(false);

  useEffect(() => {
    if (!shouldResumeSave || hasResumedRef.current) return;
    hasResumedRef.current = true;

    const params = new URLSearchParams(searchParams);
    params.delete("save");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    startTransition(async () => {
      const result = await saveProjectAction(projectId);
      if (!result.ok) {
        setSaved(false);
        if (result.reason === "unauthenticated") {
          setShowAuthPrompt(true);
        } else {
          toast.error("Unable to save. Please try again.");
        }
        return;
      }
      toast.success("Saved to your inspiration board.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldResumeSave]);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (isPending) return;

    if (saved) {
      setSaved(false);
      startTransition(async () => {
        const result = await unsaveProjectAction(projectId);
        if (!result.ok) {
          setSaved(true);
          toast.error("Unable to remove. Please try again.");
        }
      });
      return;
    }

    setSaved(true);
    startTransition(async () => {
      const result = await saveProjectAction(projectId);
      if (!result.ok) {
        setSaved(false);
        if (result.reason === "unauthenticated") {
          setShowAuthPrompt(true);
        } else {
          toast.error("Unable to save. Please try again.");
        }
      }
    });
  }

  const label = saved ? "Saved" : "Save";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved projects" : "Save this project"}
        className={cn(
          variant === "icon"
            ? "bg-background/90 hover:bg-background flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-colors disabled:opacity-60"
            : "border-border hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60",
          className
        )}
      >
        <Heart
          className={cn("size-4", saved && "fill-primary text-primary")}
          aria-hidden="true"
        />
        {variant === "full" && label}
      </button>
      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        next={`${pathname}?save=${projectId}`}
      />
    </>
  );
}
