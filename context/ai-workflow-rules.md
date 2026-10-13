# AI Workflow Rules

## Approach

Build the project incrementally with a context-driven workflow. These context
files define what to build, how to build it, and the current state. Implement
against them — do not infer or invent behavior from scratch. Use
test-driven development for logic (Vitest) and verify with `npm run lint` and
`npm run build` before finishing.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single step (e.g. DB schema
  changes with UI redesigns).

## When to Split Work

Split an implementation step if it combines:

- UI changes and backend/storage changes that could ship independently
- Multiple unrelated API routes
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad —
split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before
  implementing, or ask the user.
- If a requirement is missing, add it as an open question in
  `context/progress-tracker.md` before continuing.

## Protected Files

Do not modify the following unless explicitly instructed:

- `lib/generated/prisma/*` — generated Prisma client. Regenerate, don't edit.
- `node_modules/`, `package-lock.json` — managed by installs.
- `.env` — local secrets; never commit. Record required vars in `.env.example`.
- The `<!-- BEGIN:nextjs-agent-rules -->` block inside AGENTS.md.
- User API keys and `AI_KEY_ENCRYPTION_SECRET` — never log, never commit.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- `context/architecture.md` — boundaries, storage model, invariants
- `context/code-standards.md` — conventions and standards
- `context/ui-context.md` — visual language, tokens, layout
- `context/project-overview.md` — scope and features
- `context/progress-tracker.md` — after every meaningful implementation change

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `context/architecture.md` was violated.
3. `context/progress-tracker.md` reflects the completed work.
4. `npm run lint` passes.
5. `npm run build` passes.
6. `npm run test` passes (when logic changed).