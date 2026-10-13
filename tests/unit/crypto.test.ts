import { describe, expect, it, beforeEach } from "vitest";
import crypto from "node:crypto";
import {
  decryptSecret,
  encryptSecret,
} from "@/lib/crypto";

const SECRET = crypto.randomBytes(32).toString("base64");

describe("crypto", () => {
  beforeEach(() => {
    process.env.AI_KEY_ENCRYPTION_SECRET = SECRET;
  });

  it("round-trips a secret", () => {
    const encrypted = encryptSecret("sk-abc123");
    expect(decryptSecret(encrypted)).toBe("sk-abc123");
  });

  it("uses a fresh random IV on every encryption", () => {
    const encrypted = encryptSecret("sk-abc123");
    const encryptedAgain = encryptSecret("sk-abc123");
    expect(encrypted.iv).not.toBe(encryptedAgain.iv);
    expect(encrypted.ciphertext).not.toBe(encryptedAgain.ciphertext);
  });

  it("throws when the key is missing", () => {
    delete process.env.AI_KEY_ENCRYPTION_SECRET;
    expect(() => encryptSecret("sk-abc123")).toThrow(
      "AI_KEY_ENCRYPTION_SECRET is not set",
    );
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptSecret("sk-abc123");
    const buf = Buffer.from(encrypted.ciphertext, "base64");
    buf[0] ^= 0xff;
    expect(() =>
      decryptSecret({ ...encrypted, ciphertext: buf.toString("base64") }),
    ).toThrow();
  });
});