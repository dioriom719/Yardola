"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updatePasswordAction,
  type AuthActionState,
} from "@/app/(auth)/actions";

const INITIAL_STATE: AuthActionState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error && (
        <div role="alert" className="text-destructive space-y-1 text-sm">
          <p>{state.error}</p>
          {state.error.includes("expired") && (
            <Link href="/forgot-password" className="font-medium underline">
              Request a new link
            </Link>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save New Password"}
      </Button>
    </form>
  );
}
