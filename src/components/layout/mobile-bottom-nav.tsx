"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Sparkles, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Explore", icon: Compass },
  { href: "/plan", label: "Plan", icon: Sparkles },
  { href: "/account/saved", label: "Saved", icon: Bookmark },
  { href: "/account", label: "Account", icon: User },
] as const;

/**
 * Mobile-only primary navigation. /account/** is a protected prefix --
 * proxy.ts redirects a signed-out visitor to /login?next=... before any
 * page code runs, so these links don't need their own auth check.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  // Pick the single longest-prefix match (e.g. "/account/saved" wins
  // over "/account" for that path) so two tabs never light up at once.
  const activeHref = [...NAV_ITEMS]
    .filter((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      aria-label="Primary"
      className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === activeHref;
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
      </div>
    </nav>
  );
}
