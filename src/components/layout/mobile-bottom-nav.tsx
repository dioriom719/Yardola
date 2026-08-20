"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Home, Compass, Sparkles, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Explore", icon: Compass },
  { href: "/plan", label: "Plan", icon: Sparkles },
] as const;

const PLACEHOLDER_ITEMS = [
  { label: "Saved", icon: Bookmark },
  { label: "Account", icon: User },
] as const;

/**
 * Mobile-only primary navigation. Saved and Account are placeholders
 * until authentication exists -- they surface a toast instead of
 * navigating to a route that doesn't exist yet.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        {PLACEHOLDER_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() =>
              toast("Coming soon", {
                description: `${item.label} will be available once sign-in is live.`,
              })
            }
            className="text-muted-foreground/60 focus-visible:ring-ring flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
