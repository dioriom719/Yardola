import { buildMetadata } from "@/lib/seo/metadata";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = buildMetadata({
  title: "Reset Password | Yardola",
  description: "Request a password reset link for your Yardola account.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-foreground text-3xl">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
