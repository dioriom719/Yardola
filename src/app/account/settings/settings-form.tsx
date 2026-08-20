"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProfileAction,
  type UpdateProfileState,
} from "@/app/actions/profile";
import type { Profile } from "@/lib/data/profile";

const INITIAL_STATE: UpdateProfileState = { status: "idle" };

export function SettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" value={profile.email ?? ""} disabled />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={profile.firstName ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={profile.lastName ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={profile.phone ?? ""}
        />
      </div>

      {state.status !== "idle" && (
        <p
          role="status"
          className={
            state.status === "success"
              ? "text-sm text-green-700 dark:text-green-500"
              : "text-destructive text-sm"
          }
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
