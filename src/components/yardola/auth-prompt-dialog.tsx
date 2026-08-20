"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  next: string;
}

/** Shown when a signed-out visitor tries to save a project. */
export function AuthPromptDialog({
  open,
  onOpenChange,
  next,
}: AuthPromptDialogProps) {
  const encodedNext = encodeURIComponent(next);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this project to your inspiration board</DialogTitle>
          <DialogDescription>
            Create a free Yardola account or sign in to save projects and start
            building your plan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/login?next=${encodedNext}`} />}
          >
            Sign in
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={`/signup?next=${encodedNext}`} />}
          >
            Create account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
