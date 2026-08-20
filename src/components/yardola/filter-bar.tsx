"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBudgetRange } from "@/lib/format";
import type { BudgetRange } from "@/types/enums";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { Style } from "@/lib/data/styles";

const BUDGET_OPTIONS: BudgetRange[] = [
  "under_10k",
  "10k_25k",
  "25k_50k",
  "50k_100k",
  "100k_250k",
  "over_250k",
];

interface FilterBarProps {
  categories: Category[];
  cities: City[];
  styles?: Style[];
  hideCategory?: boolean;
  hideLocation?: boolean;
  hideStyle?: boolean;
  hideBudget?: boolean;
}

const ALL_VALUE = "all";

export function FilterBar({
  categories,
  cities,
  styles,
  hideCategory,
  hideLocation,
  hideStyle,
  hideBudget,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL_VALUE) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {!hideCategory && (
        <Select
          value={searchParams.get("category") ?? ALL_VALUE}
          onValueChange={(value) => setParam("category", String(value))}
        >
          <SelectTrigger aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideLocation && (
        <Select
          value={searchParams.get("location") ?? ALL_VALUE}
          onValueChange={(value) => setParam("location", String(value))}
        >
          <SelectTrigger aria-label="Location">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All locations</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.slug}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideStyle && styles && (
        <Select
          value={searchParams.get("style") ?? ALL_VALUE}
          onValueChange={(value) => setParam("style", String(value))}
        >
          <SelectTrigger aria-label="Style">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All styles</SelectItem>
            {styles.map((style) => (
              <SelectItem key={style.id} value={style.slug}>
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideBudget && (
        <Select
          value={searchParams.get("budget") ?? ALL_VALUE}
          onValueChange={(value) => setParam("budget", String(value))}
        >
          <SelectTrigger aria-label="Budget">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Any budget</SelectItem>
            {BUDGET_OPTIONS.map((value) => (
              <SelectItem key={value} value={value}>
                {formatBudgetRange(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
