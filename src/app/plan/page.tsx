import { buildMetadata } from "@/lib/seo/metadata";
import { listCategories } from "@/lib/data/categories";
import { listCities, listZipCodes } from "@/lib/data/locations";
import { listStyles } from "@/lib/data/styles";
import { listFeatures } from "@/lib/data/features";
import { getPlanDetail } from "@/lib/data/plans";
import { PlannerWizard } from "./_components/planner-wizard";

export const metadata = buildMetadata({
  title: "Plan My Project | Yardola",
  description: "Shape your backyard project idea into a plan, step by step.",
  path: "/plan",
  index: false,
});

export default async function PlanPage(props: PageProps<"/plan">) {
  const searchParams = await props.searchParams;
  const planId =
    typeof searchParams.planId === "string" ? searchParams.planId : null;

  const [categories, cities, zipCodes, styles, features, initialPlan] =
    await Promise.all([
      listCategories(),
      listCities(),
      listZipCodes(),
      listStyles(),
      listFeatures(),
      planId ? getPlanDetail(planId) : Promise.resolve(null),
    ]);

  return (
    <PlannerWizard
      categories={categories}
      cities={cities}
      zipCodes={zipCodes}
      styles={styles}
      features={features}
      initialPlan={initialPlan}
    />
  );
}
