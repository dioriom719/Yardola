import { createClient } from "@/lib/supabase/server";

export interface Style {
  id: string;
  name: string;
  slug: string;
}

const STYLE_SELECT = "id, name, slug";

export async function listStyles(): Promise<Style[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("styles")
    .select(STYLE_SELECT)
    .order("sort_order", { ascending: true })
    .returns<Style[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getStyleBySlug(slug: string): Promise<Style | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("styles")
    .select(STYLE_SELECT)
    .eq("slug", slug)
    .maybeSingle()
    .returns<Style>();

  if (error) throw error;
  return data;
}
