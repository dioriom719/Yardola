"use client";

import { usePathname } from "next/navigation";

// The planner is a focused, full-screen wizard with its own sticky
// bottom action bar -- the sitewide footer and bottom nav would either
// crowd underneath it or (on short steps) show through above it, both
// of which break the "guided conversation" feel. Hidden here rather
// than skipping the root layout, since Footer/MobileBottomNav are
// rendered once for every route from RootLayout.
const CHROME_HIDDEN_PREFIXES = ["/plan"];

export function ChromeVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (CHROME_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }
  return <>{children}</>;
}
