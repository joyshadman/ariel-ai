import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const getAuthUser = cache(async () => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

async function getOrCreateDbUser(user: User) {
  return prisma.user.upsert({
    where: { email: user.email ?? user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? user.id,
      name:
        typeof user.user_metadata?.full_name === "string"
          ? (user.user_metadata.full_name as string)
          : null,
    },
  });
}

export const getDbUser = cache(async () => {
  const user = await requireAuthUser();
  return getOrCreateDbUser(user);
});

export const getDbUserOrNull = cache(async () => {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }
  return getOrCreateDbUser(user);
});