"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type SessionUser = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

function pick(user: User, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = user.user_metadata?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function toSessionUser(user: User): SessionUser {
  return {
    email: user.email ?? "",
    name: pick(user, "full_name", "name"),
    avatarUrl: pick(user, "avatar_url", "picture"),
  };
}

export function useSessionUser() {
  const [state, setState] = useState<{
    ready: boolean;
    user: SessionUser | null;
  }>({ ready: false, user: null });

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        ready: true,
        user: session?.user ? toSessionUser(session.user) : null,
      });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}
