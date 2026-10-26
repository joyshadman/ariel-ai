import { Signup } from "@/components/pages/Signup";
import { safeRedirectPath } from "@/lib/auth/redirect";

export const metadata = {
  title: "Create account",
};

export const instant = false;

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;

  return <Signup next={safeRedirectPath(next)} />;
}
