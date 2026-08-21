"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { CATEGORY_IMAGES } from "@/lib/images/category-imagery";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

/**
 * Large, photo-backed choice tiles for the builder's first step -- the
 * one moment in the flow the brief specifically calls out for imagery
 * over plain option rows (contrast with the authenticated /plan wizard's
 * text-only OptionToggle, which stays as-is).
 */
export function ProjectTypeTiles({
  categories,
  selectedIds,
  onChange,
}: {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id]
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {categories.map((category) => {
        const image = CATEGORY_IMAGES[category.slug];
        const selected = selectedIds.includes(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => toggle(category.id)}
            aria-pressed={selected}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg outline-none",
              selected
                ? "ring-primary ring-2 ring-offset-2"
                : "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
            )}
          >
            {image && (
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(min-width: 640px) 20vw, 40vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            )}
            <div
              className={cn(
                "absolute inset-0 transition-colors",
                selected
                  ? "bg-primary/40"
                  : "bg-black/35 group-hover:bg-black/45"
              )}
            />
            <span className="absolute bottom-2 left-2 text-left text-xs font-medium text-white sm:text-sm">
              {category.name}
            </span>
            {selected && (
              <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full">
                <Check className="size-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
