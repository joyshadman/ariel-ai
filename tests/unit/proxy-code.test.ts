import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

import { proxy } from "@/proxy";

describe("proxy OAuth code fallback", () => {
  it("forwards a root ?code= landing to the callback on the same origin", async () => {
    const res = await proxy(
      new NextRequest("https://ariel-ai-chi.vercel.app/?code=abc"),
    );
    expect(res.headers.get("location")).toBe(
      "https://ariel-ai-chi.vercel.app/auth/callback?code=abc",
    );
  });

  it("stays on localhost in development", async () => {
    const res = await proxy(new NextRequest("http://localhost:3000/?code=abc"));
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/auth/callback?code=abc",
    );
  });

  it("leaves the landing page alone without a code", async () => {
    const res = await proxy(new NextRequest("https://ariel-ai-chi.vercel.app/"));
    expect(res.headers.get("location")).toBeNull();
  });
});
