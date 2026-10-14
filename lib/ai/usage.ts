import "server-only";
import { prisma } from "@/lib/db";
import {
  FREE_DAILY_LIMIT,
  FREE_USAGE_KIND,
  freeMessagesRemaining,
} from "./types";

export type FreeClaim =
  | { ok: true; eventId: string; remaining: number }
  | { ok: false };

export function startOfTodayUtc(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function countFreeUsageToday(userId: string): Promise<number> {
  return prisma.usageEvent.count({
    where: {
      userId,
      kind: FREE_USAGE_KIND,
      createdAt: { gte: startOfTodayUtc() },
    },
  });
}

export async function claimFreeMessage(userId: string): Promise<FreeClaim> {
  const event = await prisma.usageEvent.create({
    data: { userId, kind: FREE_USAGE_KIND },
  });
  const used = await countFreeUsageToday(userId);

  if (used > FREE_DAILY_LIMIT) {
    await prisma.usageEvent.delete({ where: { id: event.id } });
    return { ok: false };
  }

  return { ok: true, eventId: event.id, remaining: freeMessagesRemaining(used) };
}

export function refundFreeMessage(eventId: string) {
  return prisma.usageEvent.deleteMany({ where: { id: eventId } });
}
