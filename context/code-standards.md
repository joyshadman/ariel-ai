# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes; do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- No comments in code unless explicitly requested.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types. A few
  `as UIMessage` / `JsonValue` casts exist where boundary types are fluid —
  keep them adjacent to the boundary, not scattered.
- Validate unknown external input at system boundaries (zod) before trusting it.
- Import types with `import type` where they are erased at runtime.

## Next.js 16

- Default to Server Components; add `"use client"` only where browser
  interactivity requires it.
- Route handlers stay focused on a single responsibility: validate → auth →
  ownership → act → consistent response.
- `proxy.ts` (not middleware) handles auth/session concerns at the edge.
- Routes that read cookies/DB at request time need `export const instant = false`
  when `cacheComponents` is on. `params`/`searchParams` are Promises — await them.
- Typed routes: use the `RouteContext<"/api/...">` type for handler params.

## Styling

- Tailwind CSS v4 utility classes only; no CSS modules or inline styles.
- Stick to the zinc-950 dark palette and radius/typography scale in
  `ui-context.md`. Reuse existing class patterns rather than inventing new ones.

## API Routes

- Validate and parse request input with zod before any logic runs.
- Enforce auth (`getDbUserOrNull`) and ownership before any mutation.
- Return consistent shapes: `{ error: string }` for failures with the right
  status code; expect the documented JSON contract in the success case.

## Data and Storage

- Provider keys: encrypt with `lib/crypto.ts` (AES-256-GCM) before writing to
  `ApiKey`; decrypt only at request time. Store `lastFour` for display.
- Chat/message payloads use the `part`-based UIMessage shape from AI SDK v7.
- No user content (keys, prompts, responses) written to logs.

## File Organization

- `app/api/*` — route handlers per resource.
- `app/(app)/*` — authed UI (dashboard, chat, settings).
- `app/(auth)/*` — guest UI + auth server actions.
- `lib/` — server-side shared modules.
- `lib/ai/` — provider constants (`types.ts`, client-safe) + provider factory
  (`providers.ts`, server-only).
- `tests/unit/` — Vitest unit tests.
- `context/` — product + project docs (never becomes dead weight).
- `prisma/`, `lib/generated/prisma/` — schema + generated client.