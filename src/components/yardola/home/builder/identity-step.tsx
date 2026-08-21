"use client";

import { Mail, Lock } from "lucide-react";

interface IdentityStepProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

/**
 * The one and only point in the anonymous flow that asks for identity --
 * framed as unlocking the result ("save your project and see your
 * matches"), never as "create an account." A password is still required
 * (this reuses the existing email+password signUp -- see
 * src/app/actions/anonymous-plan.ts for why a passwordless flow wasn't
 * introduced instead), but it's the last field, after the homeowner has
 * already invested in describing their project.
 */
export function IdentityStep({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: IdentityStepProps) {
  return (
    <div className="space-y-5">
      <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">
          Your project is ready.
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Save it to see the professionals who may be a great fit for your
          project.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="builder-email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="builder-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-lg border bg-transparent pr-3.5 pl-10 text-sm outline-none focus-visible:ring-3"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="builder-password" className="text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <Lock
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="builder-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="At least 8 characters"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-lg border bg-transparent pr-3.5 pl-10 text-sm outline-none focus-visible:ring-3"
          />
        </div>
        <p className="text-muted-foreground text-xs">
          This saves your project to a free YARDOLO account so you can track
          your matches.
        </p>
      </div>
    </div>
  );
}
