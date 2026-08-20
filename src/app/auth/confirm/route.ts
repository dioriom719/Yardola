import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for every Supabase auth email link (signup confirmation,
 * password recovery). Exchanges the token for a session, then redirects
 * on to `next` -- or to /login with an error otherwise. Keep this route
 * itself out of the sitemap/robots (see DISALLOWED_ROBOTS_PATHS).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account";
  const redirectTo =
    next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set(
    "error",
    "That link is invalid or has expired. Please try again."
  );
  return NextResponse.redirect(errorUrl);
}
