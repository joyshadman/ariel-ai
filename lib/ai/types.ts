export const PROVIDERS = ["openrouter", "openai", "anthropic", "google"] as const;
export type ProviderId = (typeof PROVIDERS)[number];

export const FREE_PROVIDER = "free" as const;
export const FREE_MODEL = "openai/gpt-oss-120b";
export const FREE_DAILY_LIMIT = 20;
export const FREE_USAGE_KIND = "free_chat";

export type ChatProviderId = ProviderId | typeof FREE_PROVIDER;

export function freeMessagesRemaining(usedToday: number): number {
  return Math.max(0, FREE_DAILY_LIMIT - Math.max(0, usedToday));
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openrouter: "OpenRouter",
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Gemini",
};

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openrouter: "openai/gpt-oss-120b",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  google: "gemini-2.0-flash",
};

export const PROVIDER_DB: Record<ProviderId, "OPENROUTER" | "OPENAI" | "ANTHROPIC" | "GOOGLE"> = {
  openrouter: "OPENROUTER",
  openai: "OPENAI",
  anthropic: "ANTHROPIC",
  google: "GOOGLE",
};
