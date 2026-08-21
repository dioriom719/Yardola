import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/plan", "/business"];

// Keep the public Supabase configuration as direct module-level environment
// references. Next/Vercel can statically inject NEXT_PUBLIC_* values into the
// Edge Proxy bundle; routing middleware must not depend on a server-side
// runtime env getter that may not be populated in the Edge environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requireSupabaseConfig() {
  if (!supabaseUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Refreshes the Supabase session cookie on every request and redirects
 * unauthenticated visitors away from private homeowner/professional routes.
 * RLS remains the authoritative data-security layer underneath this UX guard.
 */
export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseConfig();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet)
          supabaseResponse.cookies.set(name, value, options);
      },
    },
  });

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
