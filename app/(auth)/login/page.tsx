import { Login } from "@/components/pages/Login";

export const metadata = {
  title: "Sign in",
};

export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <Login oauthError={error === "oauth"} resetError={error === "reset"} />
  );
}
