import { notFound } from "next/navigation";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCurrentProfile } from "@/lib/data/profile";
import { SettingsForm } from "./settings-form";

export const metadata = buildMetadata({
  title: "Account Settings | YARDOLO",
  description: "Manage your YARDOLO account details.",
  path: "/account/settings",
  index: false,
});

export default async function AccountSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My YARDOLO", href: "/account" },
          { label: "Settings" },
        ]}
      />

      <h1 className="font-display text-foreground mt-4 text-3xl">
        Account Settings
      </h1>

      <div className="mt-8">
        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
