import { buildMetadata } from "@/lib/seo/metadata";
import { SignupForm } from "./signup-form";

export const metadata = buildMetadata({
  title: "Create Account | Yardola",
  description:
    "Create a free Yardola account to save inspiration and plan your project.",
  path: "/signup",
  index: false,
});

export default async function SignupPage(props: PageProps<"/signup">) {
  const searchParams = await props.searchParams;
  const next =
    typeof searchParams.next === "string" ? searchParams.next : "/account";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-foreground text-3xl">
          Save your ideas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Create a free account to save projects and build your plan.
        </p>
      </div>
      <SignupForm next={next} />
    </div>
  );
}
