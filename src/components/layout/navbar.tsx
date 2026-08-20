import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/professionals", label: "Professionals" },
  { href: "/guides", label: "Guides" },
] as const;

/**
 * Desktop primary navigation. On mobile, primary navigation is handled
 * by MobileBottomNav instead -- this header collapses to just the
 * wordmark there.
 */
export function Navbar() {
  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-primary focus-visible:ring-ring text-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Yardola
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:text-foreground focus-visible:ring-ring text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button nativeButton={false} render={<Link href="/plan" />}>
            Plan My Project
          </Button>
        </div>
      </div>
    </header>
  );
}
