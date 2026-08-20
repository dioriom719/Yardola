"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepShellProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isSaving?: boolean;
  error?: string | null;
}

/**
 * Shared shell for every planner step: a subtle progress bar, the
 * question, and a sticky bottom action bar on mobile (inline on
 * desktop). Keeps every step visually consistent without each one
 * re-implementing navigation.
 */
export function StepShell({
  step,
  totalSteps,
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Next",
  isNextDisabled = false,
  isSaving = false,
  error,
}: StepShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-8 pb-28 sm:px-6 md:pb-12">
      <div>
        <div className="bg-muted h-1 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-xs font-medium">
          Step {step} of {totalSteps}
        </p>
      </div>

      <div className="mt-6">
        <h1 className="font-display text-foreground text-2xl sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        )}
      </div>

      <div className="mt-8 flex-1">{children}</div>

      {error && (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error}
        </p>
      )}

      <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t px-4 py-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="h-12"
          >
            <ChevronLeft />
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={isNextDisabled || isSaving}
          className="h-12 flex-1"
        >
          {isSaving ? "Saving…" : nextLabel}
        </Button>
      </div>
    </div>
  );
}
