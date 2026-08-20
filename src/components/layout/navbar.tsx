import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { YardoloLogo } from "@/components/yardola/logo";
import { createClient } from "@/lib/supabase/server";

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
export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="YARDOLO -- Home"
          className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <YardoloLogo showTagline={false} className="h-8" />
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

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <AccountMenu />
          ) : (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
          )}
          <Button nativeButton={false} render={<Link href="/plan" />}>
            Plan My Project
          </Button>
        </div>
      </div>
    </header>
  );
}
