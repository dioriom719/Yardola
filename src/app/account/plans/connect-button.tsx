"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { connectOpportunityAction } from "@/app/actions/opportunities";

export function ConnectButton({
  matchId,
  planId,
}: {
  matchId: string;
  planId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleConnect() {
    setIsPending(true);
    const result = await connectOpportunityAction(matchId, planId);
    setIsPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }
    toast.success(
      "You're connected. This professional now has your contact info."
    );
    router.refresh();
  }

  return (
    <Button size="sm" onClick={handleConnect} disabled={isPending}>
      {isPending ? "Connecting…" : "Connect"}
    </Button>
  );
}
