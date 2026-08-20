import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";
import { toPaginatedResult, type PaginatedResult } from "@/lib/data/pagination";
import {
  PROJECT_CARD_FIELDS,
  mapProjectCard,
  type ProjectCardRow,
} from "@/lib/data/projects";
import type { SavedProjectEntry } from "@/types";

export const SAVED_PROJECTS_PAGE_SIZE = 24;

export async function listSavedProjects(
  page = 1,
  pageSize = SAVED_PROJECTS_PAGE_SIZE
): Promise<PaginatedResult<SavedProjectEntry>> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("saved_projects")
    .select(`created_at, projects(${PROJECT_CARD_FIELDS})`, {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<{ created_at: string; projects: ProjectCardRow | null }[]>();

  if (error) throw error;

  const entries = (data ?? [])
    .filter((row): row is { created_at: string; projects: ProjectCardRow } =>
      Boolean(row.projects)
    )
    .map((row) => ({
      savedAt: row.created_at,
      project: mapProjectCard(row.projects),
    }));

  return toPaginatedResult(entries, count ?? 0, page, pageSize);
}

export async function countSavedProjects(): Promise<number> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { count, error } = await supabase
    .from("saved_projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function isProjectSaved(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("saved_projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

/** Which of the given project ids the current user has saved, if any. */
export async function listSavedProjectIds(
  projectIds: string[]
): Promise<Set<string>> {
  if (projectIds.length === 0) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("saved_projects")
    .select("project_id")
    .eq("user_id", user.id)
    .in("project_id", projectIds)
    .returns<{ project_id: string }[]>();

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.project_id));
}

/** Idempotent -- saving an already-saved project is a no-op, not an error. */
export async function saveProject(projectId: string): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("saved_projects")
    .insert({ user_id: userId, project_id: projectId });

  // 23505 = unique_violation -- the db-enforced (user_id, project_id)
  // uniqueness is the real duplicate-save guard; this just makes an
  // already-saved project a harmless no-op instead of a thrown error.
  if (error && error.code !== "23505") throw error;
}

export async function unsaveProject(projectId: string): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("saved_projects")
    .delete()
    .eq("user_id", userId)
    .eq("project_id", projectId);

  if (error) throw error;
}
