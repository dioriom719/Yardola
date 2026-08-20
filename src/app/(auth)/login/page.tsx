import { buildMetadata } from "@/lib/seo/metadata";
import { LoginForm } from "./login-form";

export const metadata = buildMetadata({
  title: "Sign In | Yardola",
  description: "Sign in to your Yardola account.",
  path: "/login",
  index: false,
});

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next =
    typeof searchParams.next === "string" ? searchParams.next : "/account";
  const error =
    typeof searchParams.error === "string" ? searchParams.error : null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-foreground text-3xl">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Sign in to save inspiration and pick up your project plans.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-center text-sm">
          {error}
        </p>
      )}
      <LoginForm next={next} />
    </div>
  );
}
