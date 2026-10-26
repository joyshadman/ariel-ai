import { Login } from "@/components/pages/Login";
import { safeRedirectPath } from "@/lib/auth/redirect";

export const metadata = {
  title: "Sign in",
};

export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, next } = await searchParams;

  return (
    <Login
      oauthError={error === "oauth"}
      resetError={error === "reset"}
      next={safeRedirectPath(next)}
    />
  );
}
