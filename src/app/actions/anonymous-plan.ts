"use server";

import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo/urls";
import {
  createAndSubmitAnonymousPlan,
  type AnonymousPlanInput,
} from "@/lib/data/plans";
import type { BudgetRange, ProjectTimeline } from "@/types";

export interface StartProjectInput {
  email: string;
  password: string;
  categoryIds: string[];
  cityId: string;
  zipCodeId: string | null;
  budgetRange: BudgetRange | null;
  timeline: ProjectTimeline | null;
  description: string;
}

export type StartProjectResult =
  | { ok: true; status: "ready"; planId: string; matchCount: number }
  | { ok: true; status: "confirm-email" }
  | { ok: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

/**
 * The single write path for the homepage's no-login project builder.
 * Everything before this call lives in client-side React state only --
 * no draft plan, no lead, nothing homeowner-identifying is written to the
 * database until this runs, which is also the first point the homeowner
 * has given us an email. Reuses the exact same `supabase.auth.signUp`
 * call as the standalone /signup form (same email-confirmation behavior,
 * same error handling), then hands off to `createAndSubmitAnonymousPlan`,
 * which itself only calls the existing, already-audited plan/lead
 * functions -- no new database access pattern, no RLS change.
 *
 * Two outcomes depending on whether this Supabase project requires email
 * confirmation before issuing a session (a project setting, not something
 * this app controls): "ready" -- confirmations are off (the local/dev
 * default), a session comes back immediately, so the plan is created and
 * submitted for matching right away. "confirm-email" -- confirmations are
 * on (the typical production default); no session yet, so the plan
 * cannot be created yet (the same RLS that protects every other
 * homeowner's plans applies here too). The client stashes the answers
 * and resumes via `resumePendingPlanAction` once the homeowner confirms
 * and returns.
 */
export async function startProjectAnonymouslyAction(
  input: StartProjectInput
): Promise<StartProjectResult> {
  const email = input.email.trim();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (input.categoryIds.length === 0 || !input.cityId) {
    return { ok: false, error: "Missing project details. Please start over." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: absoluteUrl(
        "/auth/confirm?type=signup&next=/plan?resume=1"
      ),
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        ok: false,
        error:
          "An account with this email already exists. Log in to continue your project.",
      };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  if (!data.session) {
    return { ok: true, status: "confirm-email" };
  }

  try {
    const { planId, matchCount } = await createAndSubmitAnonymousPlan(input);
    return { ok: true, status: "ready", planId, matchCount };
  } catch {
    return {
      ok: false,
      error:
        "Your account was created, but we couldn't save your project. Please log in and try again from your dashboard.",
    };
  }
}

/**
 * Completes a plan that couldn't be created at signup time because email
 * confirmation was required. Called from /plan when it's loaded with
 * ?resume=1 and a matching pending-project payload is found in
 * localStorage -- by then the homeowner has clicked the confirmation
 * link and has a real session, so this is just `createAndSubmitAnonymousPlan`
 * running under that session, identical to the immediate-session path.
 */
export async function resumePendingPlanAction(
  input: AnonymousPlanInput
): Promise<
  | { ok: true; planId: string; matchCount: number }
  | { ok: false; error: string }
> {
  try {
    const { planId, matchCount } = await createAndSubmitAnonymousPlan(input);
    return { ok: true, planId, matchCount };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
