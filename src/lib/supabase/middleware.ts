import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

const PROTECTED_PREFIXES = ["/account", "/plan"];

/**
 * Refreshes the Supabase session cookie on every request (so a Server
 * Component never sees a stale/expired session) and redirects
 * unauthenticated visitors away from /account routes before any page
 * code runs. This is a UX/perf convenience -- RLS is what actually
 * secures the data underneath, this only saves a round trip to a page
 * that would otherwise render nothing useful for a signed-out visitor.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.supabase.url, env.supabase.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not add logic between createServerClient and getUser() -- this
  // call is what actually revalidates/refreshes the session token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
