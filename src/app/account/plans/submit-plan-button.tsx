"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitPlanAction } from "@/app/actions/plans";

export function SubmitPlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await submitPlanAction(planId);
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      result.data.matchCount > 0
        ? `We found ${result.data.matchCount} professionals for your project.`
        : "Your project is submitted. We'll keep looking for a match."
    );
    router.refresh();
  }

  return (
    <Button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? "Finding professionals…" : "Find Professionals"}
    </Button>
  );
}
