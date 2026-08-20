import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { ProjectCard } from "@/components/yardola/project-card";
import { PlanActionsMenu } from "@/app/account/plans/plan-actions-menu";
import {
  RemovePhotoButton,
  RemoveInspirationButton,
} from "./plan-detail-actions";
import {
  formatBudgetRange,
  formatDate,
  formatPlanTitle,
  formatTimeline,
} from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPlanDetail } from "@/lib/data/plans";

export const metadata = buildMetadata({
  title: "Project Plan | Yardola",
  description: "View and manage your backyard project plan.",
  path: "/account/plans",
  index: false,
});

export default async function PlanDetailPage(
  props: PageProps<"/account/plans/[plan-id]">
) {
  const params = await props.params;
  const plan = await getPlanDetail(params["plan-id"]);
  if (!plan) notFound();

  const categoryNames = plan.categories.map((c) => c.name);
  const displayTitle = formatPlanTitle(plan.title, categoryNames);

  const details: { label: string; value: string }[] = [
    { label: "Project", value: categoryNames.join(" + ") || "Not set" },
    {
      label: "Location",
      value: plan.city
        ? `${plan.city.name}, ${plan.city.stateAbbreviation}${plan.zipCode ? ` ${plan.zipCode}` : ""}`
        : "Not set",
    },
    {
      label: "Style",
      value: plan.styles.map((s) => s.name).join(", ") || "Not specified",
    },
    {
      label: "Budget",
      value: formatBudgetRange(plan.budgetRange) ?? "Not specified",
    },
    {
      label: "Timeline",
      value: formatTimeline(plan.timeline) ?? "Not specified",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Yardola", href: "/account" },
          { label: "My Plans", href: "/account/plans" },
          { label: displayTitle },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          {plan.status === "closed" && (
            <Badge variant="secondary" className="mb-2">
              Archived
            </Badge>
          )}
          <h1 className="font-display text-foreground text-3xl sm:text-4xl">
            {displayTitle}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Last updated {formatDate(plan.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/plan?planId=${plan.id}&step=9`} />}
          >
            Edit Plan
          </Button>
          <PlanActionsMenu
            planId={plan.id}
            isArchived={plan.status === "closed"}
            redirectAfterDelete="/account/plans"
          />
        </div>
      </div>

      <dl className="divide-border border-border mt-8 divide-y rounded-lg border px-5">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex justify-between gap-4 py-3.5 text-sm"
          >
            <dt className="text-muted-foreground">{detail.label}</dt>
            <dd className="text-foreground text-right font-medium">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      {plan.description && (
        <section className="mt-8">
          <h2 className="font-display text-foreground text-lg">Description</h2>
          <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
            {plan.description}
          </p>
        </section>
      )}

      {plan.photos.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-foreground text-lg">
            Your backyard today
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {plan.photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-muted relative aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={photo.url}
                  alt="Your backyard"
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <RemovePhotoButton planId={plan.id} photoId={photo.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.inspiration.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-foreground text-lg">
            Inspiration ({plan.inspiration.length})
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {plan.inspiration.map((project) => (
              <div key={project.id} className="relative">
                <ProjectCard project={project} initialSaved />
                <RemoveInspirationButton
                  planId={plan.id}
                  projectId={project.id}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="border-border bg-secondary/40 mt-10 rounded-lg border p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Ready to find a professional for this project? That&apos;s coming in a
          future update -- for now, your plan is saved and ready whenever you
          are.
        </p>
      </div>
    </div>
  );
}
