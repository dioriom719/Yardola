"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBudgetRange, formatTimeline } from "@/lib/format";
import { OptionToggle } from "./option-toggle";
import {
  uploadPlanPhotoAction,
  deletePlanPhotoAction,
} from "@/app/actions/plans";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ZipCode } from "@/lib/data/locations";
import type { Style } from "@/lib/data/styles";
import type { Feature } from "@/lib/data/features";
import type { BudgetRange, PlanPhoto, ProjectTimeline } from "@/types";

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
}

// -- Step 1: Project type ----------------------------------------------

export function ProjectTypeStep({
  categories,
  selectedIds,
  onChange,
}: {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="space-y-2.5">
      {categories.map((category) => (
        <OptionToggle
          key={category.id}
          label={category.name}
          selected={selectedIds.includes(category.id)}
          onToggle={() => onChange(toggleId(selectedIds, category.id))}
        />
      ))}
    </div>
  );
}

// -- Step 2: Location ----------------------------------------------------

export function LocationStep({
  cities,
  zipCodes,
  cityId,
  zipCodeId,
  onCityChange,
  onZipChange,
}: {
  cities: City[];
  zipCodes: ZipCode[];
  cityId: string | null;
  zipCodeId: string | null;
  onCityChange: (id: string | null) => void;
  onZipChange: (id: string | null) => void;
}) {
  const zipOptions = zipCodes.filter((z) => z.cityId === cityId);

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">City</label>
        {/*
          Two deliberate, isolated fixes to this Select (Phase 18), neither
          touching the shared Select component or any other Select usage:
          1. `value={cityId ?? ""}` -- Base UI's Select treats an `undefined`
             value as uncontrolled; a null cityId on first render followed by
             a real id after selection flipped it from uncontrolled to
             controlled, which Base UI warns about. "" never matches an item
             (see hasSelectedValue's stringifyAsValue check), so the
             placeholder still shows, but the value stays a defined string
             for the component's whole lifetime.
          2. `<SelectValue>` given a render function -- this Select never
             passes an `items` map to `Select.Root` (we use declarative
             `SelectItem` children instead), so Base UI's built-in
             `resolveSelectedLabel` has nothing to look the id up against
             and falls back to rendering the raw stored value, i.e. the
             city's UUID, as the trigger's label. That's a real, more severe
             bug than the console warning -- confirmed via screenshot, not
             just source reading. The render function resolves the label
             ourselves from the same `cities` array already used to build
             the options, which is the correct fix for a Select without an
             `items` prop.
        */}
        <Select
          value={cityId ?? ""}
          onValueChange={(value) => {
            onCityChange(String(value));
            onZipChange(null);
          }}
        >
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder="Choose a city">
              {(value: string) => {
                const city = cities.find((c) => c.id === value);
                return city
                  ? `${city.name}, ${city.stateAbbreviation}`
                  : "Choose a city";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}, {city.stateAbbreviation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {zipOptions.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Zip code <span className="text-muted-foreground">(optional)</span>
          </label>
          <Select
            value={zipCodeId ?? ""}
            onValueChange={(value) => onZipChange(String(value))}
          >
            <SelectTrigger className="h-12 w-full">
              <SelectValue placeholder="Not sure">
                {(value: string) =>
                  zipOptions.find((z) => z.id === value)?.code ?? "Not sure"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {zipOptions.map((zip) => (
                <SelectItem key={zip.id} value={zip.id}>
                  {zip.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// -- Step 3: Current backyard (photos) -----------------------------------

export function BackyardStep({
  planId,
  photos,
  onPhotosChange,
}: {
  planId: string;
  photos: PlanPhoto[];
  onPhotosChange: (photos: PlanPhoto[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadPlanPhotoAction(planId, formData);
      if (result.ok) {
        onPhotosChange([
          ...photos,
          {
            id: result.data.id,
            url: result.data.url,
            sortOrder: photos.length,
          },
        ]);
      } else {
        toast.error(result.error);
      }
    }
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove(photoId: string) {
    const previous = photos;
    onPhotosChange(photos.filter((p) => p.id !== photoId));
    const result = await deletePlanPhotoAction(planId, photoId);
    if (!result.ok) {
      onPhotosChange(previous);
      toast.error("Unable to remove photo. Please try again.");
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-muted-foreground text-sm">
        Upload a few photos of your backyard. This helps you organize your ideas
        and can make your future project request more useful.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-muted relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={photo.url}
              alt="Your backyard"
              fill
              sizes="200px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(photo.id)}
              aria-label="Remove photo"
              className="bg-background/90 hover:bg-background absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-sm"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        <label className="border-border hover:border-primary/40 text-muted-foreground flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs font-medium transition-colors">
          {isUploading ? (
            <Upload className="size-6 animate-pulse" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
          {isUploading ? "Uploading…" : "Add photo"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>
      </div>
    </div>
  );
}

// -- Step 4: Style ---------------------------------------------------------

export function StyleStep({
  styles,
  selectedIds,
  onChange,
}: {
  styles: Style[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {styles.map((style) => (
        <OptionToggle
          key={style.id}
          label={style.name}
          selected={selectedIds.includes(style.id)}
          onToggle={() => onChange(toggleId(selectedIds, style.id))}
        />
      ))}
    </div>
  );
}

// -- Step 5: Features --------------------------------------------------

export function FeaturesStep({
  features,
  selectedIds,
  onChange,
}: {
  features: Feature[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {features.map((feature) => (
        <OptionToggle
          key={feature.id}
          label={feature.name}
          selected={selectedIds.includes(feature.id)}
          onToggle={() => onChange(toggleId(selectedIds, feature.id))}
        />
      ))}
    </div>
  );
}

// -- Step 6: Budget ------------------------------------------------------

const BUDGET_OPTIONS: BudgetRange[] = [
  "under_10k",
  "10k_25k",
  "25k_50k",
  "50k_100k",
  "100k_250k",
  "over_250k",
];

export function BudgetStep({
  value,
  onChange,
}: {
  value: BudgetRange | null;
  onChange: (value: BudgetRange) => void;
}) {
  return (
    <div className="space-y-2.5">
      {BUDGET_OPTIONS.map((option) => (
        <OptionToggle
          key={option}
          label={formatBudgetRange(option) ?? option}
          selected={value === option}
          onToggle={() => onChange(option)}
        />
      ))}
      <p className="text-muted-foreground text-xs">
        A planning range only -- not a quote.
      </p>
    </div>
  );
}

// -- Step 7: Timeline ------------------------------------------------------

const TIMELINE_OPTIONS: ProjectTimeline[] = [
  "asap",
  "1_3_months",
  "3_6_months",
  "6_12_months",
  "planning_only",
];

export function TimelineStep({
  value,
  onChange,
}: {
  value: ProjectTimeline | null;
  onChange: (value: ProjectTimeline) => void;
}) {
  return (
    <div className="space-y-2.5">
      {TIMELINE_OPTIONS.map((option) => (
        <OptionToggle
          key={option}
          label={formatTimeline(option) ?? option}
          selected={value === option}
          onToggle={() => onChange(option)}
        />
      ))}
    </div>
  );
}

// -- Step 8: Description --------------------------------------------------

export function DescriptionStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        placeholder="Tell us a little more about what you're envisioning -- materials, inspiration, must-haves..."
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-3.5 py-3 text-sm outline-none focus-visible:ring-3"
      />
    </div>
  );
}
