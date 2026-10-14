# UI Context

## Theme

Light only. No dark mode. The design language is a warm, editorial
"calm paper" look: off-white paper backgrounds, soft hairline borders,
generous whitespace, and a single coral accent for interactive elements.
Serif display headings (italic-free, with `<em>` highlighted in coral)
are paired with a clean sans for UI text. Pastel supporting tints
(coral-soft, lavender, green) mark icons, badges and feature cards.
One inverted dark surface (`--ink`) is used sparingly for emphasis
cards (privacy card, About CTA, send/mock-input buttons).

## Colors

Defined as CSS custom properties on `:root` in the global stylesheet.
All components must use these tokens. Avoid introducing new hardcoded
hex values.

| Role                     | CSS Variable      | Value     |
| ------------------------ | ----------------- | --------- |
| Page background          | `--paper`         | `#f8f6f0` |
| Surface (cards, inputs)  | `--white`         | `#fffefb` |
| Primary text / dark fill | `--ink`           | `#1d1d1b` |
| Muted text               | `--muted`         | `#696762` |
| Border                   | `--line`          | `#dedbd2` |
| Primary accent           | `--coral`         | `#ed745e` |
| Accent hover / pressed   | `--coral-dark`    | `#d95f4a` |
| Accent tint (badges)     | `--coral-soft`    | `#f9e5de` |
| Secondary tint           | `--lavender`      | `#ddd8f7` |
| Success tint             | `--green`         | `#dcebdd` |

Notes:
- There is no dedicated error token yet. Add one (e.g. `--state-error`)
  before building error states.
- Success text uses `#356d3c` on `--green`, and status dots use
  `#6daa72` / `#72b97a`. These are currently hardcoded and should be
  tokenized if reused.
- Secondary surfaces (sidebar, toggles, key visual) use the hardcoded
  neutrals `#f0eee7`, `#eae7df`, `#f1efe9`, `#e3e0d7`.
- Text on the dark card: `#b9b6ae`; on the dark CTA: `#aaa79f`.

## Typography

Fonts load from Google Fonts via `@import` at the top of the stylesheet.

| Role                           | Font                              | Variable / Usage                   |
| ------------------------------ | --------------------------------- | ---------------------------------- |
| UI text (body, buttons, forms) | DM Sans (400, 500, 600)           | Default `font-family` on `:root`   |
| Display (h1–h3, logo, prices)  | DM Serif Display (regular, italic)| Set per-class, weight 400          |
| Code/mono                      | Not defined                       | No mono font is used yet           |

Conventions:
- Headings use DM Serif Display at weight 400 with tight tracking
  (about `-.025em` to `-.035em`).
- Hero h1 is 66px (46px under 700px). Section h2 is 46px (38px on
  mobile). Page titles are 56–60px (43px on mobile).
- `em` inside headings renders in `--coral`.
- Eyebrows/kickers: 11px, uppercase, `.18em` letter-spacing, weight 600,
  `--muted`.
- Body copy is 13–18px depending on context. Chat UI text runs
  smaller (9–13px).
- `font-synthesis: none` is set globally.

## Border Radius

Plain CSS radii are used (not Tailwind classes), even though
`@import "tailwindcss"` is present.

| Context                       | Value                     |
| ----------------------------- | ------------------------- |
| Pills (buttons, chips, badges)| `999px`                   |
| Small UI (inputs, tags)       | `8px`–`13px`              |
| Cards / panels                | `15px`–`24px`             |
| Large sections / CTA / hero art | `28px`                  |
| Avatars, dots, logo mark      | `50%`                     |

Specifics: inputs `10px`, social button `11px`, composer `17px`,
feature/price cards `22px`, AI card and auth card `24px`.

## Component Library

No third-party component library. Components are hand-built in a single
`App.tsx` with React and TypeScript and styled by plain class names in
a global stylesheet (Tailwind is imported but effectively unused).
Shared building blocks:
- `Icon`: inline SVG icon set, selected by `name`.
- `Logo`: coral circular mark plus lowercase "ariel" wordmark.
- `Button`: props `kind` (`primary` | `secondary` | `ghost`), `type`,
  `className`. Renders `.btn .btn-{kind}`.
- `Header`: site nav, collapses to a menu button under 700px.
- Page components: `Home`, `Chat`, `Pricing`, `Login`, `Settings`,
  `About`.

Routing is state-based: a `Page` union
(`home | chat | pricing | about | login | settings`) and a `navigate`
function that also smooth-scrolls to top. Reuse `Button` and `Icon`
rather than writing new ones.

## Layout Patterns

- Marketing pages: `.app` wrapper with centered `max-width: 1200px`
  header (82px tall) and footer with top border, 32px side padding
  (20px on mobile).
- Hero: two-column grid (`1.03fr .97fr`) with copy left and an
  orbit-ring visual with floating notes right. Collapses to one
  column under 900px.
- Feature grid: 3 columns (`1.2fr .8fr .8fr`), 2 under 900px, 1 under
  700px. Cards have a 340px min height.
- Pricing: 3-column grid with the featured card lifted `-12px` and
  outlined in 2px coral. Single column under 900px.
- Auth: full-viewport page with a coral-soft elliptical clip-path on
  the left half and a centered 430px card. The clip-path is hidden on
  mobile.
- Chat: full-viewport grid with a 270px left sidebar (`#f0eee7`,
  right border) and a main column (topbar, scrolling conversation,
  composer pinned at the bottom center, max 720px). Sidebar is hidden
  under 700px.
- Settings: top bar, then a two-column layout with a 220px section nav
  and a content column of max 680px. The nav becomes a horizontal
  scroll row on mobile.
- About: centered hero, a two-column manifesto with art, a 3-column
  values grid, and a dark CTA block.
- Navbar: top bar, no border. Links show a coral underline that grows
  from center on hover or active.
- Breakpoints: `900px` (tablet) and `700px` (mobile).
- Elevation: soft, low-opacity warm shadows
  (e.g. `0 25px 65px rgba(63,48,43,.12)`). Buttons lift `-2px` on hover.
- Focus: inputs get a coral border and a `3px` coral-soft ring.

## Icons

Custom inline SVG set in the `Icon` component (not an icon library).
Stroke-based only: 24×24 viewBox, `fill="none"`,
`stroke="currentColor"`, `strokeWidth` 1.8, round caps and joins.
Available names: `spark`, `arrow`, `check`, `plus`, `send`, `key`,
`eye`, `brain`, `shield`, `card`, `menu`, `trash`.

Sizes: default 18px. Common sizes are 14–17px inline, 15–16px in
buttons and chips, 24–28px for large feature marks, 38px for the
About art. Icons inherit color. Coral is used for accents, `--muted`
for secondary.

Add new icons by extending the `paths` map in `Icon`, keeping the same
stroke style.