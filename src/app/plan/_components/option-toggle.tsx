"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionToggleProps {
  label: string;
  description?: string;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Large, visual, touch-friendly selectable option -- used for project
 * type / style / feature / budget / timeline choices. Deliberately not a
 * checkbox or radio input: the whole card is the target, sized well
 * past minimum touch-target guidelines.
 */
export function OptionToggle({
  label,
  description,
  selected,
  onToggle,
}: OptionToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span>
        <span className="text-foreground block text-sm font-medium">
          {label}
        </span>
        {description && (
          <span className="text-muted-foreground mt-0.5 block text-xs">
            {description}
          </span>
        )}
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border"
        )}
        aria-hidden="true"
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  );
}
