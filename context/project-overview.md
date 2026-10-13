# ariel-ai

## Overview

Ariel AI is a bring-your-own-key (BYOK) AI chat web app. Users connect their
own provider API key — OpenRouter, OpenAI, Anthropic, or Google Gemini — and
chat with any supported model directly through that key. The app stores keys
encrypted at rest and never resells or proxies inference on its own keys. It
is aimed at people who already pay for AI providers and want a clean, unified
chat surface without per-seat subscriptions.

## Goals

1. Let a user sign up, save one or more provider API keys, and start streaming
   responses from any of the four supported providers within minutes.
2. Keep user API keys encrypted at rest (AES-256-GCM) and only ever send them
   to the provider the user chose; never log or commit them.
3. Persist chat history per user so sessions survive reloads and are resumable.
4. Get a full foundation (auth, data layer, key management, streaming chat,
   tests, CI-ready tooling) green under `npm run lint` + `npm run build`.

## Core User Flow

1. User signs up or signs in via Supabase Auth (email + password).
2. User opens Settings and pastes an API key for a provider (optional label).
3. User opens Chat, picks a provider + model (defaults persisted in
   `localStorage`), and sends a message.
4. The message streams back through the user's own key; chat and messages are
   persisted to Postgres.
5. User resumes any chat later from the sidebar or dashboard.

## Features

### Auth

- Email/password signup, login, logout (Supabase Auth, SSR cookie session).
- Route protection via `proxy.ts` (Next 16 middleware replacement).

### API Keys

- Save/update/list/delete keys per provider, encrypted at rest.
- Hide the raw key after save — only the last four characters are shown.

### Chat

- Streaming chat via Vercel AI SDK v7 (`useChat` + `streamText`).
- Provider + model selection, persisted per browser.
- Chat history sidebar, auto-generated titles from the first user message.

### Dashboard

- Welcome view, recent chats, and per-provider configured/unconfigured status.

## Scope

### In Scope

- BYOK chat for OpenRouter, OpenAI, Anthropic, Google Gemini.
- Supabase-backed auth, Neon/Prisma persistence, AES-256-GCM key encryption.
- Minimal dark UI (landing, auth, dashboard, settings, chat).

### Out of Scope

- Credit system, subscriptions, and bKash payments (deferred — see
  `architecture.md` `## Monetization` note).
- Multi-user collaboration, sharing, team workspaces.
- File/image attachments, advanced tool use.

## Success Criteria

1. A signed-in user can save a key in Settings and immediately stream a chat
   response through it.
2. `npm run lint`, `npm run build`, and `npm run test` all pass.
3. No secrets appear in logs or the repo (`.env` is gitignored; keys encrypted).
4. A signed-out user cannot reach `/chat`, `/dashboard`, or `/settings`; a
   signed-in user cannot reach `/login` or `/signup`.