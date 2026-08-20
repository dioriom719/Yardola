import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";

export interface Profile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

const PROFILE_SELECT = "id, email, first_name, last_name, phone";

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle()
    .returns<ProfileRow>();

  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function updateCurrentProfile(input: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName.trim() || null,
      last_name: input.lastName.trim() || null,
      phone: input.phone.trim() || null,
    })
    .eq("id", userId);

  if (error) throw error;
}
