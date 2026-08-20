"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  archivePlanAction,
  restorePlanAction,
  deletePlanAction,
} from "@/app/actions/plans";

interface PlanActionsMenuProps {
  planId: string;
  isArchived: boolean;
  /** Where to send the browser after a destructive action removes this plan from view. */
  redirectAfterDelete?: string;
}

export function PlanActionsMenu({
  planId,
  isArchived,
  redirectAfterDelete,
}: PlanActionsMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleArchiveToggle() {
    startTransition(async () => {
      const result = isArchived
        ? await restorePlanAction(planId)
        : await archivePlanAction(planId);
      if (result.ok) {
        toast.success(isArchived ? "Plan restored." : "Plan archived.");
        router.refresh();
      } else {
        toast.error("Unable to update the plan. Please try again.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePlanAction(planId);
      setConfirmDelete(false);
      if (result.ok) {
        toast.success("Plan deleted.");
        if (redirectAfterDelete) router.push(redirectAfterDelete);
        else router.refresh();
      } else {
        toast.error("Unable to delete the plan. Please try again.");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Plan actions" />
          }
        >
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleArchiveToggle} disabled={isPending}>
            {isArchived ? <ArchiveRestore /> : <Archive />}
            {isArchived ? "Restore plan" : "Archive plan"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
          >
            <Trash2 />
            Delete plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this project plan?</DialogTitle>
            <DialogDescription>
              This permanently removes the plan, its photos, and its inspiration
              list. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
