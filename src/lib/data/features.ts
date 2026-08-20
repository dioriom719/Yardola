import { createClient } from "@/lib/supabase/server";

export interface Feature {
  id: string;
  name: string;
  slug: string;
}

const FEATURE_SELECT = "id, name, slug";

export async function listFeatures(): Promise<Feature[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("features")
    .select(FEATURE_SELECT)
    .order("sort_order", { ascending: true })
    .returns<Feature[]>();

  if (error) throw error;
  return data ?? [];
}
