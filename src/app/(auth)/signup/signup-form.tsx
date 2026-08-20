"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction, type AuthActionState } from "@/app/(auth)/actions";

const INITIAL_STATE: AuthActionState = { error: null };

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
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
          We sent a confirmation link. Click it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <Input id="firstName" name="firstName" autoComplete="given-name" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input id="lastName" name="lastName" autoComplete="family-name" />
        </div>
      </div>

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

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-muted-foreground text-xs">At least 8 characters.</p>
      </div>

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create Account"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
