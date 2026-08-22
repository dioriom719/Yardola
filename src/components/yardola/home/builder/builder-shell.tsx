"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuilderShellProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isSaving?: boolean;
  error?: string | null;
  hideFooter?: boolean;
}

/**
 * Embedded, card-contained equivalent of /plan's full-page StepShell --
 * this one lives inside a homepage section, not the whole viewport, so
 * navigation is inline rather than a fixed bottom bar.
 */
export function BuilderShell({
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
  hideFooter = false,
}: BuilderShellProps) {
  return (
    <div className="flex min-h-[24rem] flex-col p-5 sm:p-8">
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

      <div className="mt-4">
        <h3 className="font-display text-foreground text-xl sm:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
        )}
      </div>

      <div className="mt-5 flex-1">{children}</div>

      {error && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      )}

      {!hideFooter && (
        <div className="mt-6 flex gap-3">
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
      )}
    </div>
  );
}
