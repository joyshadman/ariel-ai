import { connection } from "next/server";
import { avatarUrlOf, getDbUser, requireAuthUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { countFreeUsageToday } from "@/lib/ai/usage";
import type { ProviderId } from "@/lib/ai/types";
import { Settings, type KeySummary } from "@/components/pages/Settings";

export const metadata = {
  title: "Settings",
};

export const instant = false;

export default async function SettingsPage() {
  await connection();
  const [authUser, dbUser] = await Promise.all([requireAuthUser(), getDbUser()]);

  const [keys, freeUsedToday] = await Promise.all([
    prisma.apiKey.findMany({
      where: { userId: dbUser.id },
      select: { provider: true, label: true, lastFour: true },
      orderBy: { createdAt: "asc" },
    }),
    countFreeUsageToday(dbUser.id),
  ]);

  const initialKeys: KeySummary[] = keys.map((key) => ({
    provider: key.provider.toLowerCase() as ProviderId,
    label: key.label,
    lastFour: key.lastFour,
  }));

  return (
    <Settings
      user={{
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: avatarUrlOf(authUser),
      }}
      initialKeys={initialKeys}
      freeUsedToday={freeUsedToday}
    />
  );
}
