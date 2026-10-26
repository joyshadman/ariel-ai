"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

async function googleEnabled(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        },
      },
    );
    if (!res.ok) return true;
    const settings = (await res.json()) as { external?: { google?: boolean } };
    return settings.external?.google !== false;
  } catch {
    return true;
  }
}

export function GoogleButton({
  label = "Continue with Google",
  next,
}: {
  label?: string;
  next?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);

    if (!(await googleEnabled())) {
      setError("Google sign-in isn't enabled yet. Use email and password for now.");
      setLoading(false);
      return;
    }

    const callback = new URL("/auth/callback", window.location.origin);
    if (next) {
      callback.searchParams.set("next", next);
    }

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    if (oauthError) {
      setError("Google sign-in is unavailable right now.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="flex min-h-[46px] w-full items-center justify-center gap-3 rounded-[11px] border border-line bg-white text-[14px] font-medium text-ink transition-colors hover:border-coral hover:text-coral-dark disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3Z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
        </svg>
        {loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p role="alert" className="text-[13px] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
