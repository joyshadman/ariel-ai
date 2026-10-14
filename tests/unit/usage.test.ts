import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FREE_DAILY_LIMIT,
  FREE_USAGE_KIND,
  freeMessagesRemaining,
} from "@/lib/ai/types";

const usageEvent = vi.hoisted(() => ({
  create: vi.fn(),
  count: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: { usageEvent } }));

import {
  claimFreeMessage,
  refundFreeMessage,
  startOfTodayUtc,
} from "@/lib/ai/usage";

describe("freeMessagesRemaining", () => {
  it("returns the full daily limit when nothing has been used", () => {
    expect(freeMessagesRemaining(0)).toBe(FREE_DAILY_LIMIT);
  });

  it("counts down as messages are used", () => {
    expect(freeMessagesRemaining(1)).toBe(FREE_DAILY_LIMIT - 1);
    expect(freeMessagesRemaining(FREE_DAILY_LIMIT - 1)).toBe(1);
  });

  it("clamps at zero once the limit is reached or exceeded", () => {
    expect(freeMessagesRemaining(FREE_DAILY_LIMIT)).toBe(0);
    expect(freeMessagesRemaining(FREE_DAILY_LIMIT + 5)).toBe(0);
  });

  it("treats a negative usage count as zero", () => {
    expect(freeMessagesRemaining(-3)).toBe(FREE_DAILY_LIMIT);
  });
});

describe("startOfTodayUtc", () => {
  it("returns UTC midnight of the given instant", () => {
    const start = startOfTodayUtc(new Date("2026-10-14T18:45:12.000Z"));
    expect(start.toISOString()).toBe("2026-10-14T00:00:00.000Z");
  });
});

describe("claimFreeMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usageEvent.create.mockResolvedValue({ id: "evt-1" });
  });

  it("records a free usage event and reports what is left", async () => {
    usageEvent.count.mockResolvedValue(3);

    const result = await claimFreeMessage("user-1");

    expect(usageEvent.create).toHaveBeenCalledWith({
      data: { userId: "user-1", kind: FREE_USAGE_KIND },
    });
    expect(result).toEqual({
      ok: true,
      eventId: "evt-1",
      remaining: FREE_DAILY_LIMIT - 3,
    });
    expect(usageEvent.delete).not.toHaveBeenCalled();
  });

  it("allows the message that exactly reaches the limit", async () => {
    usageEvent.count.mockResolvedValue(FREE_DAILY_LIMIT);

    const result = await claimFreeMessage("user-1");

    expect(result).toEqual({ ok: true, eventId: "evt-1", remaining: 0 });
  });

  it("rejects and rolls back once the daily limit is exceeded", async () => {
    usageEvent.count.mockResolvedValue(FREE_DAILY_LIMIT + 1);

    const result = await claimFreeMessage("user-1");

    expect(result).toEqual({ ok: false });
    expect(usageEvent.delete).toHaveBeenCalledWith({ where: { id: "evt-1" } });
  });

  it("only counts today's free events for that user", async () => {
    usageEvent.count.mockResolvedValue(1);

    await claimFreeMessage("user-1");

    const where = usageEvent.count.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.kind).toBe(FREE_USAGE_KIND);
    expect(where.createdAt.gte).toBeInstanceOf(Date);
  });
});

describe("refundFreeMessage", () => {
  it("removes the claimed usage event", async () => {
    usageEvent.deleteMany.mockResolvedValue({ count: 1 });

    await refundFreeMessage("evt-9");

    expect(usageEvent.deleteMany).toHaveBeenCalledWith({
      where: { id: "evt-9" },
    });
  });
});
