"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/saved", label: "Saved Projects" },
  { href: "/account/plans", label: "My Plans" },
  { href: "/account/settings", label: "Settings" },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="border-border -mx-4 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0"
    >
      <div className="mx-auto flex max-w-7xl gap-6 sm:px-6 lg:px-8">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring -mb-px shrink-0 border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none",
                isActive
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
