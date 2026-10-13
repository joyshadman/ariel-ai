import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Create account",
};

export default function SignupPage() {
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
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Then connect your own AI provider key.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-zinc-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}