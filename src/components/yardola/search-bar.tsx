"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
}

/**
 * Free-text search box that drives server-side data fetching via the `q`
 * URL param -- no client-side data loading here.
 */
export function SearchBar({
  placeholder = "Search projects, pros, cities...",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        key={searchParams.get("q") ?? ""}
        type="search"
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder={placeholder}
        aria-label="Search"
        className="pl-9"
      />
    </form>
  );
}
