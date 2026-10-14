"use client";

import { useActionState } from "react";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "@/app/(auth)/actions";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { useNavigation } from "@/components/navigation";

const inputClass =
  "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-coral focus:ring-[3px] focus:ring-coral-soft";

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { navigate } = useNavigation();

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
          {title}
        </h1>
        <p className="mt-2 text-[14px] leading-7 text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const { navigate } = useNavigation();
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    null,
  );

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
    >
      <form action={action} className="mt-7 flex flex-col gap-4" noValidate>
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
            className={inputClass}
          />
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

        <Button kind="primary" type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Sending…" : "Send reset link"}
          <Icon name="arrow" size={16} />
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Remembered it?{" "}
        <button
          type="button"
          onClick={() => navigate("login")}
          className="font-medium text-coral-dark transition-colors hover:text-coral"
        >
          Back to sign in
        </button>
      </p>
    </AuthShell>
  );
}

export function ResetPassword() {
  const [state, action, pending] = useActionState(updatePasswordAction, null);

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something at least 8 characters long."
    >
      <form action={action} className="mt-7 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-[12px] font-medium text-ink">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm" className="text-[12px] font-medium text-ink">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-[13px] text-error">
            {state.error}
          </p>
        ) : null}

        <Button kind="primary" type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Saving…" : "Save password"}
          <Icon name="arrow" size={16} />
        </Button>
      </form>
    </AuthShell>
  );
}
