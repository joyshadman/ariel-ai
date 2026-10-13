export const PROVIDERS = ["openrouter", "openai", "anthropic", "google"] as const;
export type ProviderId = (typeof PROVIDERS)[number];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openrouter: "OpenRouter",
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Gemini",
};

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openrouter: "openai/gpt-6-astra",
  openai: "gpt-6-astra",
  anthropic: "claude-sonnet-5-5",
  google: "gemini-3.8-flash",
};

export const PROVIDER_DB: Record<ProviderId, "OPENROUTER" | "OPENAI" | "ANTHROPIC" | "GOOGLE"> = {
  openrouter: "OPENROUTER",
  openai: "OPENAI",
  anthropic: "ANTHROPIC",
  google: "GOOGLE",
};