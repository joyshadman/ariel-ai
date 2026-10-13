import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4 text-zinc-50">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight hover:text-zinc-300"
        >
          Ariel AI
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to continue.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          No account?{" "}
          <Link href="/signup" className="underline hover:text-zinc-200">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}