"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "@/app/(auth)/actions";

const INITIAL_STATE: AuthActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    INITIAL_STATE
  );

  if (state.needsConfirmation) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="text-primary size-8" aria-hidden="true" />
        <h2 className="font-display text-foreground text-xl">
          Check your email
        </h2>
        <p className="text-muted-foreground text-sm">
          If an account exists for that email, we sent a link to reset your
          password.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send Reset Link"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
