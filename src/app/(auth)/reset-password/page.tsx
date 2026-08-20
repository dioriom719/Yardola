import { buildMetadata } from "@/lib/seo/metadata";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = buildMetadata({
  title: "Set New Password | YARDOLO",
  description: "Set a new password for your YARDOLO account.",
  path: "/reset-password",
  index: false,
});

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-foreground text-3xl">
          Set a new password
        </h1>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
