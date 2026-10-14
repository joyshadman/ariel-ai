"use client";

import { useActionState, useState } from "react";
import { signupAction } from "@/app/(auth)/actions";
import { Button } from "@/components/Button";
import { GoogleButton } from "@/components/GoogleButton";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { useNavigation } from "@/components/navigation";

export function Signup() {
  const { navigate } = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(signupAction, null);

  return (
    <div className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 hidden h-full w-1/2 bg-coral-soft min-[900px]:block [clip-path:ellipse(72%_88%_at_16%_50%)]"
      />

      <div className="absolute left-5 top-6 min-[900px]:left-10">
        <Logo markSize={30} onClick={() => navigate("home")} />
      </div>

      <div className="relative w-full max-w-[430px] rounded-[24px] border border-line bg-white p-8 shadow-[0_25px_65px_rgba(63,48,43,.12)] min-[700px]:p-10">
        <h1 className="font-display text-[34px] leading-tight tracking-[-.025em] text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-[14px] leading-7 text-muted">
          Then start chatting with a free model — or bring your own key.
        </p>

        <div className="mt-7">
          <GoogleButton label="Sign up with Google" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-[.16em] text-muted">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form action={action} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[12px] font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-coral focus:ring-[3px] focus:ring-coral-soft"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[12px] font-medium text-ink"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-[10px] border border-line bg-white px-4 py-3 pr-12 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-coral focus:ring-[3px] focus:ring-coral-soft"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              >
                <Icon name="eye" size={16} />
              </button>
            </div>
          </div>

          {state?.error ? (
            <p role="alert" className="text-[13px] text-error">
              {state.error}
            </p>
          ) : null}
          {state?.message ? (
            <p role="status" className="text-[13px] text-green-ink">
              {state.message}
            </p>
          ) : null}

          <Button
            kind="primary"
            type="submit"
            disabled={pending}
            className="mt-2 w-full"
          >
            {pending ? "Creating account…" : "Create account"}
            <Icon name="arrow" size={16} />
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("login")}
            className="font-medium text-coral-dark transition-colors hover:text-coral"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
