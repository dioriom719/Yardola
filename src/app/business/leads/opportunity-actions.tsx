"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  expressInterestAction,
  markOpportunityWonAction,
  markOpportunityLostAction,
} from "@/app/actions/opportunities";
import type { OpportunityStatus } from "@/lib/data/business-leads";

export function OpportunityActions({
  matchId,
  status,
}: {
  matchId: string;
  status: OpportunityStatus;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handle(
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
    successMessage: string
  ) {
    setIsPending(true);
    const result = await action(matchId);
    setIsPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }
    toast.success(successMessage);
    router.refresh();
  }

  if (status === "pending" || status === "sent" || status === "viewed") {
    return (
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          handle(expressInterestAction, "You're pursuing this opportunity.")
        }
      >
        I&apos;m interested
      </Button>
    );
  }

  if (status === "connected") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => handle(markOpportunityWonAction, "Marked as won.")}
        >
          Mark won
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handle(markOpportunityLostAction, "Marked as lost.")}
        >
          Mark lost
        </Button>
      </div>
    );
  }

  return null;
}
