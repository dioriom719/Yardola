import { NextResponse, type NextRequest } from "next/server";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getStyleBySlug } from "@/lib/data/styles";
import { createDraftPlanFromProject } from "@/lib/data/plans";

/**
 * "Plan a Similar Project" lands here first. This route sits under
 * `/plan`, so proxy.ts already requires auth before this runs -- a
 * signed-out visitor is sent to /login?next=/plan/start?... and returns
 * here to actually create the plan once authenticated.
 *
 * Only ever reads PUBLIC category/style data from the query string --
 * never another homeowner's private plan or project data.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const styleSlug = searchParams.get("style");

  const [category, style] = await Promise.all([
    categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
    styleSlug ? getStyleBySlug(styleSlug) : Promise.resolve(null),
  ]);

  const planId = await createDraftPlanFromProject(
    category?.id ?? null,
    style?.id ?? null
  );

  return NextResponse.redirect(`${origin}/plan?planId=${planId}`);
}
