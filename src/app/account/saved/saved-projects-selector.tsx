"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/yardola/project-card";
import { formatDate } from "@/lib/format";
import { createPlanFromInspirationAction } from "@/app/actions/plans";
import { cn } from "@/lib/utils";
import type { SavedProjectEntry } from "@/types";

/**
 * Lets a homeowner pick a few saved projects and turn them straight into
 * a new plan's inspiration -- the connective tissue between "save
 * inspiration" and "create a plan" that the dashboard alone doesn't
 * provide.
 */
export function SavedProjectsSelector({
  entries,
}: {
  entries: SavedProjectEntry[];
}) {
  const router = useRouter();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleStartPlan() {
    startTransition(async () => {
      const result = await createPlanFromInspirationAction([...selectedIds]);
      if (result.ok) {
        router.push(`/plan?planId=${result.data}`);
      } else {
        toast.error("Unable to start a plan. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectMode((value) => !value);
            setSelectedIds(new Set());
          }}
        >
          {selectMode ? "Cancel" : "Select"}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entries.map((entry) => {
          const isSelected = selectedIds.has(entry.project.id);
          return (
            <div key={entry.project.id} className="space-y-2">
              <div className="relative">
                <ProjectCard project={entry.project} initialSaved />
                {selectMode && (
                  <button
                    type="button"
                    onClick={() => toggle(entry.project.id)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${entry.project.title} as inspiration`}
                    className={cn(
                      "absolute top-2 left-2 z-30 flex size-7 items-center justify-center rounded-full border-2 shadow-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/90"
                    )}
                  >
                    {isSelected && <Check className="size-4" />}
                  </button>
                )}
              </div>
              <p className="text-muted-foreground px-0.5 text-xs">
                Saved {formatDate(entry.savedAt)}
              </p>
            </div>
          );
        })}
      </div>

      {selectMode && selectedIds.size > 0 && (
        <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-16 z-30 border-t p-3 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium">{selectedIds.size} selected</p>
            <Button onClick={handleStartPlan} disabled={isPending}>
              {isPending
                ? "Starting…"
                : `Start a Plan with ${selectedIds.size} Selected`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
