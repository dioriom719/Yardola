import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` -- see
// node_modules/next/dist/docs/.../file-conventions/proxy.md.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // /api is excluded: today it's only the unauthenticated Stripe webhook
    // (raw-body signature verification, no Supabase session involved), so
    // running the cookie-refresh/redirect logic against it is pure waste
    // on the hot path of a payment webhook. Revisit if a future /api route
    // needs session-aware middleware treatment.
    "/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|sitemap|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
