import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <Icon
          className="text-muted-foreground mb-4 size-10"
          aria-hidden="true"
        />
      )}
      <h3 className="font-display text-foreground text-xl">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
