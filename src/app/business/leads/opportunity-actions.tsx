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
      <div>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            handle(
              expressInterestAction,
              "You're interested. The homeowner will be able to connect with you."
            )
          }
        >
          I&apos;m interested
        </Button>
        <p className="text-muted-foreground mt-2 text-xs">
          The homeowner decides whether to connect. Your contact info isn&apos;t
          shared until they do.
        </p>
      </div>
    );
  }

  if (status === "interested") {
    return (
      <p className="text-muted-foreground text-sm">
        You&apos;re interested. Waiting for the homeowner to connect with you.
      </p>
    );
  }

  if (status === "connected") {
    return (
      <div>
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              handle(markOpportunityWonAction, "Nice work -- marked as won.")
            }
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
        <p className="text-muted-foreground mt-2 text-xs">
          Let us know how it goes once you&apos;ve spoken with the homeowner.
        </p>
      </div>
    );
  }

  if (status === "won") {
    return (
      <p className="text-muted-foreground text-sm">You won this project.</p>
    );
  }

  if (status === "lost") {
    return (
      <p className="text-muted-foreground text-sm">
        Marked as lost. Keep an eye out for new opportunities.
      </p>
    );
  }

  return null;
}
