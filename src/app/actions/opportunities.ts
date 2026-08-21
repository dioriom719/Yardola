"use server";

import { revalidatePath } from "next/cache";
import {
  expressInterestInOpportunity,
  markOpportunityWon,
  markOpportunityLost,
} from "@/lib/data/business-leads";
import { connectWithOpportunity } from "@/lib/data/leads";

export type OpportunityActionResult =
  { ok: true } | { ok: false; error: string };

async function run(fn: () => Promise<void>): Promise<OpportunityActionResult> {
  try {
    await fn();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}

/** Business-side: pursue a matched opportunity. */
export async function expressInterestAction(
  matchId: string
): Promise<OpportunityActionResult> {
  const result = await run(() => expressInterestInOpportunity(matchId));
  revalidatePath("/business/leads");
  return result;
}

/** Business-side: report a won outcome on a connected opportunity. */
export async function markOpportunityWonAction(
  matchId: string
): Promise<OpportunityActionResult> {
  const result = await run(() => markOpportunityWon(matchId));
  revalidatePath("/business/leads");
  return result;
}

/** Business-side: report a lost outcome on a connected opportunity. */
export async function markOpportunityLostAction(
  matchId: string
): Promise<OpportunityActionResult> {
  const result = await run(() => markOpportunityLost(matchId));
  revalidatePath("/business/leads");
  return result;
}

/** Homeowner-side: facilitate a connection with an interested business. */
export async function connectOpportunityAction(
  matchId: string,
  planId: string
): Promise<OpportunityActionResult> {
  const result = await run(() => connectWithOpportunity(matchId));
  revalidatePath(`/account/plans/${planId}`);
  return result;
}
