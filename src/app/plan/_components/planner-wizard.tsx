"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StepShell } from "./step-shell";
import {
  ProjectTypeStep,
  LocationStep,
  BackyardStep,
  StyleStep,
  FeaturesStep,
  BudgetStep,
  TimelineStep,
  DescriptionStep,
} from "./steps";
import { ReviewStep } from "./review-step";
import {
  createDraftPlanAction,
  updatePlanCategoriesAction,
  updatePlanLocationAction,
  updatePlanStylesAction,
  updatePlanFeaturesAction,
  updatePlanBudgetAction,
  updatePlanTimelineAction,
  updatePlanDescriptionAction,
  updatePlanTitleAction,
  removePlanInspirationAction,
} from "@/app/actions/plans";
import { formatBudgetRange, formatTimeline } from "@/lib/format";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ZipCode } from "@/lib/data/locations";
import type { Style } from "@/lib/data/styles";
import type { Feature } from "@/lib/data/features";
import type {
  BudgetRange,
  PlanPhoto,
  ProjectCardData,
  ProjectPlanDetail,
  ProjectTimeline,
} from "@/types";

const TOTAL_STEPS = 9;

const STEP_META: { title: string; description?: string }[] = [
  {
    title: "What are you thinking about building?",
    description:
      "Choose everything that applies -- real backyard projects often combine a few of these.",
  },
  { title: "Where is the project?" },
  {
    title: "What does your backyard look like today?",
    description: "Photos are optional but help you keep your ideas organized.",
  },
  { title: "What style are you drawn to?" },
  { title: "What features are important to you?" },
  { title: "What's your approximate budget?" },
  { title: "When would you like to start?" },
  { title: "Tell us more about the project." },
  { title: "Review your project plan" },
];

interface PlannerWizardProps {
  categories: Category[];
  cities: City[];
  zipCodes: ZipCode[];
  styles: Style[];
  features: Feature[];
  initialPlan: ProjectPlanDetail | null;
}

export function PlannerWizard({
  categories,
  cities,
  zipCodes,
  styles,
  features,
  initialPlan,
}: PlannerWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(() => {
    const fromQuery = Number(searchParams.get("step"));
    if (fromQuery >= 1 && fromQuery <= TOTAL_STEPS) {
      // A plan not yet created can't hold photos -- a deep link straight
      // to step 3 with no plan falls back to the start.
      return fromQuery === 3 && !initialPlan ? 1 : fromQuery;
    }
    // Resuming a plan that already has the required minimum (project
    // type + location) lands on the review screen so they don't have to
    // re-walk every step to see where they left off. A plan that only
    // has inspiration attached (e.g. started from Saved Projects) or is
    // brand new still needs those basics, so it starts at step 1.
    const hasMinimumData = Boolean(
      initialPlan?.categories.length && initialPlan?.city
    );
    return hasMinimumData ? TOTAL_STEPS : 1;
  });
  const [planId, setPlanId] = useState<string | null>(initialPlan?.id ?? null);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialPlan?.categories.map((c) => c.id) ?? []
  );
  const [cityId, setCityId] = useState<string | null>(
    initialPlan?.city?.id ?? null
  );
  const [zipCodeId, setZipCodeId] = useState<string | null>(
    initialPlan?.zipCodeId ?? null
  );
  const [photos, setPhotos] = useState<PlanPhoto[]>(initialPlan?.photos ?? []);
  const [styleIds, setStyleIds] = useState<string[]>(
    initialPlan?.styles.map((s) => s.id) ?? []
  );
  const [featureIds, setFeatureIds] = useState<string[]>(
    initialPlan?.features.map((f) => f.id) ?? []
  );
  const [budgetRange, setBudgetRange] = useState<BudgetRange | null>(
    initialPlan?.budgetRange ?? null
  );
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(
    initialPlan?.timeline ?? null
  );
  const [description, setDescription] = useState(
    initialPlan?.description ?? ""
  );
  const [title, setTitle] = useState(initialPlan?.title ?? "");
  const [inspiration, setInspiration] = useState<ProjectCardData[]>(
    initialPlan?.inspiration ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToStep(next: number, nextPlanId = planId) {
    setStep(next);
    setError(null);
    const params = new URLSearchParams();
    params.set("step", String(next));
    if (nextPlanId) params.set("planId", nextPlanId);
    router.replace(`/plan?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function ensurePlanId(): Promise<string | null> {
    if (planId) return planId;
    const result = await createDraftPlanAction();
    if (result.ok) {
      setPlanId(result.data);
      return result.data;
    }
    toast.error("Unable to start your plan. Please try again.");
    return null;
  }

  async function handleNext() {
    if (step === 1 && categoryIds.length === 0) {
      setError("Choose at least one project type.");
      return;
    }
    if (step === 2 && !cityId) {
      setError("Choose a location.");
      return;
    }
    setError(null);
    setIsSaving(true);

    const id = await ensurePlanId();
    if (!id) {
      setIsSaving(false);
      return;
    }

    let ok = true;
    switch (step) {
      case 1:
        ok = (await updatePlanCategoriesAction(id, categoryIds)).ok;
        break;
      case 2:
        ok = (await updatePlanLocationAction(id, { cityId, zipCodeId })).ok;
        break;
      case 4:
        ok = (await updatePlanStylesAction(id, styleIds)).ok;
        break;
      case 5:
        ok = (await updatePlanFeaturesAction(id, featureIds)).ok;
        break;
      case 6:
        ok = (await updatePlanBudgetAction(id, budgetRange)).ok;
        break;
      case 7:
        ok = (await updatePlanTimelineAction(id, timeline)).ok;
        break;
      case 8:
        ok = (await updatePlanDescriptionAction(id, description)).ok;
        break;
      default:
        ok = true;
    }

    setIsSaving(false);
    if (!ok) {
      toast.error("Unable to save. Please try again.");
      return;
    }
    if (step < TOTAL_STEPS) goToStep(step + 1, id);
  }

  function handleBack() {
    if (step > 1) goToStep(step - 1);
  }

  async function handleSave() {
    if (!planId) return;
    setIsSaving(true);
    const result = await updatePlanTitleAction(planId, title);
    setIsSaving(false);
    if (!result.ok) {
      toast.error("Unable to save. Please try again.");
      return;
    }
    toast.success("Project plan saved.");
    router.push(`/account/plans/${planId}`);
  }

  async function handleRemoveInspiration(projectId: string) {
    if (!planId) return;
    const previous = inspiration;
    setInspiration(inspiration.filter((p) => p.id !== projectId));
    const result = await removePlanInspirationAction(planId, projectId);
    if (!result.ok) {
      setInspiration(previous);
      toast.error("Unable to remove. Please try again.");
    }
  }

  const meta = STEP_META[step - 1];
  const categoryNames = categories
    .filter((c) => categoryIds.includes(c.id))
    .map((c) => c.name);
  const styleNames = styles
    .filter((s) => styleIds.includes(s.id))
    .map((s) => s.name);
  const featureNames = features
    .filter((f) => featureIds.includes(f.id))
    .map((f) => f.name);
  const city = cities.find((c) => c.id === cityId) ?? null;
  const cityLabel = city ? `${city.name}, ${city.stateAbbreviation}` : null;

  return (
    <StepShell
      step={step}
      totalSteps={TOTAL_STEPS}
      title={meta.title}
      description={meta.description}
      onBack={step > 1 ? handleBack : undefined}
      onNext={step === TOTAL_STEPS ? handleSave : handleNext}
      nextLabel={step === TOTAL_STEPS ? "Save My Project Plan" : "Next"}
      isSaving={isSaving}
      error={error}
    >
      {step === 1 && (
        <ProjectTypeStep
          categories={categories}
          selectedIds={categoryIds}
          onChange={setCategoryIds}
        />
      )}
      {step === 2 && (
        <LocationStep
          cities={cities}
          zipCodes={zipCodes}
          cityId={cityId}
          zipCodeId={zipCodeId}
          onCityChange={setCityId}
          onZipChange={setZipCodeId}
        />
      )}
      {step === 3 &&
        (planId ? (
          <BackyardStep
            planId={planId}
            photos={photos}
            onPhotosChange={setPhotos}
          />
        ) : (
          <p className="text-muted-foreground text-sm">Starting your plan…</p>
        ))}
      {step === 4 && (
        <StyleStep
          styles={styles}
          selectedIds={styleIds}
          onChange={setStyleIds}
        />
      )}
      {step === 5 && (
        <FeaturesStep
          features={features}
          selectedIds={featureIds}
          onChange={setFeatureIds}
        />
      )}
      {step === 6 && (
        <BudgetStep value={budgetRange} onChange={setBudgetRange} />
      )}
      {step === 7 && <TimelineStep value={timeline} onChange={setTimeline} />}
      {step === 8 && (
        <DescriptionStep value={description} onChange={setDescription} />
      )}
      {step === 9 && (
        <ReviewStep
          title={title}
          onTitleChange={setTitle}
          categoryNames={categoryNames}
          cityLabel={cityLabel}
          styleNames={styleNames}
          featureNames={featureNames}
          budgetLabel={formatBudgetRange(budgetRange)}
          timelineLabel={formatTimeline(timeline)}
          description={description}
          photoCount={photos.length}
          inspiration={inspiration}
          onRemoveInspiration={handleRemoveInspiration}
          onEditStep={goToStep}
        />
      )}
    </StepShell>
  );
}
