import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  }),
}));

import { DEFAULT_AUTH_REDIRECT, safeRedirectPath } from "@/lib/auth/redirect";
import { GET } from "@/app/auth/callback/route";

describe("safeRedirectPath", () => {
  it("keeps same-origin relative paths with query and hash", () => {
    expect(safeRedirectPath("/chat")).toBe("/chat");
    expect(safeRedirectPath("/chat?c=abc#end")).toBe("/chat?c=abc#end");
    expect(safeRedirectPath("/reset-password")).toBe("/reset-password");
  });

  it.each([
    null,
    undefined,
    "",
    "chat",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "https://evil.com",
    "http://localhost:3000/chat",
    "javascript:alert(1)",
  ])("falls back for unsafe value %j", (value) => {
    expect(safeRedirectPath(value)).toBe(DEFAULT_AUTH_REDIRECT);
  });

  it("does not bounce back into guest pages", () => {
    expect(safeRedirectPath("/login")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(safeRedirectPath("/signup?next=/chat")).toBe(DEFAULT_AUTH_REDIRECT);
  });

  it("uses a custom fallback", () => {
    expect(safeRedirectPath("//evil.com", "/settings")).toBe("/settings");
  });
});

describe("GET /auth/callback", () => {
  beforeEach(() => {
    mocks.exchangeCodeForSession.mockReset();
  });

  it("redirects to the preserved destination on the request origin", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(
      new Request(
        "https://ariel-ai-chi.vercel.app/auth/callback?code=abc&next=%2Fsettings",
      ),
    );
    expect(res.headers.get("location")).toBe(
      "https://ariel-ai-chi.vercel.app/settings",
    );
  });

  it("stays on localhost in development", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc"),
    );
    expect(res.headers.get("location")).toBe("http://localhost:3000/chat");
  });

  it("ignores off-site next values", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(
      new Request(
        "https://ariel-ai-chi.vercel.app/auth/callback?code=abc&next=%2F%2Fevil.com",
      ),
    );
    expect(res.headers.get("location")).toBe(
      "https://ariel-ai-chi.vercel.app/chat",
    );
  });

  it("sends failures back to login on the same origin", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: new Error("x") });
    const res = await GET(
      new Request("https://ariel-ai-chi.vercel.app/auth/callback?code=bad"),
    );
    expect(res.headers.get("location")).toBe(
      "https://ariel-ai-chi.vercel.app/login?error=oauth",
    );
  });
});
