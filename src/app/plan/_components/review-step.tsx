"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ProjectCardData } from "@/types/project";

interface SummaryRow {
  label: string;
  value: string;
  step: number;
}

interface ReviewStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  categoryNames: string[];
  cityLabel: string | null;
  styleNames: string[];
  featureNames: string[];
  budgetLabel: string | null;
  timelineLabel: string | null;
  description: string;
  photoCount: number;
  inspiration: ProjectCardData[];
  onRemoveInspiration: (projectId: string) => void;
  onEditStep: (step: number) => void;
}

export function ReviewStep({
  title,
  onTitleChange,
  categoryNames,
  cityLabel,
  styleNames,
  featureNames,
  budgetLabel,
  timelineLabel,
  description,
  photoCount,
  inspiration,
  onRemoveInspiration,
  onEditStep,
}: ReviewStepProps) {
  const rows: SummaryRow[] = [
    {
      label: "Project",
      value: categoryNames.join(" + ") || "Not set",
      step: 1,
    },
    { label: "Location", value: cityLabel ?? "Not set", step: 2 },
    {
      label: "Style",
      value: styleNames.join(", ") || "Not specified",
      step: 4,
    },
    {
      label: "Features",
      value:
        featureNames.length > 0 ? featureNames.join(", ") : "Not specified",
      step: 5,
    },
    { label: "Budget", value: budgetLabel ?? "Not specified", step: 6 },
    { label: "Timeline", value: timelineLabel ?? "Not specified", step: 7 },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <label htmlFor="plan-title" className="text-sm font-medium">
          Plan name
        </label>
        <Input
          id="plan-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={
            categoryNames.length > 0
              ? `My ${categoryNames[0]} Project`
              : "My Backyard Plan"
          }
          className="h-11"
        />
      </div>

      <dl className="divide-border divide-y">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 py-3"
          >
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {row.label}
              </dt>
              <dd className="text-foreground mt-1 text-sm">{row.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(row.step)}
              className="text-primary shrink-0 text-xs font-medium hover:underline"
            >
              Edit
            </button>
          </div>
        ))}

        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Description
            </dt>
            <dd className="text-foreground mt-1 line-clamp-3 text-sm whitespace-pre-line">
              {description || "Not specified"}
            </dd>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(8)}
            className="text-primary shrink-0 text-xs font-medium hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Photos
            </dt>
            <dd className="text-foreground mt-1 text-sm">
              {photoCount} uploaded
            </dd>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-primary shrink-0 text-xs font-medium hover:underline"
          >
            Edit
          </button>
        </div>
      </dl>

      {inspiration.length > 0 && (
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Inspiration ({inspiration.length})
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {inspiration.map((project) => (
              <div
                key={project.id}
                className="bg-muted relative aspect-square overflow-hidden rounded-md"
              >
                {project.heroImageUrl && (
                  <Image
                    src={project.heroImageUrl}
                    alt={project.title}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveInspiration(project.id)}
                  aria-label={`Remove ${project.title} from inspiration`}
                  className="bg-background/90 hover:bg-background absolute top-1 right-1 flex size-5 items-center justify-center rounded-full"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
