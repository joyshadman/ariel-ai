import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AiProvider } from "@/lib/generated/prisma/enums";
import { FREE_MODEL, PROVIDER_DB } from "./types";
import type { ProviderId } from "./types";

export { PROVIDERS, PROVIDER_LABELS, DEFAULT_MODELS } from "./types";
export type { ProviderId } from "./types";

export function providerToDb(provider: ProviderId): AiProvider {
  return PROVIDER_DB[provider];
}

export function providerFromDb(provider: AiProvider): ProviderId {
  return provider.toLowerCase() as ProviderId;
}

export function createProviderModel(
  provider: ProviderId,
  apiKey: string,
  modelId: string,
) {
  switch (provider) {
    case "openrouter":
      return createOpenRouter({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
  }
}

export function freeTierApiKey(): string | null {
  return process.env.FREE_TIER_OPENROUTER_KEY || process.env.openrouter_key || null;
}

export function createFreeModel(apiKey: string) {
  return createOpenRouter({ apiKey })(FREE_MODEL);
}
