import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Supabase client for use in Client Components. Foundation utility only
 * -- no database schema or auth flows are wired up yet.
 */
export function createClient() {
  return createBrowserClient(env.supabase.url, env.supabase.anonKey);
}
