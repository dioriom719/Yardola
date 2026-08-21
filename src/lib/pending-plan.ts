import type { AnonymousPlanInput } from "@/lib/data/plans";

/**
 * localStorage key for a homepage-builder project that couldn't be saved
 * immediately because the Supabase project requires email confirmation
 * before issuing a session. Written by HomepageBuilder, read by the
 * resume handler on /plan (?resume=1) once the homeowner confirms and
 * returns. localStorage (not sessionStorage) because confirmation links
 * commonly open in a new tab.
 */
export const PENDING_PLAN_STORAGE_KEY = "yardolo:pending-plan";

export type PendingPlanPayload = AnonymousPlanInput;
