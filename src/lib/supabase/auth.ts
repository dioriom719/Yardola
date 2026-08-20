import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Resolves the caller's id from the server auth context (never from a
 * caller-supplied value). Every homeowner-scoped mutation/query derives
 * identity this way -- RLS then enforces the same boundary underneath as
 * a second, independent layer.
 */
export async function requireUserId(
  supabase: SupabaseServerClient
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getUserId(
  supabase: SupabaseServerClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
