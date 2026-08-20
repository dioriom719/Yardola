"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo/urls";

export interface AuthActionState {
  error: string | null;
  needsConfirmation?: boolean;
}

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

/** Only ever redirect to a same-site path -- never an attacker-supplied absolute URL. */
function safeNext(value: FormDataEntryValue | null, fallback = "/account") {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect(next);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName || null, last_name: lastName || null },
      emailRedirectTo: absoluteUrl(
        `/auth/confirm?type=signup&next=${encodeURIComponent(next)}`
      ),
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: GENERIC_ERROR };
  }

  // Email confirmations disabled (local/dev default): signUp returns an
  // active session immediately. Enabled (production default): no
  // session yet -- the homeowner must click the confirmation email.
  if (data.session) {
    redirect(next);
  }

  return { error: null, needsConfirmation: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const supabase = await createClient();
  // Errors here are intentionally swallowed into the same success state
  // as a real send -- surfacing "no account with that email" would let
  // a visitor enumerate registered addresses.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: absoluteUrl("/auth/confirm?type=recovery&next=/reset-password"),
  });

  return { error: null, needsConfirmation: true };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your password reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: GENERIC_ERROR };
  }

  redirect("/account");
}
