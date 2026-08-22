"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BuilderShell } from "./builder-shell";
import { ProjectTypeTiles } from "./project-type-tiles";
import {
  LocationStep,
  BudgetStep,
  TimelineStep,
  DescriptionStep,
} from "@/app/plan/_components/steps";
import { IdentityStep } from "./identity-step";
import { startProjectAnonymouslyAction } from "@/app/actions/anonymous-plan";
import { PENDING_PLAN_STORAGE_KEY } from "@/lib/pending-plan";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ZipCode } from "@/lib/data/locations";
import type { BudgetRange, ProjectTimeline } from "@/types";

const TOTAL_STEPS = 6;

const STEP_META: { title: string; description?: string }[] = [
  { title: "What are you creating?" },
  { title: "Where are you building?" },
  { title: "What's your budget?" },
  { title: "When are you starting?" },
  {
    title: "What's your vision?",
    description: "Optional -- materials, inspiration, must-haves.",
  },
  { title: "Save your project & see your matches" },
];

interface HomepageBuilderProps {
  categories: Category[];
  cities: City[];
  zipCodes: ZipCode[];
}

type Status = "idle" | "confirm-email" | "ready";

/**
 * The no-login project builder embedded on the homepage. Every answer
 * lives in local component state only -- nothing is written to the
 * database until the final step, when an email + password is collected
 * and `startProjectAnonymouslyAction` creates the account and, in the
 * same call, the plan and its lead/matches. See that action for the two
 * possible outcomes (immediate vs. email-confirmation-required).
 */
export function HomepageBuilder({
  categories,
  cities,
  zipCodes,
}: HomepageBuilderProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [cityId, setCityId] = useState<string | null>(null);
  const [zipCodeId, setZipCodeId] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState<BudgetRange | null>(null);
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [planId, setPlanId] = useState<string | null>(null);

  function goToStep(next: number) {
    setStep(next);
    setError(null);
  }

  function handleNext() {
    if (step === 1 && categoryIds.length === 0) {
      setError("Choose at least one project type.");
      return;
    }
    if (step === 2 && !cityId) {
      setError("Choose a location.");
      return;
    }
    goToStep(step + 1);
  }

  function handleBack() {
    if (step > 1) goToStep(step - 1);
  }

  async function handleSubmit() {
    if (!cityId) {
      setError("Choose a location.");
      return;
    }
    setError(null);
    setIsSaving(true);

    const result = await startProjectAnonymouslyAction({
      email,
      password,
      categoryIds,
      cityId,
      zipCodeId,
      budgetRange,
      timeline,
      description,
    });

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.status === "confirm-email") {
      try {
        localStorage.setItem(
          PENDING_PLAN_STORAGE_KEY,
          JSON.stringify({
            categoryIds,
            cityId,
            zipCodeId,
            budgetRange,
            timeline,
            description,
          })
        );
      } catch {
        // localStorage can be unavailable (private browsing, storage
        // full) -- the homeowner can still finish their plan manually
        // from /plan after confirming, so this is a soft failure.
      }
      setStatus("confirm-email");
      return;
    }

    toast.success("Your project is saved.");
    setPlanId(result.planId);
    setStatus("ready");
    router.prefetch(`/account/plans/${result.planId}`);
  }

  if (status === "confirm-email") {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center p-6 text-center sm:p-10">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
          <Mail className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-display text-foreground mt-5 text-2xl">
          Check your email
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          We sent a confirmation link to <strong>{email}</strong>. Once you
          confirm, we&apos;ll save your project and find your matches.
        </p>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center p-6 text-center sm:p-10">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-display text-foreground mt-5 text-2xl">
          Your project is saved
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          We&apos;re finding professionals who fit. View your project to see
          your matches as they come in.
        </p>
        <Button
          className="mt-6 h-12 px-6"
          nativeButton={false}
          render={
            <Link
              href={planId ? `/account/plans/${planId}` : "/account/plans"}
            />
          }
        >
          See My Matches
        </Button>
      </div>
    );
  }

  const meta = STEP_META[step - 1];

  return (
    <BuilderShell
      step={step}
      totalSteps={TOTAL_STEPS}
      title={meta.title}
      description={meta.description}
      onBack={step > 1 ? handleBack : undefined}
      onNext={step === TOTAL_STEPS ? handleSubmit : handleNext}
      nextLabel={step === TOTAL_STEPS ? "Save My Project" : "Next"}
      isSaving={isSaving}
      error={error}
    >
      {step === 1 && (
        <ProjectTypeTiles
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
      {step === 3 && (
        <BudgetStep value={budgetRange} onChange={setBudgetRange} />
      )}
      {step === 4 && <TimelineStep value={timeline} onChange={setTimeline} />}
      {step === 5 && (
        <DescriptionStep value={description} onChange={setDescription} />
      )}
      {step === 6 && (
        <IdentityStep
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      )}
    </BuilderShell>
  );
}
