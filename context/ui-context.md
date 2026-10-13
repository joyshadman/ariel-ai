# UI Context

## Theme

Dark only — no light mode. The design language is a minimal, slightly technical
dark workspace: near-black page background, layered surfaces for panels and
inputs, a single light CTA color, and muted text hierarchy. Rounded pills for
primary actions, rounded corners for fields/cards, hairline borders to separate
surfaces.

## Colors

Used directly as Tailwind v4 utilities (e.g. `bg-zinc-950`). No CSS custom
property indirection; keep to this scale.

| Role            | Class / Value                |
| --------------- | ---------------------------- |
| Page background | `bg-zinc-950` (#09090b)      |
| Surface         | `bg-zinc-900` (inputs)       |
| Raised surface  | `bg-zinc-800` (user bubble)  |
| Primary text    | `text-zinc-50`               |
| Muted text      | `text-zinc-400` / `text-zinc-500` |
| Border          | `border-zinc-900` (hairline) / `border-zinc-800` (controls) |
| Hover border    | `border-zinc-600` / `border-zinc-500` |
| Primary action  | `bg-zinc-50 text-zinc-900` (light pill on dark) |
| Error           | `text-red-400`               |
| Success         | `text-emerald-400` / `border-emerald-800 bg-emerald-950/40` |

## Typography

Geist Sans (default from `create-next-app` via `next/font`); system mono for
keys/models/code.

| Role              | Font            |
| ----------------- | --------------- |
| UI text / headings | Geist Sans      |
| Code/mono         | `font-mono` (system mono) |

Headings: `font-semibold tracking-tight`. Body: `text-sm` default with
`leading-7` for prose, `text-base/lg` on the landing page.

## Border Radius

| Context                | Class                       |
| ---------------------- | --------------------------- |
| Inputs, cards, buttons | `rounded-lg`                |
| Primary CTAs, pill nav  | `rounded-full`              |
| User message bubble     | `rounded-2xl rounded-br-md` |
| Provider/status chips   | `rounded-full`              |

## Component Library

No external component library. Hand-rolled Tailwind components with a small set
of repeated class strings (e.g. the `inputClass` constant in `login-form.tsx`,
`signup-form.tsx`, `api-keys-manager.tsx`). Match those patterns when adding UI;
extract a shared helper only if the pattern repeats a third time.

## Layout Patterns

- **App shell** (`app/(app)/layout.tsx`): top nav with bottom hairline border
  (`border-b border-zinc-900`), centered `max-w-6xl`; brand left, links + email
  + sign-out right.
- **Auth pages**: centered column `max-w-sm`, brand link, heading + subtext,
  form, footer link.
- **Landing**: full-height centered hero, pill CTAs, provider chips.
- **Chat**: full-width split — left `w-64` sidebar (new-chat button + chat
  history) with right hairline; main column with provider/model controls row,
  scrollable message area (`max-w-2xl` centered), and a bottom composer form.
- **Dashboard**: `max-w-6xl` column: heading + subtext, pill actions row, key
  status chips, recent-chats list of card rows.
- **Settings**: `max-w-3xl` column: heading, key form (provider select + label +
  key input), saved-keys list with Remove buttons.

## Icons

None yet — text-only UI. If icons are needed, prefer inline SVG or `lucide-react`
(only after confirming it's an acceptable dependency). Avoid emoji.