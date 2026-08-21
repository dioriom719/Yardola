"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { connectOpportunityAction } from "@/app/actions/opportunities";

export function ConnectButton({
  matchId,
  planId,
  businessName,
}: {
  matchId: string;
  planId: string;
  businessName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleConnect() {
    setIsPending(true);
    const result = await connectOpportunityAction(matchId, planId);
    setIsPending(false);
    setOpen(false);
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }
    toast.success(`You're connected with ${businessName}.`, {
      description: `${businessName} can now reach out about your project.`,
    });
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Connect
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with {businessName}?</DialogTitle>
            <DialogDescription>
              Your name, email, and phone number will be shared with{" "}
              {businessName} so they can reach out about your project.
              They&apos;ll be able to see this information only after you
              connect.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Not yet
            </Button>
            <Button onClick={handleConnect} disabled={isPending}>
              {isPending ? "Connecting…" : "Yes, connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
