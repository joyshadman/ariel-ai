<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ariel-ai

AI product (web app). Bring-your-own-key (BYOK) model: users supply their own AI
provider API key; the app does not resell or proxy inference on our keys.

## Status

Foundation built end to end and **verified against live infra**: Supabase auth,
encrypted BYOK API keys (AES-256-GCM), streaming chat (AI SDK v7), Neon/Prisma
persistence, dark UI (landing, auth, dashboard, settings, chat). `npm run lint`,
`npm run build`, `npm run test` all pass. Prisma migrations applied to live Neon;
Supabase publishable key wired; the full authenticated flow (login → save key →
streaming chat → persisted chat with auto-title) verified against a production
build via a script harness (ALL CHECKS PASSED). First commit still pending. `.env`
requires `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `AI_KEY_ENCRYPTION_SECRET`; `openrouter_key`
optional for e2e testing.

## Env

Read `.env` (gitignored) — never commit secrets. `.env.example` mirrors the
shape. Required vars: `DATABASE_URL` (Neon), `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sb_publishable_ key — Supabase email
confirmation is **off**), `AI_KEY_ENCRYPTION_SECRET` (base64 32-byte).
Optional: `FREE_TIER_OPENROUTER_KEY` (server key powering the free tier;
falls back to `openrouter_key`), `openrouter_key` for live e2e testing.

## Free tier

Signed-in users get **Ariel Free** (`openai/gpt-oss-120b` via OpenRouter on the
server key) limited to `FREE_DAILY_LIMIT` (20) messages per user per UTC day,
enforced server-side in `/api/chat` via `UsageEvent` rows (`lib/ai/usage.ts`).
BYOK requests never touch the free quota.

## Context files

These files define the product, architecture, conventions, and progress.
Read the ones relevant to your task before writing code; keep
`context/progress-tracker.md` in sync when you complete meaningful work:

- `context/project-overview.md` — what ariel-ai is, goals, flow, scope
- `context/architecture.md` — stack, boundaries, storage, auth, invariants
- `context/ai-workflow-rules.md` — workflow + scoping rules you must follow
- `context/code-standards.md` — TypeScript/Next/API/styling conventions
- `context/ui-context.md` — visual language and layout patterns
- `context/progress-tracker.md` — current phase, done, next up, decisions

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, RSC) | Turbopack; `cacheComponents` + `partialPrefetching` on |
| UI | React 19 + Tailwind CSS v4 | `@tailwindcss/turbopack` |
| Language | TypeScript (strict) | |
| AI | Vercel AI SDK + LLM provider | **BYOK** — per-user API key, stored encrypted at rest |
| Database | Neon Postgres + Prisma | Neon serverless driver; `postgres` MCP server configured |
| Auth | Supabase Auth | Associates keys, credits, and usage per user |
| Testing | Vitest (unit/integration) + Playwright (e2e/visual) | `tests/unit/*` + `e2e/`; add tests before writing logic |

### Confirmed decisions

- **BYOK providers**: OpenRouter, OpenAI, Anthropic, Google Gemini.
- **Database**: Neon Postgres. **ORM**: Prisma.
- **Auth**: Supabase Auth.
- **Tests**: Vitest + Playwright.

## Monetization (deferred — do NOT implement yet)

- Credits-based usage plus optional monthly purchases.
- Payments via **bKash** (Bangladesh). Not implemented in this phase.
- When built, BYOK must coexist with credit accounting: don't bill users for
  inference they pay for directly via their own API key.

## Conventions

- Read the Next.js guide in `node_modules/next/dist/docs/` before writing
  framework code — this version's APIs differ from older training data.
- NEVER commit secrets. User AI keys must never be logged or checked in.
- No comments in code unless requested.
- Verify with `npm run lint` (and `npm run build`) before considering work done.

## Commands

```bash
npm run dev          # dev server (writes/refreshes the block above)
npm run build        # production build
npm run lint         # eslint
npm run test         # vitest run
npm run test:watch   # vitest
npm run e2e          # playwright test
npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm start            # serve production build
```

## Testing

Vitest (jsdom, React Testing Library) for unit tests in `tests/unit/`, Playwright
for e2e in `e2e/`. Write tests before implementing logic (see the
`test-driven-development` skill). Before considering work done, run
`npm run test` (when logic changed), `npm run lint`, and `npm run build`.
