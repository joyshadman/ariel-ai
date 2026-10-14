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

function metadataString(user: User, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = user.user_metadata?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function avatarUrlOf(user: User): string | null {
  return metadataString(user, "avatar_url", "picture");
}

async function getOrCreateDbUser(user: User) {
  const name = metadataString(user, "full_name", "name");
  const dbUser = await prisma.user.upsert({
    where: { email: user.email ?? user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? user.id,
      name,
    },
  });

  if (!dbUser.name && name) {
    return prisma.user.update({ where: { id: dbUser.id }, data: { name } });
  }
  return dbUser;
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