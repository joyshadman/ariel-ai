# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Foundation built and **fully verified against live infra**. Phase: **In progress** —
initial migrations applied to the Neon database, Supabase publishable key wired,
unauthenticated endpoints verified, and the complete authenticated flow
(login → save key → streaming chat → persisted chat with auto-title) verified
end to end against a production build. Remaining: initial commit and Playwright
e2e specs.

## Current Goal

Make the initial commit (all current work is uncommitted).

## Completed

- **Full end-to-end verified (production build, `npm start`)** against live
  infra with a script harness:
  - Login → encrypted API key save → key list → `/api/chat` streaming (OpenRouter
    `openai/gpt-4.1-mini`) → chat persisted via `/api/chats/{id}` with 2 message
    rows (user + assistant) and auto-title from the first user prompt. **ALL
    CHECKS PASSED**.
  - Test account `arielai.e2e@gmail.com` / `testpassword123` created in Supabase
    (email confirmation off); OpenRouter key `sk-or-v1-…d01a` in `.env` as
    `openrouter_key` (also run e2e harness with it; harness cleanup deletes the
    per-user key row after the run).
  - Provider direct + SDK checks: OpenRouter REST call returns 200; `streamText`
    fails with 402 unless `maxOutputTokens` is capped (see decisions).
  - Default models confirmed live on OpenRouter: `openai/gpt-6-astra`,
    `openai/gpt-6.1-sol`, `openai/gpt-4.1-mini`, `anthropic/claude-sonnet-5.5`
    all EXISTS in `/api/v1/models`.
- **Fixes driven by live testing**:
  - `app/api/chat/route.ts` now sets `maxOutputTokens: 4096` — the AI SDK v7
    default requests ~65536 max tokens and OpenRouter rejects it with 402 on
    small-balance accounts.
  - `onEnd` persistence merges the request's full message list with the
    generated-response messages (deduped by id). v7's `toUIMessageStream` onEnd
    only hands back the newly generated assistant message, so persisting just
    `event.messages` dropped the user prompt.
  - `Message.position Int` column added (migration
    `20261013165956_add_message_position`, applied on Neon) — `createMany`
    rewrites all rows each turn and they'd share a single `createdAt`; order is
    now explicit `position asc` instead of `createdAt`.
- **Live env wired**: real values supplied in gitignored `.env` (Neon
  `DATABASE_URL`, Supabase `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `AI_KEY_ENCRYPTION_SECRET`,
  optionally `openrouter_key` for testing).
- **Supabase publishable key adopted**: code (`proxy.ts`, `lib/supabase/*`)
  now reads `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (supabase-js 2.117 supports
  `sb_publishable_` keys).
- **Schema migrated**: `npx prisma migrate dev --name init` applied on Neon
  (`prisma/migrations/20261013162648_init`). `prisma.config.ts` now strips the
  `channel_binding=require` query param for the Schema Engine (the Neon WS pool
  tolerates it; the migration engine does not) and loads `.env` itself (Prisma 7
  config files don't auto-load it).
- **Signup handles email confirmation**: Supabase has `mailer_autoconfirm` off,
  so `signupAction` returns a "check your email" message instead of redirecting
  when no session is issued; `SignupForm` shows it as a success notice.

- **Context & planning**: AGENTS.md project context written; `context/` filled
  in; stack, providers, DB/ORM, auth, testing decisions locked.
- **Dependencies**: `ai@7`, `@ai-sdk/{openai,anthropic,google}@4`,
  `@openrouter/ai-sdk-provider@3`, `@ai-sdk/react@4`,
  `@prisma/client@7.10.0`, `@prisma/adapter-neon`, `@neondatabase/serverless`,
  `@supabase/{supabase-js,ssr}`, `zod@4`, `server-only`; dev: `prisma@7.10.0`,
  `vitest@5`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`,
  `@testing-library/jest-dom`, `@playwright/test`, `@types/node@^22`.
- **Data layer**: `prisma/schema.prisma` (AiProvider enum; User, ApiKey with
  `@@unique([userId, provider])`, Chat, Message, CreditLedger),
  `prisma.config.ts` (Prisma 7 — no datasource url in schema), generated client
  at `lib/generated/prisma`.
- **lib/**: `db.ts` (Prisma + Neon adapter), `crypto.ts` (AES-256-GCM),
  `supabase/server.ts` + `client.ts`, `auth/dal.ts` (getAuthUser, requireAuthUser,
  getDbUser, getDbUserOrNull, getOrCreateDbUser), `ai/types.ts` (client-safe),
  `ai/providers.ts` (server-only factory + enum mapping).
- **API routes**: `/api/keys` (GET/POST/DELETE, zod, encrypt-on-write),
  `/api/chats` (list), `/api/chats/[id]` (messages w/ ownership), `/api/chat`
  (BYOK streaming via `streamText` + `toUIMessageStream`, persist on `onEnd`,
  auto-title, `maxDuration = 60`).
- **Auth + edge**: `proxy.ts` (session refresh, guards, matcher),
  `app/(auth)/actions.ts` (login/signup/logout server actions), login + signup
  pages with `useActionState` forms.
- **UI**: landing page; dark app shell with sign-out; dashboard (recent chats +
  key status); settings + `ApiKeysManager` client; chat page + `ChatClient`
  (`useChat` v7, `DefaultChatTransport`, localStorage provider/model via
  `useSyncExternalStore`, history sidebar).
- **Testing/tooling**: `vitest.config.ts`, `vitest.setup.ts`,
  `tests/mocks/server-only.ts`, `tests/unit/{crypto,providers}.test.ts`,
  `playwright.config.ts`, `test`/`test:watch`/`e2e`/`db:generate`/`db:migrate`
  scripts, gitignored placeholder `.env`.
- **Verified (production build, `npm start`)**:
  - `GET /` 200, `GET /login` 200, `GET /signup` 200.
  - `GET /dashboard` unauthenticated → 307 redirect to `/login` (proxy guard).
  - `GET /api/keys`, `GET /api/chats`, `GET /api/chats/foo`,
    `POST /api/chat` unauthenticated → 401 `{"error":"Unauthorized"}` —
    proves Supabase client init, route wiring, and auth guards all hold with the
    live publishable key.
  - Neon reachable: WS pool `SELECT 1` OK; tables verified present after migrate.
  - `npm run test` (7/7), `npm run lint` (clean), `npm run build` (green).

- **Free tier + functional pass (2026-10-14)**, verified live with a 25-check
  browser e2e on a production build (ALL CHECKS PASSED):
  - `/api/chat` rebuilt (a broken WIP version had no auth and trusted a
    client-sent `userId`): auth, BYOK, and a `free` provider using
    `FREE_TIER_OPENROUTER_KEY` (fallback `openrouter_key`) with model
    `openai/gpt-oss-120b`, 20 msgs/user/UTC day. `claimFreeMessage` inserts
    then counts (race-safe, rolls back over limit → 429); `refundFreeMessage`
    on stream error. Readable provider error messages (401/402/404/429).
  - Chat UI: limit-reached and missing-key notices disable the composer;
    "Use Ariel Free" shortcut; mobile new-chat + settings buttons.
  - Settings: Ariel Free allowance card with progress bar.
  - Auth: password reset (`/forgot-password` → email → `/auth/callback?next=/reset-password`
    → `/reset-password`); callback distinguishes oauth vs reset failures;
    Google button detects a disabled provider via `/auth/v1/settings`.
  - CTAs "Get started" → `/signup`.
  - `await connection()` in `/chat` and `/settings` pages — fixes
    blocking-prerender-current-time errors under `cacheComponents`.

- **Toasts, profile, chat management (2026-10-14)**, verified live (26-check
  browser e2e on a production build):
  - `sonner` toaster in the root layout (`components/Toaster.tsx`); used for
    key save/remove, profile save, chat rename/delete.
  - Navbar is auth-aware via `useSessionUser` (browser Supabase session):
    signed in → "Open chat" + avatar (Google `avatar_url`/`picture`, initial
    fallback) linking to `/settings#account` (Profile section).
  - Profile: editable display name (`PATCH /api/profile` → DB + Supabase
    `full_name`); DAL backfills a missing name from OAuth metadata.
  - Chat list: rename (inline) and delete (inline confirm) per chat via
    `PATCH`/`DELETE /api/chats/[id]` (ownership-scoped `updateMany`/
    `deleteMany`, 404 otherwise); mobile history drawer. Auto-title only
    applies while a chat is still "New chat", so renames stick.

- **Auth redirect fix (2026-10-14)**:
  - Root cause of "production login lands on localhost": Supabase Site URL was
    `http://localhost:3000` and the production URL was not in the Redirect
    URLs allowlist, so GoTrue replaced the production `redirect_to` with
    localhost (proved by probing `/auth/v1/verify` with a bad token: prod,
    localhost-allowed and bogus `redirect_to` → prod and bogus fell back to
    `http://localhost:3000/`). App code was already origin-relative.
  - Code: `lib/auth/redirect.ts` (`safeRedirectPath`, `isGuestPath`), `next`
    preserved through `proxy.ts` → login/signup → Google OAuth →
    `/auth/callback`; tests in `tests/unit/auth-redirect.test.ts`.
  - React Router evaluated and rejected — Next App Router already does
    client-side navigation.
  - Verified locally (prod build, real browser): client nav + back/forward,
    protected → `/login?next=`, signup/login honor `next` and reject `//evil`,
    refresh nested route, logout, session restore.
- **Navigation speed + OAuth fallback (2026-10-26)**:
  - Nav used `router.push` from buttons, so nothing was prefetched;
    `NavigationProvider` now `router.prefetch`es every route on mount.
  - `loading.tsx` skeletons for `/chat` and `/settings` (now ◐ partial
    prerender) so navigation paints immediately while data streams.
  - `proxy.ts` uses `getClaims()` (local JWT verify) instead of `getUser()`
    (network call per request); pages still verify via `getUser()` in the DAL.
  - `proxy.ts` forwards `/?code=` to `/auth/callback` (Site URL fallback).
  - Next 16.4.0 → 16.4.3 (build failed the vulnerability check).
  - React Router again declined — prefetching was the actual fix.

## In Progress

- None — the full authenticated path is verified. Remaining work is commit +
  Playwright e2e specs (explicitly next-iteration polish).

## Next Up

1. Make the initial commit (all current work is uncommitted).
2. Optionally port the script harness into `e2e/` Playwright specs
   (login → add key → chat stream → chat persists) to lock the flow in.

## Open Questions

- **Supabase URL config (manual, blocks prod OAuth/email links)**: set Site URL
  to `https://ariel-ai-chi.vercel.app` and add Redirect URLs
  `https://ariel-ai-chi.vercel.app/**` and `http://localhost:3000/**`. Re-run
  the `/auth/v1/verify` probe afterwards; prod `redirect_to` must be echoed back.

- **Google OAuth**: enabled in Supabase (client `701673619469-l3g6…`), but
  Google returns `redirect_uri_mismatch` until
  `https://whczogwmbxurnekscmep.supabase.co/auth/v1/callback` is added to that
  OAuth client's *Authorized redirect URIs* in Google Cloud Console.

## Architecture Decisions

- **BYOK + capped free tier**: user key is used at request time; the only
  server-paid inference is Ariel Free (20 msgs/day, cheap model). No credit
  accounting or subscriptions in this phase.
- **Neon + Prisma 7**: schema without `datasource url` (now in `prisma.config.ts`
  via `defineConfig`), client generated to `lib/generated/prisma`
  (`provider = "prisma-client"`, `output` required). `prisma.config.ts` loads
  `.env` itself (Prisma 7 configs don't auto-load) and strips `channel_binding`
  from the migration URL — the Neon WS pool handles `channel_binding=require`,
  the migration engine's libpq handshake does not.
- **Supabase Auth with `@supabase/ssr`**: cookie-based SSR sessions; refresh in
  `proxy.ts`.
- **AI SDK v7**: `streamText` → `toUIMessageStream` → `createUIMessageStreamResponse`;
  client `useChat` from `@ai-sdk/react` with `DefaultChatTransport`; initial
  messages passed via the `messages` option (renamed from `initialMessages`).
- **Output cap**: `streamText({ maxOutputTokens: 4096 })` in `/api/chat` —
  AI SDK v7 omits `max_tokens`, and OpenRouter then demands its ~65536 default,
  which fails with 402 on accounts without that credit headroom.
- **Message persistence = request messages + generated response**, merged and
  deduped by id in `onEnd` (v7's `onEnd` only returns the generated message).
  Conversation is stored whole, overwritten per turn, ordered by
  `Message.position`.
- **AES-256-GCM**: 12-byte random IV, key from `AI_KEY_ENCRYPTION_SECRET`
  (base64, 32 bytes); single round-trip key, no KMS for v1.
- **Client/server split in `lib/ai/`**: `types.ts` is client-safe
  (PROVIDERS/PROVIDER_LABELS/DEFAULT_MODELS); `providers.ts` re-exports and adds
  the server-only factory — client components must import from `types.ts`.
- **Next 16 specifics adopted**: `proxy.ts` instead of middleware,
  `RouteContext<"/api/...">`, awaited `searchParams`, `instant = false` on
  dynamic authed routes, `parts`-based UIMessage persistence.

## Session Notes

- Next.js 16 docs live in `node_modules/next/dist/docs/` — always read them
  before writing framework code; AI SDK v7 docs in `node_modules/ai/src/` /
  `node_modules/ai/dist/index.d.ts` (types are authoritative).
- `useChat` option is `messages` (not `initialMessages`). `convertToModelMessages`
  takes `Omit<UIMessage, "id">[]`.
- `RouteContext<"/chats/[id]">` fails; use the full path
  `RouteContext<"/api/chats/[id]">`.
- Env required: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `AI_KEY_ENCRYPTION_SECRET`; `openrouter_key`
  optional for e2e testing. Both `.env` and `.env.example` currently carry real
  values and are gitignored (`.env*`) — keep them out of commits.
- `toUIMessageStream`'s `onEnd` receives only the generated assistant message,
  not the request history — always merge in the request's `messages` when
  persisting full conversations.
- AI SDK v7 default `max_tokens` is huge (~65536) and unset in the raw request;
  always pass `maxOutputTokens` so low-balance BYOK keys work.
- Supabase email confirmation is off now; the signup action still handles the
  no-session case (shows "check your email").
- `prisma.config.ts` uses a tiny hand-rolled `.env` loader (dotenv is only
  available nested under `prisma`'s node_modules, not at the root).
- Supabase auth flow: email confirmation is off now, so signup issues a session
  immediately; the signup action still safely handles the no-session case
  (`AuthError.message` shown as a "check your email" notice).
- Git: everything except `AGENTS.md` changes, `.opencode/`, and `opencode.json`
  is uncommitted. `prisma/migrations/` is new (keep it). npm audit shows 9
  high-severity findings (deferred).
- No `error.tsx` / `loading.tsx` boundaries yet; chat streaming UI relies on
  loop-back errors in the composer area.