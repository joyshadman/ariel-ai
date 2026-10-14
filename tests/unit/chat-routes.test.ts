import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDbUserOrNull: vi.fn(),
  chat: { updateMany: vi.fn(), deleteMany: vi.fn(), findFirst: vi.fn() },
  user: { update: vi.fn() },
  updateUser: vi.fn(),
}));

vi.mock("@/lib/auth/dal", () => ({ getDbUserOrNull: mocks.getDbUserOrNull }));
vi.mock("@/lib/db", () => ({
  prisma: { chat: mocks.chat, user: mocks.user },
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: { updateUser: mocks.updateUser },
  }),
}));

import { DELETE, PATCH } from "@/app/api/chats/[id]/route";
import { PATCH as PATCH_PROFILE } from "@/app/api/profile/route";

const ctx = (id: string) =>
  ({ params: Promise.resolve({ id }) }) as RouteContext<"/api/chats/[id]">;

const jsonRequest = (method: string, body: unknown) =>
  new Request("http://test/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getDbUserOrNull.mockResolvedValue({ id: "user-1" });
});

describe("PATCH /api/chats/[id]", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.getDbUserOrNull.mockResolvedValue(null);
    const res = await PATCH(jsonRequest("PATCH", { title: "x" }), ctx("c1"));
    expect(res.status).toBe(401);
    expect(mocks.chat.updateMany).not.toHaveBeenCalled();
  });

  it("renames a chat owned by the user, trimming the title", async () => {
    mocks.chat.updateMany.mockResolvedValue({ count: 1 });
    const res = await PATCH(
      jsonRequest("PATCH", { title: "  Trip ideas  " }),
      ctx("c1"),
    );
    expect(res.status).toBe(200);
    expect(mocks.chat.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user-1" },
      data: { title: "Trip ideas" },
    });
    expect(await res.json()).toEqual({ chat: { id: "c1", title: "Trip ideas" } });
  });

  it("rejects empty or overly long titles", async () => {
    for (const title of ["   ", "x".repeat(81)]) {
      const res = await PATCH(jsonRequest("PATCH", { title }), ctx("c1"));
      expect(res.status).toBe(400);
    }
    expect(mocks.chat.updateMany).not.toHaveBeenCalled();
  });

  it("returns 404 for chats the user does not own", async () => {
    mocks.chat.updateMany.mockResolvedValue({ count: 0 });
    const res = await PATCH(jsonRequest("PATCH", { title: "x" }), ctx("c9"));
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/chats/[id]", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.getDbUserOrNull.mockResolvedValue(null);
    const res = await DELETE(new Request("http://test"), ctx("c1"));
    expect(res.status).toBe(401);
    expect(mocks.chat.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes only the user's own chat", async () => {
    mocks.chat.deleteMany.mockResolvedValue({ count: 1 });
    const res = await DELETE(new Request("http://test"), ctx("c1"));
    expect(res.status).toBe(200);
    expect(mocks.chat.deleteMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user-1" },
    });
  });

  it("returns 404 when nothing was deleted", async () => {
    mocks.chat.deleteMany.mockResolvedValue({ count: 0 });
    const res = await DELETE(new Request("http://test"), ctx("c9"));
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/profile", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.getDbUserOrNull.mockResolvedValue(null);
    const res = await PATCH_PROFILE(jsonRequest("PATCH", { name: "Ada" }));
    expect(res.status).toBe(401);
  });

  it("updates the display name in the database and auth profile", async () => {
    mocks.user.update.mockResolvedValue({ id: "user-1", name: "Ada" });
    mocks.updateUser.mockResolvedValue({ error: null });
    const res = await PATCH_PROFILE(jsonRequest("PATCH", { name: "  Ada  " }));
    expect(res.status).toBe(200);
    expect(mocks.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Ada" },
    });
    expect(mocks.updateUser).toHaveBeenCalledWith({
      data: { full_name: "Ada" },
    });
    expect(await res.json()).toEqual({ name: "Ada" });
  });

  it("rejects an empty name", async () => {
    const res = await PATCH_PROFILE(jsonRequest("PATCH", { name: " " }));
    expect(res.status).toBe(400);
    expect(mocks.user.update).not.toHaveBeenCalled();
  });
});
