import { describe, expect, it } from "vitest";
import {
  createProviderModel,
  providerFromDb,
  providerToDb,
} from "@/lib/ai/providers";
import { DEFAULT_MODELS, PROVIDERS, PROVIDER_LABELS } from "@/lib/ai/types";

describe("providers", () => {
  it("defines all four BYOK providers with labels and default models", () => {
    expect(PROVIDERS).toEqual([
      "openrouter",
      "openai",
      "anthropic",
      "google",
    ]);
    for (const provider of PROVIDERS) {
      expect(PROVIDER_LABELS[provider]).toBeTruthy();
      expect(DEFAULT_MODELS[provider]).toBeTruthy();
    }
  });

  it("maps provider ids to the same enum value in both directions", () => {
    for (const provider of PROVIDERS) {
      expect(providerFromDb(providerToDb(provider))).toBe(provider);
    }
  });

  it("creates a callable model instance for every provider", () => {
    for (const provider of PROVIDERS) {
      const model = createProviderModel(
        provider,
        "test-key",
        DEFAULT_MODELS[provider],
      );
      expect(typeof model).toBe("object");
      expect(model).not.toBeNull();
    }
  });
});