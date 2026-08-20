import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase client authenticated as the service role -- bypasses RLS
 * entirely. Only for trusted, server-only billing writes that have no
 * end-user session to authenticate as (the Stripe webhook handler) or
 * that need to write columns no RLS policy grants an owner (the checkout
 * / customer-portal server actions, after they've independently verified
 * the caller owns the business via the normal RLS-respecting client).
 *
 * Never import this from a Client Component or expose it to the browser.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
