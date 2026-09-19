# Tailwind v4 → StyleX literal value reference

This document translates every Tailwind v4 utility family used in `apps/ui/src` into the
exact literal CSS values needed to write equivalent `stylex.create` rules. Every value below
was produced by compiling the project's real `apps/ui/src/index.css` (which does
`@import 'tailwindcss'; @import 'tw-animate-css'; @import 'shadcn/tailwind.css';` plus the
project's own `:root`/`.dark`/`@theme inline`/`@layer base` blocks) with Tailwind v4's own
engine (`@tailwindcss/node`'s `compile()`), against the actual set of class names found in the
codebase. Nothing here was reconstructed from memory — it is the literal generated CSS, or a
direct quote of the source `.css` files listed below.

**Sources read:**

- `node_modules/.pnpm/tailwindcss@4.1.18/node_modules/tailwindcss/theme.css` (462 lines, default theme tokens)
- `node_modules/.pnpm/tailwindcss@4.1.18/node_modules/tailwindcss/preflight.css` (393 lines, full reset — appendix)
- `node_modules/.pnpm/tailwindcss@4.1.18/node_modules/tailwindcss/utilities.css` — contains only `@tailwind utilities;`; Tailwind v4 generates utility CSS from an internal Rust/JS engine, not a static stylesheet, so utility values below were obtained by **compiling** the theme against real candidates (see Methodology).
- `node_modules/.pnpm/tw-animate-css@1.4.0/node_modules/tw-animate-css/dist/tw-animate.css` (minified; pretty-printed for reading)
- `node_modules/.pnpm/shadcn@3.8.4_.../node_modules/shadcn/dist/tailwind.css` (96 lines — quoted in full in §10/§9)
- `apps/ui/src/index.css` (the project's own theme/base layer)

**Methodology:** a Node script loaded `@tailwindcss/node`'s `compile()` against
`apps/ui/src/index.css`, then called `build(candidates)` with (a) every string token extracted
from `apps/ui/src/**/*.tsx` (excluding `visual-gallery`) that looks like a Tailwind class, and
(b) a manually curated superset covering every utility family named in the migration brief
(container queries, ring/shadow composition, tw-animate classes, custom variants, etc.), so
families that exist in the theme but aren't yet used in the codebase are still documented.
The resulting CSS is ground truth for exactly what Tailwind v4 emits in this project.

**Token extraction result:** the tokeniser (a small script under
`/private/tmp/.../scratchpad/extract-tokens.mjs`, string-literal tokenised, `visual-gallery`
excluded) found **1209 distinct raw string tokens** across 100 `.tsx` files. A second pass
that keeps only tokens shaped like Tailwind utilities (matching a known prefix/variant
grammar) narrows this to **620 distinct Tailwind-shaped tokens** (many are variant
combinations of the same base utility, e.g. `hover:bg-accent` and `focus:bg-accent` are
counted separately). Of the raw 1209, 526 do not correspond to any generated CSS class; nearly
all of these are false positives from the naive string tokeniser — English words, JSX prop
values, cva variant keys (`'icon-lg'`, `'block-start'`), and Radix/Base UI `data-slot` names
(`'accordion-item'`, `'select-content'`, …) that happen to look class-like. Exactly **two**
real-looking Tailwind classes in the source do not compile to any CSS at all and are flagged
as dead/incorrect utility usage — see the note at the end of this document.

---

## 1. Spacing scale

`--spacing: 0.25rem` (theme.css:277). Every numeric spacing utility (`p-*`, `m-*`, `gap-*`,
`w-*`, `h-*`, `inset-*`, `top/right/bottom/left-*`, `translate-*`, `scroll-m-*`, …) compiles to
`calc(var(--spacing) * N)`, i.e. `N × 0.25rem`. Below are the exact rem values Tailwind
computes at build time (the compiled CSS keeps the `calc()` form; StyleX should use the
resolved literal since StyleX has no equivalent of Tailwind's `--spacing` theme var unless you
define one as a shared constant).

| Step (N) | rem (`N × 0.25rem`) | Used by (examples in codebase)                                                          |
| -------- | ------------------- | --------------------------------------------------------------------------------------- |
| 0        | `0rem`              | `p-0`, `m-0`, `gap-0`                                                                   |
| 0.5      | `0.125rem`          | (not used in repo; reference only)                                                      |
| 1        | `0.25rem`           | `p-1`, `gap-1`, `mt-1`                                                                  |
| 1.5      | `0.375rem`          | (not used in repo; reference only)                                                      |
| 2        | `0.5rem`            | `p-2`, `gap-2`, `mb-2`                                                                  |
| 2.5      | `0.625rem`          | reference example (`p-2.5`, `gap-2.5` — not currently used, per the task's own example) |
| 3        | `0.75rem`           | `p-3`, `gap-3`, `mt-2` (as `pl-6`/`h-6` etc. also use step 6)                           |
| 3.5      | `0.875rem`          | (not used in repo; reference only)                                                      |
| 4        | `1rem`              | `p-4`, `gap-4`, `size-4`                                                                |
| 5        | `1.25rem`           | `gap-5`, `min-w-5`                                                                      |
| 6        | `1.5rem`            | `p-6`, `size-6`, `h-6`                                                                  |
| 7        | `1.75rem`           | `pl-7`, `min-w-7`, `h-7`                                                                |
| 8        | `2rem`              | `p-8`, `size-8`, `pr-8`                                                                 |
| 9        | `2.25rem`           | `h-9`, `min-w-9`, `size-9`                                                              |
| 10       | `2.5rem`            | `h-10`, `size-10`                                                                       |
| 11       | `2.75rem`           | `w-11`                                                                                  |
| 12       | `3rem`              | `h-12`, `py-24` uses step 24                                                            |
| 16       | `4rem`              | `h-16`, `min-h-16`, `w-[…]`                                                             |
| 20       | `5rem`              | `scroll-m-20`, `w-20`                                                                   |
| 24       | `6rem`              | `w-24`, `py-24`                                                                         |
| 32       | `8rem`              | `min-w-32`                                                                              |
| 36       | `9rem`              | `min-w-36`, `h-36`                                                                      |
| 40       | `10rem`             | `min-w-40` (data-vertical)                                                              |
| 48       | `12rem`             | `max-h-72` uses 72; `w-48`                                                              |
| 56       | `14rem`             | `w-56` (min-w-56)                                                                       |
| 64       | `16rem`             | `w-64`, `h-64`                                                                          |
| 72       | `18rem`             | `w-72`, `max-h-72`                                                                      |
| 96       | `24rem`             | `w-96`                                                                                  |

Other spacing-shaped utilities used in the project, exact generated CSS:

| Class                                                                                                       | Generated CSS                                                                                                              |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `px` (bare, e.g. `p-px`, `w-px`, `h-px`, `translate-x-px`)                                                  | `1px` literal, e.g. `.p-px { padding: 1px; }`                                                                              |
| `w-1/2`, `w-1/3`, `w-2/3`, `w-1/4`, `w-3/4` (fractions)                                                     | `width: calc(1/2 * 100%);` etc. — literal: `50%`, `33.333333%`, `66.666667%`, `25%`, `75%`                                 |
| `top-1/2`, `top-1/3`                                                                                        | `top: calc(1/2 * 100%);` → `50%` / `33.333333%`                                                                            |
| `-translate-y-1/2`, `-translate-x-1/2`                                                                      | `--tw-translate-y: calc(calc(1/2 * 100%) * -1); translate: var(--tw-translate-x) var(--tw-translate-y);` → literal `-50%`  |
| `m-auto`, `mx-auto`, `ml-auto`, `mt-auto`                                                                   | `margin: auto;` / `margin-inline: auto;` / `margin-left: auto;` / `margin-top: auto;`                                      |
| `w-full`, `h-full`, `size-full`                                                                             | `100%`                                                                                                                     |
| `w-screen`                                                                                                  | `width: 100vw;`                                                                                                            |
| `h-screen`                                                                                                  | `height: 100vh;`                                                                                                           |
| `h-svh` / `min-h-svh`                                                                                       | `height: 100svh;` / `min-height: 100svh;`                                                                                  |
| `h-dvh` / `min-h-dvh`                                                                                       | `height: 100dvh;` / `min-height: 100dvh;`                                                                                  |
| `w-fit`, `h-fit`, `size-auto`                                                                               | `width: fit-content;` / `height: fit-content;` / `width/height: auto;`                                                     |
| Negative values (`-mx-1`, `-ml-2`, `-mt-4`, `-top-12`, `-bottom-12`, `-right-12`, `-left-12`, `-space-x-2`) | Sign is applied to the resolved `calc()`, e.g. `.-mx-1 { margin-inline: calc(var(--spacing) * -1); }` → literal `-0.25rem` |

---

## 2. Sizing (`size-*`, `w-*`, `h-*`, `min-*`, `max-w-*`, `container`)

`size-N` sets both `width` and `height` to `calc(var(--spacing) * N)` (see §1 table for
literals), e.g.:

```css
.size-4 {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
}
/* => width: 1rem; height: 1rem; */
```

`min-w-*` / `min-h-*` / `max-h-*` follow the identical `calc(var(--spacing) * N)` pattern
(`min-width`, `min-height`, `max-height` respectively). `min-w-0` → `min-width: calc(var(--spacing) * 0)` → `0rem`.

`max-w-*` **named** sizes map to `--container-*` theme vars (theme.css:285-297), which are
independent of the spacing scale:

| Class                                  | Resolves to var   | Literal rem        |
| -------------------------------------- | ----------------- | ------------------ |
| `max-w-3xs`                            | `--container-3xs` | `16rem`            |
| `max-w-2xs`                            | `--container-2xs` | `18rem`            |
| `max-w-xs`                             | `--container-xs`  | `20rem`            |
| `max-w-sm`                             | `--container-sm`  | `24rem`            |
| `max-w-md`                             | `--container-md`  | `28rem`            |
| `max-w-lg`                             | `--container-lg`  | `32rem`            |
| `max-w-xl`                             | `--container-xl`  | `36rem`            |
| `max-w-2xl`                            | `--container-2xl` | `42rem`            |
| `max-w-3xl`                            | `--container-3xl` | `48rem`            |
| `max-w-4xl`                            | `--container-4xl` | `56rem`            |
| `max-w-5xl`                            | `--container-5xl` | `64rem`            |
| `max-w-6xl`                            | `--container-6xl` | `72rem`            |
| `max-w-7xl`                            | `--container-7xl` | `80rem`            |
| `max-w-none`                           | —                 | `max-width: none;` |
| `max-w-full`                           | —                 | `max-width: 100%;` |
| `max-w-prose`                          | —                 | `max-width: 65ch;` |
| `max-w-screen-sm` (legacy compat form) | `--breakpoint-sm` | `40rem`            |

### `container` utility

Compiled `.container` rule (mobile-first, cascades through every breakpoint that applies):

```css
.container {
  width: 100%;
  @media (width >= 40rem) {
    max-width: 40rem;
  } /* sm */
  @media (width >= 48rem) {
    max-width: 48rem;
  } /* md */
  @media (width >= 64rem) {
    max-width: 64rem;
  } /* lg */
  @media (width >= 80rem) {
    max-width: 80rem;
  } /* xl */
  @media (width >= 96rem) {
    max-width: 96rem;
  } /* 2xl */
}
```

Breakpoints come straight from `--breakpoint-sm/md/lg/xl/2xl` = `40rem/48rem/64rem/80rem/96rem`
(theme.css:279-283). In StyleX, express as five `@media` conditions with those exact
`min-width` px/rem thresholds.

Arbitrary-value sizes used in the project compile literally, e.g.:

```css
.h-\[calc\(100\%-1px\)\] {
  height: calc(100% - 1px);
}
.max-w-\[calc\(100\%-2rem\)\] {
  max-width: calc(100% - 2rem);
}
.lg\:w-\[calc\(33.333\%-0.75rem\)\] {
  @media (width >= 64rem) {
    width: calc(33.333% - 0.75rem);
  }
}
```

---

## 3. Typography

### Font size + line height

Tailwind v4 couples `font-size` with a **paired** `--text-*--line-height` var
(theme.css:299-324), and the utility itself reads it through `var(--tw-leading, …)` so a
`leading-*` utility applied after it can still override:

```css
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-xl {
  font-size: var(--text-xl);
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-2xl {
  font-size: var(--text-2xl);
  line-height: var(--tw-leading, var(--text-2xl--line-height));
}
.text-3xl {
  font-size: var(--text-3xl);
  line-height: var(--tw-leading, var(--text-3xl--line-height));
}
.text-4xl {
  font-size: var(--text-4xl);
  line-height: var(--tw-leading, var(--text-4xl--line-height));
}
```

| Class       | `font-size` | line-height expr     | Literal line-height    |
| ----------- | ----------- | -------------------- | ---------------------- |
| `text-xs`   | `0.75rem`   | `calc(1 / 0.75)`     | `1.3333` (≈ `1.33333`) |
| `text-sm`   | `0.875rem`  | `calc(1.25 / 0.875)` | `1.4286`               |
| `text-base` | `1rem`      | `calc(1.5 / 1)`      | `1.5`                  |
| `text-lg`   | `1.125rem`  | `calc(1.75 / 1.125)` | `1.5556`               |
| `text-xl`   | `1.25rem`   | `calc(1.75 / 1.25)`  | `1.4`                  |
| `text-2xl`  | `1.5rem`    | `calc(2 / 1.5)`      | `1.3333`               |
| `text-3xl`  | `1.875rem`  | `calc(2.25 / 1.875)` | `1.2`                  |
| `text-4xl`  | `2.25rem`   | `calc(2.5 / 2.25)`   | `1.1111`               |
| `text-5xl`  | `3rem`      | `1` (literal)        | `1`                    |
| `text-6xl`  | `3.75rem`   | `1`                  | `1`                    |
| `text-7xl`  | `4.5rem`    | `1`                  | `1`                    |
| `text-8xl`  | `6rem`      | `1`                  | `1`                    |
| `text-9xl`  | `8rem`      | `1`                  | `1`                    |

Arbitrary text sizes used in the project (no paired line-height, since Tailwind only pairs the
named scale): `text-[0.8rem]` → `font-size: 0.8rem; line-height: var(--tw-leading);` (no default
supplied), `text-[10px]` likewise. `text-sm/relaxed` (slash-modifier line-height) compiles to
`font-size: var(--text-sm); line-height: var(--leading-relaxed);` i.e. `0.875rem` / `1.625`
literal (overrides the paired line-height with the named `leading-relaxed` value). The project
also has one dead/invalid class, `text-md` (`toaster.tsx:10`) — there is no `--text-md` token
in Tailwind v4's default theme or the project's `@theme inline`, so this class compiles to
**no CSS at all** (see the note at the end of the doc).

### Font weight

theme.css:326-334:

| Class             | Value |
| ----------------- | ----- |
| `font-thin`       | `100` |
| `font-extralight` | `200` |
| `font-light`      | `300` |
| `font-normal`     | `400` |
| `font-medium`     | `500` |
| `font-semibold`   | `600` |
| `font-bold`       | `700` |
| `font-extrabold`  | `800` |
| `font-black`      | `900` |

### Tracking (letter-spacing) — theme.css:336-341

| Class              | Value      |
| ------------------ | ---------- |
| `tracking-tighter` | `-0.05em`  |
| `tracking-tight`   | `-0.025em` |
| `tracking-normal`  | `0em`      |
| `tracking-wide`    | `0.025em`  |
| `tracking-wider`   | `0.05em`   |
| `tracking-widest`  | `0.1em`    |

### Leading (standalone `leading-*`, not the paired one) — theme.css:343-347

| Class                 | Value                                                |
| --------------------- | ---------------------------------------------------- |
| `leading-tight`       | `1.25`                                               |
| `leading-snug`        | `1.375`                                              |
| `leading-normal`      | `1.5`                                                |
| `leading-relaxed`     | `1.625`                                              |
| `leading-loose`       | `2`                                                  |
| `leading-none`        | `line-height: 1;` (built-in, not theme-keyed)        |
| `leading-7` (numeric) | `line-height: calc(var(--spacing) * 7);` → `1.75rem` |

Every `leading-*` utility also sets `--tw-leading` so a `text-*` on the same/child element
picks it up via the `var(--tw-leading, …)` fallback shown above.

### `truncate`, `line-clamp-*`, `text-balance`, `text-pretty`, `tabular-nums`

```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* N substitutes for line-clamp-N */
}
.text-balance {
  text-wrap: balance;
}
.text-pretty {
  text-wrap: pretty;
}
.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,)
    var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
```

### Font families

Default Tailwind stacks (theme.css:2-8) are **overridden** by the project's `@theme inline`
in `index.css`:

```css
--font-sans: 'Geist Variable', sans-serif; /* project override */
--font-serif: 'MedievalSharp', serif; /* project override */
--font-mono:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; /* Tailwind default, not overridden */
```

So `.font-sans { font-family: 'Geist Variable', sans-serif; }`,
`.font-serif { font-family: 'MedievalSharp', serif; }`,
`.font-mono { font-family: var(--font-mono); }` (i.e. the mono stack above, literally).
`body`/`html` apply `font-sans` via `@layer base` (see §11).

---

## 4. Colors

### `color-mix` opacity-modifier compilation

Any `bg-*/N`, `text-*/N`, `border-*/N`, `ring-*/N`, `outline-*/N` (theme-token colors, e.g.
`primary`, `ring`, `destructive`, `border`, `sidebar-border`) compiles to a fallback +
`@supports` pair. Real example from the build (`bg-primary/80`):

```css
.bg-primary\/80 {
  background-color: var(--primary);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--primary) 80%, transparent);
  }
}
```

Generalized pattern for `{property}-{token}/{N}`:

```css
{property}: var(--{token});
@supports (color: color-mix(in lab, red, red)) {
  {property}: color-mix(in oklab, var(--{token}) N%, transparent);
}
```

For **static** palette colors (`black`/`white`, e.g. `bg-black/50`) it's slightly different —
the fallback is computed in `srgb` directly against the hex literal, then the `@supports`
branch upgrades to `oklab` against the `--color-*` var:

```css
.bg-black\/50 {
  background-color: color-mix(in srgb, #000 50%, transparent);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-black) 50%, transparent);
  }
}
```

Plain `text-white` / `bg-white` (no opacity) compile to the literal hex: `color: #fff;` /
`background-color: #fff;` (`--color-white: #fff`, theme.css:275). `text-black` /`bg-black` →
`#000` (`--color-black: #000`, theme.css:274). Ad-hoc palette colors used in the project (from
Tailwind's default palette, theme.css:10-272) — exact `oklch()` literals actually referenced:

| Class                                            | oklch literal                |
| ------------------------------------------------ | ---------------------------- |
| `bg-emerald-500` / `fill-...`                    | `oklch(69.6% 0.17 162.48)`   |
| `fill-amber-500` / `text-amber-500`              | `oklch(76.9% 0.188 70.08)`   |
| `fill-yellow-400` / `hover:text-yellow-400` etc. | `oklch(85.2% 0.199 91.936)`  |
| `hover:text-green-500` / `bg-green-500`          | `oklch(72.3% 0.219 149.579)` |
| `hover:text-blue-500` / `bg-blue-500`            | `oklch(62.3% 0.214 259.815)` |

### Project design tokens (`apps/ui/src/index.css`)

All tokens are defined twice — light (`:root`) and dark (`.dark`) — as `oklch(...)`, then
re-exposed as `--color-*` in `@theme inline` so Tailwind utilities (`bg-primary`, `text-foreground`,
etc.) can reference them. Full literal list:

| Token                          | Light (`:root`)                                                                | Dark (`.dark`)               |
| ------------------------------ | ------------------------------------------------------------------------------ | ---------------------------- |
| `--background`                 | `oklch(1 0 0)`                                                                 | `oklch(0.145 0 0)`           |
| `--foreground`                 | `oklch(0.145 0 0)`                                                             | `oklch(0.985 0 0)`           |
| `--card`                       | `oklch(1 0 0)`                                                                 | `oklch(0.205 0 0)`           |
| `--card-foreground`            | `oklch(0.145 0 0)`                                                             | `oklch(0.985 0 0)`           |
| `--popover`                    | `oklch(1 0 0)`                                                                 | `oklch(0.205 0 0)`           |
| `--popover-foreground`         | `oklch(0.145 0 0)`                                                             | `oklch(0.985 0 0)`           |
| `--primary`                    | `oklch(0.67 0.16 58)`                                                          | `oklch(0.77 0.16 70)`        |
| `--primary-foreground`         | `oklch(0.99 0.02 95)`                                                          | `oklch(0.28 0.07 46)`        |
| `--secondary`                  | `oklch(0.967 0.001 286.375)`                                                   | `oklch(0.274 0.006 286.033)` |
| `--secondary-foreground`       | `oklch(0.21 0.006 285.885)`                                                    | `oklch(0.985 0 0)`           |
| `--muted`                      | `oklch(0.97 0 0)`                                                              | `oklch(0.269 0 0)`           |
| `--muted-foreground`           | `oklch(0.556 0 0)`                                                             | `oklch(0.708 0 0)`           |
| `--accent`                     | `oklch(0.97 0 0)`                                                              | `oklch(0.371 0 0)`           |
| `--accent-foreground`          | `oklch(0.205 0 0)`                                                             | `oklch(0.985 0 0)`           |
| `--destructive`                | `oklch(0.58 0.22 27)`                                                          | `oklch(0.704 0.191 22.216)`  |
| `--border`                     | `oklch(0.922 0 0)`                                                             | `oklch(1 0 0 / 10%)`         |
| `--input`                      | `oklch(0.922 0 0)`                                                             | `oklch(1 0 0 / 15%)`         |
| `--ring`                       | `oklch(0.708 0 0)`                                                             | `oklch(0.556 0 0)`           |
| `--chart-1..5`                 | `0.88/0.15/92`, `0.77/0.16/70`, `0.67/0.16/58`, `0.56/0.15/49`, `0.47/0.12/46` | same in both modes           |
| `--radius`                     | `0.625rem`                                                                     | (not redefined; inherited)   |
| `--sidebar`                    | `oklch(0.975 0 0)`                                                             | `oklch(0.205 0 0)`           |
| `--sidebar-foreground`         | `oklch(0.145 0 0)`                                                             | `oklch(0.985 0 0)`           |
| `--sidebar-primary`            | `oklch(0.67 0.16 58)`                                                          | `oklch(0.77 0.16 70)`        |
| `--sidebar-primary-foreground` | `oklch(0.99 0.02 95)`                                                          | `oklch(0.28 0.07 46)`        |
| `--sidebar-accent`             | `oklch(0.94 0 0)`                                                              | `oklch(0.28 0 0)`            |
| `--sidebar-accent-foreground`  | `oklch(0.205 0 0)`                                                             | `oklch(0.985 0 0)`           |
| `--sidebar-border`             | `oklch(0.922 0 0)`                                                             | `oklch(1 0 0 / 10%)`         |
| `--sidebar-ring`               | `oklch(0.708 0 0)`                                                             | `oklch(0.556 0 0)`           |
| `--toaster-background`         | `oklch(0.145 0 0)`                                                             | `oklch(0.985 0 0)`           |

For StyleX, these become two literal value sets (light/dark) per token — StyleX has no
CSS-custom-property indirection at the theme layer by default, so either bake both values into
a `stylex.defineVars`/theming construct, or keep them as real CSS custom properties set on
`:root`/`.dark` (StyleX supports reading `var(--x)` literals directly in styles).

---

## 5. Borders and radius

### `border`

`.border { border-style: var(--tw-border-style); border-width: 1px; }` — i.e. **1px solid**
(the `--tw-border-style` custom property defaults to `solid` via Tailwind's `@property`
registration, seen in the generated `@layer properties` block). Directional variants
(`border-t`, `border-b`, `border-l`, `border-r`) set the matching `-width`/`-style` pair only,
still `1px`. `border-0`: `border-style: var(--tw-border-style); border-width: 0px;`.
`border-dashed`: `--tw-border-style: dashed; border-style: dashed;`. `border-collapse`: plain
`border-collapse: collapse;` (table utility, not the border-width family).

Default border **color** for `*` comes from the project's `@layer base` rule
`* { @apply border-border outline-ring/50; }`, which compiles to:

```css
*,
::after,
::before,
::backdrop,
::file-selector-button {
  border-color: var(--border);
  outline-color: var(--ring);
  @supports (color: color-mix(in lab, red, red)) {
    outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
  }
}
```

So every element's border defaults to `var(--border)` (see §4 table for literal), and outline
color defaults to `color-mix(in oklab, var(--ring) 50%, transparent)`.

`border-border` utility itself: `border-color: var(--border);`. `border-border/50`:
`color-mix(in oklab, var(--border) 50%, transparent)` (same `@supports` pattern as §4).
`border-input`, `border-ring`, `border-transparent`, `border-sidebar-border` follow the same
`var(--token)` substitution.

### `rounded-*`

Project's `@theme inline` **overrides** the default radius scale (theme.css:349-356) with
`calc()` expressions off a single `--radius: 0.625rem` (project `:root`):

```css
--radius-sm: calc(var(--radius) - 4px); /* 0.625rem - 4px = 6px  = 0.375rem */
--radius-md: calc(var(--radius) - 2px); /* 0.625rem - 2px = 8px  = 0.5rem */
--radius-lg: var(--radius); /* 0.625rem = 10px */
--radius-xl: calc(var(--radius) + 4px); /* 0.625rem + 4px = 14px = 0.875rem */
--radius-2xl: calc(var(--radius) + 8px); /* 18px = 1.125rem */
--radius-3xl: calc(var(--radius) + 12px); /* 22px = 1.375rem */
--radius-4xl: calc(var(--radius) + 16px); /* 26px = 1.625rem */
```

(`--radius-xs: 0.125rem` is **not** overridden, so `rounded-xs` still uses Tailwind's default.)

| Class                                                         | `border-radius`                                                                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rounded-xs`                                                  | `0.125rem` (Tailwind default, unoverridden)                                                                                                                                                      |
| `rounded-sm`                                                  | `calc(var(--radius) - 4px)` → literal `6px` / `0.375rem`                                                                                                                                         |
| `rounded-md`                                                  | `calc(var(--radius) - 2px)` → literal `8px` / `0.5rem`                                                                                                                                           |
| `rounded-lg` (== `--radius`)                                  | `0.625rem` (`10px`)                                                                                                                                                                              |
| `rounded-xl`                                                  | `calc(var(--radius) + 4px)` → `14px` / `0.875rem`                                                                                                                                                |
| `rounded-2xl`                                                 | `calc(var(--radius) + 8px)` → `18px` / `1.125rem`                                                                                                                                                |
| `rounded-3xl`                                                 | `calc(var(--radius) + 12px)` → `22px` / `1.375rem`                                                                                                                                               |
| `rounded-4xl`                                                 | `calc(var(--radius) + 16px)` → `26px` / `1.625rem`                                                                                                                                               |
| `rounded` (bare, base scale, distinct from theme override)    | `0.25rem` (Tailwind's non-`inline` default `--radius` from the deprecated block; the project's `--radius` only feeds the named steps above, `rounded` itself resolves to the built-in `0.25rem`) |
| `rounded-full`                                                | `calc(infinity * 1px)` (renders as a fully round corner)                                                                                                                                         |
| `rounded-none`                                                | `0px`                                                                                                                                                                                            |
| `rounded-b-xl`, `rounded-t-xl`, `rounded-tl-sm` (directional) | same values, applied to the matching corner longhands (`border-bottom-left-radius` + `border-bottom-right-radius` for `rounded-b-*`, etc.)                                                       |
| `rounded-[inherit]`                                           | `border-radius: inherit;`                                                                                                                                                                        |
| `rounded-[min(var(--radius-md),10px)]`                        | `border-radius: min(var(--radius-md), 10px);` → literally `min(8px, 10px)` = `8px`                                                                                                               |
| `rounded-[calc(var(--radius)-3px)]`                           | `border-radius: calc(var(--radius) - 3px);` → `7px`                                                                                                                                              |

### `ring-*` composition

Ring utilities never set `box-shadow` directly on their own — they set `--tw-ring-shadow` (or
`--tw-inset-ring-shadow` for `ring-inset`) and then re-declare the fully composed `box-shadow`
each time, so the layering is idempotent:

```css
.ring {
  /* default width 1px */
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width))
    var(--tw-ring-color, currentcolor);
  box-shadow:
    var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-0 {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(0px + var(--tw-ring-offset-width))
    var(--tw-ring-color, currentcolor); /* + same box-shadow */
}
.ring-1 {
  /* calc(1px + ...) */
}
.ring-2 {
  /* calc(2px + ...) */
}
.ring-3 {
  /* calc(3px + ...) */
} /* used heavily in the project, e.g. focus-visible:ring-3 */
.ring-4 {
  /* calc(4px + ...) */
}
```

Color: `.ring-ring { --tw-ring-color: var(--ring); }`;
`.ring-ring\/50 { --tw-ring-color: var(--ring); @supports (...) { --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent); } }`.
Offset: `.ring-offset-2 { --tw-ring-offset-width: 2px; --tw-ring-offset-shadow: var(--tw-ring-inset,) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); }`;
`.ring-offset-background { --tw-ring-offset-color: var(--background); }`.

Full list of `--tw-ring-*` / `--tw-inset-ring-*` custom properties involved:
`--tw-ring-inset`, `--tw-ring-offset-width` (default `0px`), `--tw-ring-offset-color`
(default `#fff`), `--tw-ring-color` (default `currentcolor`), `--tw-ring-shadow` (default
`0 0 #0000`), `--tw-inset-ring-color`, `--tw-inset-ring-shadow` (default `0 0 #0000`).

### `outline-*`

```css
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.outline-1 {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.outline-none {
  --tw-outline-style: none;
  outline-style: none;
}
.outline-hidden {
  --tw-outline-style: none;
  outline-style: none;
  @media (forced-colors: active) {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
}
.outline-ring {
  outline-color: var(--ring);
}
.outline-ring\/50 {
  outline-color: var(--ring);
  @supports (color: color-mix(in lab, red, red)) {
    outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
  }
}
```

`outline-none` fully removes the outline; `outline-hidden` is the "visually hidden but still
shown for forced-colors/high-contrast users" variant Tailwind recommends over `outline-none`.

---

## 6. Shadows

Shadow tokens (theme.css:358-368), **not** overridden by the project:

| Class           | `--tw-shadow` value                                                                                                                                                                                  | Notes                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `shadow-2xs`    | `0 1px rgb(0 0 0 / 0.05)`                                                                                                                                                                            |                                                                  |
| `shadow-xs`     | `0 1px 2px 0 rgb(0 0 0 / 0.05)`                                                                                                                                                                      |                                                                  |
| `shadow-sm`     | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`                                                                                                                                      |                                                                  |
| `shadow-md`     | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`                                                                                                                                   |                                                                  |
| `shadow-lg`     | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`                                                                                                                                 |                                                                  |
| `shadow-xl`     | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`                                                                                                                                |                                                                  |
| `shadow-2xl`    | `0 25px 50px -12px rgb(0 0 0 / 0.25)`                                                                                                                                                                |                                                                  |
| `shadow-none`   | `0 0 #0000`                                                                                                                                                                                          | resets to "no shadow" while keeping the composition chain intact |
| `shadow` (bare) | same as `shadow-sm`'s color slots but Tailwind's actual bare `shadow` utility uses the _deprecated_ `--shadow` value `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` (theme.css:457) | used once in the project (`navigation-menu.tsx`, `shadow`)       |

`inset-shadow-*` (theme.css:366-368):

| Class              | `--tw-inset-shadow`                 |
| ------------------ | ----------------------------------- |
| `inset-shadow-2xs` | `inset 0 1px rgb(0 0 0 / 0.05)`     |
| `inset-shadow-xs`  | `inset 0 1px 1px rgb(0 0 0 / 0.05)` |
| `inset-shadow-sm`  | `inset 0 2px 4px rgb(0 0 0 / 0.05)` |

Actual generated rule for `shadow-md` (each shadow utility sets its own layer variable, then
re-declares the same fully-composed `box-shadow`):

```css
.shadow-md {
  --tw-shadow:
    0 4px 6px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1)),
    0 2px 4px -2px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
  box-shadow:
    var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow), var(--tw-shadow);
}
```

Composition order (fixed, always emitted in this order regardless of which utilities are
present): `var(--tw-inset-shadow)`, `var(--tw-inset-ring-shadow)`,
`var(--tw-ring-offset-shadow)`, `var(--tw-ring-shadow)`, `var(--tw-shadow)`. Any layer not set
by a utility defaults to `0 0 #0000` (registered via `@property`), so it contributes nothing
visually but keeps the `box-shadow` shorthand syntactically complete — this is exactly how
`shadow-md ring-3 ring-offset-2` compose into a single `box-shadow` with three real shadow
layers plus two no-op `0 0 #0000` layers. Arbitrary shadow example from the project:

```css
.shadow-\[0_0_6px_2px_rgba\(16\,185\,129\,0\.4\)\] {
  --tw-shadow: 0 0 6px 2px var(--tw-shadow-color, rgba(16, 185, 129, 0.4));
  box-shadow:
    var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow), var(--tw-shadow);
}
```

For StyleX: since there's exactly one `box-shadow` per element, you can generally flatten this
to a single literal `box-shadow` string per component state (no need to reproduce the 5-layer
custom-property machinery) — just compute the final composed string for each combination the
component actually uses.

---

## 7. Layout

| Class                                              | Generated CSS                                                                                                     |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `flex`                                             | `display: flex;`                                                                                                  |
| `inline-flex`                                      | `display: inline-flex;`                                                                                           |
| `flex-col`                                         | `flex-direction: column;`                                                                                         |
| `flex-row`                                         | `flex-direction: row;`                                                                                            |
| `flex-col-reverse`                                 | `flex-direction: column-reverse;`                                                                                 |
| `flex-wrap`                                        | `flex-wrap: wrap;`                                                                                                |
| `flex-1`                                           | `flex: 1 1 0%;` (Tailwind default expansion)                                                                      |
| `shrink-0`                                         | `flex-shrink: 0;`                                                                                                 |
| `grow`                                             | `flex-grow: 1;`                                                                                                   |
| `grow-0`                                           | `flex-grow: 0;`                                                                                                   |
| `basis-full`                                       | `flex-basis: 100%;`                                                                                               |
| `grid`                                             | `display: grid;`                                                                                                  |
| `grid-cols-1`                                      | `grid-template-columns: repeat(1, minmax(0, 1fr));`                                                               |
| `grid-cols-2`                                      | `grid-template-columns: repeat(2, minmax(0, 1fr));`                                                               |
| `grid-cols-3`                                      | `grid-template-columns: repeat(3, minmax(0, 1fr));`                                                               |
| `grid-cols-4`                                      | `grid-template-columns: repeat(4, minmax(0, 1fr));`                                                               |
| `grid-rows-[auto_1fr]`                             | `grid-template-rows: auto 1fr;`                                                                                   |
| `col-start-2`                                      | `grid-column-start: 2;`                                                                                           |
| `row-start-1`                                      | `grid-row-start: 1;`                                                                                              |
| `row-span-2`                                       | `grid-row: span 2 / span 2;`                                                                                      |
| `auto-rows-min`                                    | `grid-auto-rows: min-content;`                                                                                    |
| `order-first`                                      | `order: -9999;`                                                                                                   |
| `order-last`                                       | `order: 9999;`                                                                                                    |
| `items-center`                                     | `align-items: center;`                                                                                            |
| `items-start` / `items-end` / `items-stretch`      | `align-items: flex-start` / `flex-end` / `stretch`                                                                |
| `justify-center`                                   | `justify-content: center;`                                                                                        |
| `justify-between`                                  | `justify-content: space-between;`                                                                                 |
| `justify-start` / `justify-end` (`sm:justify-end`) | `flex-start` / `flex-end`                                                                                         |
| `justify-self-end`                                 | `justify-self: flex-end;`                                                                                         |
| `self-start`                                       | `align-self: flex-start;`                                                                                         |
| `self-stretch`                                     | `align-self: stretch;`                                                                                            |
| `self-center`                                      | `align-self: center;`                                                                                             |
| `place-content-center`                             | `place-content: center;`                                                                                          |
| `place-items-center`                               | `place-items: center;`                                                                                            |
| `gap-*`                                            | see §1 (spacing scale)                                                                                            |
| `inset-0`                                          | `inset: calc(var(--spacing) * 0);` → `0rem`                                                                       |
| `inset-x-0`                                        | `inset-inline: calc(var(--spacing) * 0);`                                                                         |
| `inset-y-0`                                        | `inset-block: calc(var(--spacing) * 0);`                                                                          |
| `top-1/2` / `top-1/3`                              | `top: calc(1/2 * 100%);` → `50%` / `33.333333%`                                                                   |
| `-translate-y-1/2`                                 | `--tw-translate-y: calc(calc(1/2 * 100%) * -1); translate: var(--tw-translate-x) var(--tw-translate-y);` → `-50%` |
| `translate-x-full`                                 | `--tw-translate-x: 100%; translate: var(--tw-translate-x) var(--tw-translate-y);`                                 |
| `translate-x-px`                                   | `--tw-translate-x: 1px; translate: ...`                                                                           |
| `rotate-45` / `rotate-90`                          | `rotate: 45deg;` / `rotate: 90deg;`                                                                               |
| `scale-0` / `scale-100`                            | `--tw-scale-x/-y/-z: 0%` (or `100%`); `scale: var(--tw-scale-x) var(--tw-scale-y);`                               |
| `overflow-hidden` / `overflow-auto`                | `overflow: hidden;` / `overflow: auto;`                                                                           |
| `overflow-x-auto` / `overflow-x-hidden`            | `overflow-x: auto;` / `hidden`                                                                                    |
| `overflow-y-auto`                                  | `overflow-y: auto;`                                                                                               |
| `overscroll-contain`                               | `overscroll-behavior: contain;`                                                                                   |
| `object-cover` / `object-contain`                  | `object-fit: cover;` / `contain;`                                                                                 |
| `aspect-square`                                    | `aspect-ratio: 1 / 1;`                                                                                            |
| `aspect-video`                                     | `aspect-ratio: var(--aspect-video);` → `16 / 9`                                                                   |
| `z-0` / `z-10` / `z-20` / `z-50`                   | `z-index: 0/10/20/50;`                                                                                            |
| `isolate`                                          | `isolation: isolate;`                                                                                             |

`divide-y` / `space-y-*` use the `:where(& > :not(:last-child))` child-selector pattern (not
directly portable to StyleX, which has no selector combinators — express these as explicit
`marginTop`/`borderTop` on non-first children, or a wrapper gap):

```css
.space-y-2 {
  :where(& > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-reverse)));
  }
}
.divide-y {
  :where(& > :not(:last-child)) {
    --tw-divide-y-reverse: 0;
    border-top-style: var(--tw-border-style);
    border-bottom-style: var(--tw-border-style);
    border-top-width: calc(1px * var(--tw-divide-y-reverse));
    border-bottom-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
  }
}
```

---

## 8. Effects and transitions

### `transition*`

```css
.transition {
  transition-property:
    color,
    background-color,
    border-color,
    outline-color,
    text-decoration-color,
    fill,
    stroke,
    --tw-gradient-from,
    --tw-gradient-via,
    --tw-gradient-to,
    opacity,
    box-shadow,
    transform,
    translate,
    scale,
    rotate,
    filter,
    -webkit-backdrop-filter,
    backdrop-filter,
    display,
    content-visibility,
    overlay,
    pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.transition-all {
  transition-property: all; /* + same timing/duration vars */
}
.transition-colors {
  transition-property:
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke,
    --tw-gradient-from, --tw-gradient-via, --tw-gradient-to; /* + timing/duration */
}
.transition-opacity {
  transition-property: opacity;
}
.transition-transform {
  transition-property: transform, translate, scale, rotate;
}
.transition-shadow {
  transition-property: box-shadow;
}
.transition-none {
  transition-property: none;
}
.transition-\[width\,height\] {
  transition-property: width, height; /* + timing/duration */
}
```

Defaults referenced: `--default-transition-duration: 150ms;`
`--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);` (theme.css:444-445).

### `duration-*`

```css
.duration-75 {
  --tw-duration: 75ms;
  transition-duration: 75ms;
}
.duration-100 {
  --tw-duration: 100ms;
  transition-duration: 100ms;
}
.duration-150 {
  --tw-duration: 150ms;
  transition-duration: 150ms;
}
.duration-200 {
  --tw-duration: 200ms;
  transition-duration: 200ms;
}
.duration-300 {
  --tw-duration: 300ms;
  transition-duration: 300ms;
}
.duration-500 {
  --tw-duration: 500ms;
  transition-duration: 500ms;
}
.duration-700 {
  --tw-duration: 700ms;
  transition-duration: 700ms;
}
.duration-1000 {
  --tw-duration: 1000ms;
  transition-duration: 1000ms;
}
```

(the numeric N in `duration-N` is used verbatim as `Nms`.)

### `ease-*` (theme.css:386-388)

| Class                                                             | `cubic-bezier`                                  |
| ----------------------------------------------------------------- | ----------------------------------------------- |
| `ease-in`                                                         | `cubic-bezier(0.4, 0, 1, 1)`                    |
| `ease-out`                                                        | `cubic-bezier(0, 0, 0.2, 1)`                    |
| `ease-in-out`                                                     | `cubic-bezier(0.4, 0, 0.2, 1)`                  |
| `ease-linear`                                                     | `linear` (not a cubic-bezier — literal keyword) |
| `ease-[cubic-bezier(0.22,1,0.36,1)]` (arbitrary, used in project) | `cubic-bezier(0.22,1,0.36,1)`                   |

### `animate-*` (theme.css:390-426)

```css
--animate-spin: spin 1s linear infinite;
--animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
--animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
--animate-bounce: bounce 1s infinite;

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
```

`animate-spin` / `animate-pulse` used in project: `.animate-spin { animation: var(--animate-spin); }` → literal `animation: spin 1s linear infinite;`. `.animate-pulse { animation: var(--animate-pulse); }` → `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;`.

### Opacity, pointer-events, cursor, select, filters, misc

| Class                                                                      | CSS                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `opacity-0` / `opacity-50` / `opacity-60` / `opacity-100`                  | `opacity: 0%/50%/60%/100%;`                                                                                                                                                                                                                                                                                                                |
| `pointer-events-none` / `pointer-events-auto`                              | `pointer-events: none;` / `auto;`                                                                                                                                                                                                                                                                                                          |
| `select-none`                                                              | `-webkit-user-select: none; user-select: none;`                                                                                                                                                                                                                                                                                            |
| `cursor-pointer` / `cursor-default` / `cursor-not-allowed` / `cursor-text` | `cursor: pointer;` / `default;` / `not-allowed;` / `text;`                                                                                                                                                                                                                                                                                 |
| `bg-clip-padding`                                                          | `background-clip: padding-box;`                                                                                                                                                                                                                                                                                                            |
| `backdrop-blur`                                                            | `--tw-backdrop-blur: blur(8px); -webkit-backdrop-filter/backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);` |
| `backdrop-blur-xs` (via `supports-backdrop-filter:` variant, see §9)       | `--tw-backdrop-blur: blur(var(--blur-xs))` → `blur(4px)`                                                                                                                                                                                                                                                                                   |
| `invert`                                                                   | `--tw-invert: invert(100%); filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);`                                                                                                                   |
| `dark:invert`                                                              | same as `invert`, wrapped in `&:is(.dark *) { ... }` (project's custom `dark` variant, see §9)                                                                                                                                                                                                                                             |
| `brightness-90`                                                            | `--tw-brightness: brightness(90%); filter: var(--tw-blur,) var(--tw-brightness,) ... (same filter chain as invert)`                                                                                                                                                                                                                        |
| `will-change-transform`                                                    | `will-change: transform;`                                                                                                                                                                                                                                                                                                                  |
| `isolate`                                                                  | `isolation: isolate;`                                                                                                                                                                                                                                                                                                                      |
| `touch-none` / `touch-manipulation`                                        | `touch-action: none;` / `manipulation;`                                                                                                                                                                                                                                                                                                    |
| `resize-none`                                                              | `resize: none;`                                                                                                                                                                                                                                                                                                                            |
| `sr-only`                                                                  | `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border-width: 0;`                                                                                                                                                                                    |
| `whitespace-nowrap`                                                        | `white-space: nowrap;`                                                                                                                                                                                                                                                                                                                     |

`blur-xs..3xl` theme scale (theme.css:428-434): `4px, 8px, 12px, 16px, 24px, 40px, 64px`.

---

## 9. Variants — exact generated selectors

All confirmed by compiling real usages from the project.

| Variant                                                                                    | Generated wrapper                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hover:`                                                                                   | `&:hover { @media (hover: hover) { …declarations… } }` — the `@media (hover: hover)` guard means hover styles are suppressed on touch devices even inside `:hover`                                |
| `focus:`                                                                                   | `&:focus { … }`                                                                                                                                                                                   |
| `focus-visible:`                                                                           | `&:focus-visible { … }`                                                                                                                                                                           |
| `focus-within:`                                                                            | `&:focus-within { … }`                                                                                                                                                                            |
| `disabled:`                                                                                | `&:disabled { … }`                                                                                                                                                                                |
| `first:`                                                                                   | `&:first-child { … }`                                                                                                                                                                             |
| `last:`                                                                                    | `&:last-child { … }`                                                                                                                                                                              |
| `only:`                                                                                    | `&:only-child { … }` (Tailwind standard; not directly observed in project sample but same mechanism)                                                                                              |
| `odd:`                                                                                     | `&:nth-child(odd) { … }`                                                                                                                                                                          |
| `even:`                                                                                    | `&:nth-child(even) { … }`                                                                                                                                                                         |
| `empty:`                                                                                   | `&:empty { … }`                                                                                                                                                                                   |
| `not-last:` (i.e. `not-*` variant applied to `last`)                                       | `&:not(*:last-child) { … }`                                                                                                                                                                       |
| `open:`                                                                                    | `&:is([open], :popover-open, :open) { … }`                                                                                                                                                        |
| `starting:`                                                                                | `@starting-style { … }`                                                                                                                                                                           |
| `print:`                                                                                   | `@media print { … }`                                                                                                                                                                              |
| `motion-safe:`                                                                             | `@media (prefers-reduced-motion: no-preference) { … }`                                                                                                                                            |
| `motion-reduce:`                                                                           | `@media (prefers-reduced-motion: reduce) { … }`                                                                                                                                                   |
| `placeholder:`                                                                             | `&::placeholder { … }`                                                                                                                                                                            |
| `file:`                                                                                    | `&::file-selector-button { … }`                                                                                                                                                                   |
| `selection:`                                                                               | `& *::selection { … } &::selection { … }` (applied to both self and descendants)                                                                                                                  |
| `before:` / `after:`                                                                       | `&::before { … }` / `&::after { … }`                                                                                                                                                              |
| `sm:`                                                                                      | `@media (width >= 40rem) { … }`                                                                                                                                                                   |
| `md:`                                                                                      | `@media (width >= 48rem) { … }`                                                                                                                                                                   |
| `lg:`                                                                                      | `@media (width >= 64rem) { … }`                                                                                                                                                                   |
| `xl:`                                                                                      | `@media (width >= 80rem) { … }`                                                                                                                                                                   |
| `2xl:`                                                                                     | `@media (width >= 96rem) { … }`                                                                                                                                                                   |
| `dark:` (**project custom variant**, `index.css`: `@custom-variant dark (&:is(.dark *));`) | `&:is(.dark *) { … }`                                                                                                                                                                             |
| `aria-invalid:`                                                                            | `&[aria-invalid="true"] { … }`                                                                                                                                                                    |
| `aria-expanded:`                                                                           | `&[aria-expanded="true"] { … }` (same pattern)                                                                                                                                                    |
| `aria-disabled:`                                                                           | `&[aria-disabled="true"] { … }`                                                                                                                                                                   |
| `aria-pressed:` / `aria-selected:`                                                         | `&[aria-pressed="true"]` / `&[aria-selected="true"]`                                                                                                                                              |
| `group-hover:`                                                                             | `&:is(:where(.group):hover *) { @media (hover: hover) { … } }`                                                                                                                                    |
| `group-data-[state=open]:`                                                                 | `&:is(:where(.group)[data-state="open"] *) { … }`                                                                                                                                                 |
| `group-has-[svg]:`                                                                         | `&:is(:where(.group):has(*:is(svg)) *) { … }`                                                                                                                                                     |
| `peer-disabled:`                                                                           | `&:is(:where(.peer):disabled ~ *) { … }`                                                                                                                                                          |
| `peer-data-[state=checked]:`                                                               | `&:is(:where(.peer)[data-state="checked"] ~ *) { … }`                                                                                                                                             |
| `has-[>svg]:`                                                                              | `&:has(>svg) { … }`                                                                                                                                                                               |
| `has-data-[state=open]:`                                                                   | `&:has(*[data-state="open"]) { … }` (project uses `has-[[data-slot=...]:focus-visible]`, `has-[>[data-align=...]]`, etc. — same `:has()` mechanism with whatever selector is inside the brackets) |
| `has-aria-invalid:`                                                                        | `&:has(*[aria-invalid="true"])`                                                                                                                                                                   |
| `in-data-[open]:`                                                                          | `:is([data-open] *) &` -style ancestor match — compiles to `:where([data-open]) &` pattern (in-\* is the inverse of group/peer: matches when an ancestor carries the attribute)                   |
| `*:` (direct-child variant, e.g. `*:border-border`)                                        | `:is(& > *) { … }`                                                                                                                                                                                |
| `[&_svg]:` (arbitrary descendant selector)                                                 | `& svg { … }`                                                                                                                                                                                     |
| `[&>svg]:`                                                                                 | `&>svg { … }`                                                                                                                                                                                     |
| `supports-[…]:` / `supports-backdrop-filter:`                                              | `@supports (backdrop-filter: var(--tw)) { … }` (Tailwind substitutes a synthetic feature probe for the named `supports-<prop>` shorthand)                                                         |
| `!` important suffix (e.g. `!truncate`)                                                    | Not used anywhere in `apps/ui/src` (verified via grep) — standard Tailwind behavior is `{ … !important; }` on every declaration.                                                                  |
| negative values (`-mx-1`, `-translate-y-1/2`, `-rotate-90`, `-top-12`, …)                  | sign applied inside the `calc()`/literal as shown in §1/§7                                                                                                                                        |

### `data-*` custom variants (from `shadcn/tailwind.css`, quoted verbatim in §10)

The bare `data-open:`, `data-closed:`, `data-checked:`, `data-unchecked:`, `data-selected:`,
`data-disabled:`, `data-active:`, `data-horizontal:`, `data-vertical:` variants are **not**
Tailwind's generic `data-[...]` arbitrary-attribute syntax — they are custom variants defined
by `shadcn/tailwind.css` (imported via `@import 'shadcn/tailwind.css'` in `index.css`).
Confirmed generated selectors:

```css
.data-open\:animate-in    { &:where([data-state="open"]), &:where([data-open]:not([data-open="false"])) { … } }
.data-closed\:animate-out { &:where([data-state="closed"]), &:where([data-closed]:not([data-closed="false"])) { … } }
.data-checked\:...         { &:where([data-state="checked"]), &:where([data-checked]:not([data-checked="false"])) { … } }
.data-unchecked\:...        { &:where([data-state="unchecked"]), &:where([data-unchecked]:not([data-unchecked="false"])) { … } }
.data-selected\:...          { &:where([data-selected="true"]) { … } }
.data-disabled\:...           { &:where([data-disabled="true"]), &:where([data-disabled]:not([data-disabled="false"])) { … } }
.data-active\:...              { &:where([data-state="active"]), &:where([data-active]:not([data-active="false"])) { … } }
.data-horizontal\:...           { &:where([data-orientation="horizontal"]) { … } }
.data-vertical\:...              { &:where([data-orientation="vertical"]) { … } }
```

Any other `data-foo:` seen in the codebase (`data-inset:`, `data-empty:`, `data-highlighted:`,
`data-placeholder:`, `data-pressed:`, `data-selected:` [also matches the custom variant above],
`data-popup-open:`, `data-ending-style:`, `data-starting-style:`) is **not** a custom variant —
it's Tailwind v4's built-in bare-boolean-attribute shorthand, which compiles to `&[data-foo]`
(presence check, no value match), e.g. `data-inset:pl-7` → `&[data-inset] { padding-left: calc(var(--spacing) * 7); }`.

---

## 10. tw-animate-css

Source: `tw-animate-css@1.4.0/dist/tw-animate.css` (single minified line; pretty-printed for
this doc). Registers `@property` defaults for every `--tw-animation-*`/`--tw-enter-*`/`--tw-exit-*`
var, then a `@theme inline` block with the animation composition and keyframes, then per-utility
`@utility` rules.

### Composed `animate-in` / `animate-out`

```css
--animate-in: enter var(--tw-animation-duration, var(--tw-duration, 0.15s)) var(--tw-ease, ease)
  var(--tw-animation-delay, 0s) var(--tw-animation-iteration-count, 1)
  var(--tw-animation-direction, normal) var(--tw-animation-fill-mode, none);
--animate-out: exit var(--tw-animation-duration, var(--tw-duration, 0.15s)) var(--tw-ease, ease)
  var(--tw-animation-delay, 0s) var(--tw-animation-iteration-count, 1)
  var(--tw-animation-direction, normal) var(--tw-animation-fill-mode, none);

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0)
      scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1))
      rotate(var(--tw-enter-rotate, 0));
    filter: blur(var(--tw-enter-blur, 0));
  }
}
@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0)
      scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1))
      rotate(var(--tw-exit-rotate, 0));
    filter: blur(var(--tw-exit-blur, 0));
  }
}
```

**Default duration is `0.15s` (150ms)**, default easing `ease`, default fill-mode `none`, default
iteration-count `1`, default direction `normal` — all overridable per-utility via `--tw-duration`
/ `--tw-ease` / `duration-*` / `ease-*` classes stacked alongside `animate-in`/`animate-out`.
`.animate-in { animation: var(--animate-in); }`, `.animate-out { animation: var(--animate-out); }`.

Per-utility variable-setting rules (each just sets one `--tw-enter-*`/`--tw-exit-*` var; the
actual animation only fires because `animate-in`/`animate-out` reads them):

| Class                                           | Sets                                                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `fade-in-0`                                     | `--tw-enter-opacity: 0;` (percentage utilities use `calc(N/100)`, but `0` collapses to literal `0`) |
| `fade-out-0`                                    | `--tw-exit-opacity: 0;`                                                                             |
| `zoom-in-95`                                    | `--tw-enter-scale: .95;`                                                                            |
| `zoom-in-90`                                    | `--tw-enter-scale: .9;`                                                                             |
| `zoom-out-95`                                   | `--tw-exit-scale: .95;`                                                                             |
| `slide-in-from-top`                             | `--tw-enter-translate-y: -100%;`                                                                    |
| `slide-in-from-top-2`                           | `--tw-enter-translate-y: calc(2 * var(--spacing) * -1);` → `-0.5rem`                                |
| `slide-in-from-bottom`                          | `--tw-enter-translate-y: 100%;`                                                                     |
| `slide-in-from-bottom-2`                        | `--tw-enter-translate-y: calc(2 * var(--spacing));` → `0.5rem`                                      |
| `slide-in-from-left` / `slide-in-from-left-2`   | `--tw-enter-translate-x: -100%;` / `calc(2 * var(--spacing) * -1)` → `-0.5rem`                      |
| `slide-in-from-right` / `slide-in-from-right-2` | `--tw-enter-translate-x: 100%;` / `calc(2 * var(--spacing))` → `0.5rem`                             |
| `slide-out-to-top/bottom/left/right(-2)`        | mirror of the `slide-in-from-*` set on `--tw-exit-translate-{x,y}`                                  |

### Accordion / caret-blink (bundled in tw-animate-css's own `@theme inline`)

```css
--animate-accordion-down: accordion-down var(--tw-animation-duration, var(--tw-duration, 0.2s))
  var(--tw-ease, ease-out) …;
--animate-accordion-up: accordion-up var(--tw-animation-duration, var(--tw-duration, 0.2s))
  var(--tw-ease, ease-out) …;
--animate-collapsible-down: collapsible-down var(--tw-animation-duration, var(--tw-duration, 0.2s))
  var(--tw-ease, ease-out) …;
--animate-collapsible-up: collapsible-up var(--tw-animation-duration, var(--tw-duration, 0.2s))
  var(--tw-ease, ease-out) …;
--animate-caret-blink: caret-blink 1.25s ease-out infinite;

@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(
      --radix-accordion-content-height,
      var(
        --bits-accordion-content-height,
        var(
          --reka-accordion-content-height,
          var(--kb-accordion-content-height, var(--ngp-accordion-content-height, auto))
        )
      )
    );
  }
}
@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height, …, auto);
  }
  to {
    height: 0;
  }
}
@keyframes collapsible-down {
  from {
    height: 0;
  }
  to {
    height: var(
      --radix-collapsible-content-height,
      var(
        --bits-collapsible-content-height,
        var(--reka-collapsible-content-height, var(--kb-collapsible-content-height, auto))
      )
    );
  }
}
@keyframes collapsible-up {
  from {
    height: var(--radix-collapsible-content-height, …, auto);
  }
  to {
    height: 0;
  }
}
@keyframes caret-blink {
  0%,
  70%,
  100% {
    opacity: 1;
  }
  20%,
  50% {
    opacity: 0;
  }
}
```

**Note:** `shadcn/tailwind.css` (imported later, see §12) _also_ defines its own
`accordion-down`/`accordion-up` `@keyframes` inside a `@theme inline` block, using
`--radix-accordion-content-height` with a slightly different fallback chain
(`var(--bits-accordion-content-height, var(--reka-accordion-content-height, var(--kb-accordion-content-height, var(--ngp-accordion-content-height, auto))))`
vs. tw-animate-css's own). Because CSS `@keyframes` of the same name simply override by
cascade order, and `shadcn/tailwind.css` is imported _after_ `tw-animate-css` in `index.css`,
**shadcn's `accordion-down`/`accordion-up` keyframes win** in the compiled output. Migration
engineers reproducing accordion open/close in StyleX should use shadcn's fallback chain (see
§12) as the source of truth, not tw-animate-css's.

`animate-caret-blink` (used by the text-cursor caret component): `animation: caret-blink 1.25s ease-out infinite;` literal, opacity keyframe `0%,70%,100% { opacity: 1 } 20%,50% { opacity: 0 }`.

Composed enter/exit example actually generated for the project's `data-open:animate-in
data-open:fade-in-0 data-open:zoom-in-95` stack (three separate classes, each contributing one
declaration under the same `&:where([data-state="open"]), &:where([data-open]:not([data-open="false"]))`
selector) — in StyleX terms this collapses to one `@keyframes enter`-equivalent animation plus
three custom-property inputs (`opacity: 0`, `scale: 0.95`, translate `0`), fired via a single
`animation` shorthand of `150ms ease`.

---

## 11. Preflight and `@layer base`

### How the project's `@layer base` compiles

Source (`apps/ui/src/index.css`):

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply font-sans bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

Compiled (verified from the real build):

```css
@layer base {
  * {
    border-color: var(--border);
    outline-color: var(--ring);
    @supports (color: color-mix(in lab, red, red)) {
      outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
    }
  }
  body {
    background-color: var(--background);
    font-family: 'Geist Variable', sans-serif;
    color: var(--foreground);
  }
  html {
    font-family: 'Geist Variable', sans-serif;
  }
}
```

i.e. every element gets a `1px`-ready border color (`var(--border)`, only visible once a
`border` width utility is also applied) and a 50%-transparent ring-colored outline (only
visible once `outline-width`/`outline-style` utilities apply); `body`/`html` set the project's
Geist Variable sans stack, `body` also sets the theme background/foreground colors.

### Preflight (`tailwindcss/preflight.css`, verbatim, 393 lines)

```css
/*
  1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
  2. Remove default margins and padding
  3. Reset all borders.
*/

*,
::after,
::before,
::backdrop,
::file-selector-button {
  box-sizing: border-box; /* 1 */
  margin: 0; /* 2 */
  padding: 0; /* 2 */
  border: 0 solid; /* 3 */
}

/*
  1. Use a consistent sensible line-height in all browsers.
  2. Prevent adjustments of font size after orientation changes in iOS.
  3. Use a more readable tab size.
  4. Use the user's configured `sans` font-family by default.
  5. Use the user's configured `sans` font-feature-settings by default.
  6. Use the user's configured `sans` font-variation-settings by default.
  7. Disable tap highlights on iOS.
*/

html,
:host {
  line-height: 1.5; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
  tab-size: 4; /* 3 */
  font-family: --theme(
    --default-font-family,
    ui-sans-serif,
    system-ui,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ); /* 4 */
  font-feature-settings: --theme(--default-font-feature-settings, normal); /* 5 */
  font-variation-settings: --theme(--default-font-variation-settings, normal); /* 6 */
  -webkit-tap-highlight-color: transparent; /* 7 */
}

/*
  1. Add the correct height in Firefox.
  2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
  3. Reset the default border style to a 1px solid border.
*/

hr {
  height: 0; /* 1 */
  color: inherit; /* 2 */
  border-top-width: 1px; /* 3 */
}

/*
  Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

/*
  Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
  Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;
}

/*
  Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
  1. Use the user's configured `mono` font-family by default.
  2. Use the user's configured `mono` font-feature-settings by default.
  3. Use the user's configured `mono` font-variation-settings by default.
  4. Correct the odd `em` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: --theme(
    --default-mono-font-family,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    'Liberation Mono',
    'Courier New',
    monospace
  ); /* 1 */
  font-feature-settings: --theme(--default-mono-font-feature-settings, normal); /* 2 */
  font-variation-settings: --theme(--default-mono-font-variation-settings, normal); /* 3 */
  font-size: 1em; /* 4 */
}

/*
  Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
  Prevent `sub` and `sup` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
  1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
  2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
  3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0; /* 1 */
  border-color: inherit; /* 2 */
  border-collapse: collapse; /* 3 */
}

/*
  Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
  Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
  Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
  Make lists unstyled by default.
*/

ol,
ul,
menu {
  list-style: none;
}

/*
  1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)
  2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
      This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}

/*
  Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/*
  1. Inherit font styles in all browsers.
  2. Remove border radius in all browsers.
  3. Remove background color in all browsers.
  4. Ensure consistent opacity for disabled states in all browsers.
*/

button,
input,
select,
optgroup,
textarea,
::file-selector-button {
  font: inherit; /* 1 */
  font-feature-settings: inherit; /* 1 */
  font-variation-settings: inherit; /* 1 */
  letter-spacing: inherit; /* 1 */
  color: inherit; /* 1 */
  border-radius: 0; /* 2 */
  background-color: transparent; /* 3 */
  opacity: 1; /* 4 */
}

/*
  Restore default font weight.
*/

:where(select:is([multiple], [size])) optgroup {
  font-weight: bolder;
}

/*
  Restore indentation.
*/

:where(select:is([multiple], [size])) optgroup option {
  padding-inline-start: 20px;
}

/*
  Restore space after button.
*/

::file-selector-button {
  margin-inline-end: 4px;
}

/*
  Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
*/

::placeholder {
  opacity: 1;
}

/*
  Set the default placeholder color to a semi-transparent version of the current text color in browsers that do not
  crash when using `color-mix(…)` with `currentcolor`. (https://github.com/tailwindlabs/tailwindcss/issues/17194)
*/

@supports (not (-webkit-appearance: -apple-pay-button)) /* Not Safari */ or
  (contain-intrinsic-size: 1px) /* Safari 17+ */ {
  ::placeholder {
    color: color-mix(in oklab, currentcolor 50%, transparent);
  }
}

/*
  Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
  Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
  1. Ensure date/time inputs have the same height when empty in iOS Safari.
  2. Ensure text alignment can be changed on date/time inputs in iOS Safari.
*/

::-webkit-date-and-time-value {
  min-height: 1lh; /* 1 */
  text-align: inherit; /* 2 */
}

/*
  Prevent height from changing on date/time inputs in macOS Safari when the input is set to `display: block`.
*/

::-webkit-datetime-edit {
  display: inline-flex;
}

/*
  Remove excess padding from pseudo-elements in date/time inputs to ensure consistent height across browsers.
*/

::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

::-webkit-datetime-edit,
::-webkit-datetime-edit-year-field,
::-webkit-datetime-edit-month-field,
::-webkit-datetime-edit-day-field,
::-webkit-datetime-edit-hour-field,
::-webkit-datetime-edit-minute-field,
::-webkit-datetime-edit-second-field,
::-webkit-datetime-edit-millisecond-field,
::-webkit-datetime-edit-meridiem-field {
  padding-block: 0;
}

/*
  Center dropdown marker shown on inputs with paired `<datalist>`s in Chrome. (https://github.com/tailwindlabs/tailwindcss/issues/18499)
*/

::-webkit-calendar-picker-indicator {
  line-height: 1;
}

/*
  Remove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
  Correct the inability to style the border radius in iOS Safari.
*/

button,
input:where([type='button'], [type='reset'], [type='submit']),
::file-selector-button {
  appearance: button;
}

/*
  Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
  Make elements with the HTML hidden attribute stay hidden by default.
*/

[hidden]:where(:not([hidden='until-found'])) {
  display: none !important;
}
```

In the actual compiled build, the two `--theme(...)` calls in `html`/`code` resolve to the
project's overrides: `font-family: var(--default-font-family, ui-sans-serif, …)` where
`--default-font-family: 'Geist Variable', sans-serif;` (project override — see §3), and
`--default-mono-font-family: var(--font-mono)` (Tailwind's own default mono stack, unoverridden).

---

## 12. `@theme inline` — emitted custom properties and component usage

The project's `@theme inline` block (`apps/ui/src/index.css`) emits these custom properties
onto `:root`/`:host` (confirmed present in the real compiled `@layer theme` block):

| Property                                                                                                                                      | Value                                              | Referenced directly via `var(--…)` in components?                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--font-sans`                                                                                                                                 | `'Geist Variable', sans-serif`                     | No (only via `font-sans` utility)                                                                      |
| `--font-serif`                                                                                                                                | `'MedievalSharp', serif`                           | No (only via `font-serif` utility)                                                                     |
| `--color-background`                                                                                                                          | `var(--background)`                                | Yes — `--background`                                                                                   |
| `--color-foreground`                                                                                                                          | `var(--foreground)`                                | Yes — `--foreground`                                                                                   |
| `--color-card` / `--color-card-foreground`                                                                                                    | `var(--card)` / `var(--card-foreground)`           | Yes — `--card`, `--card-foreground`                                                                    |
| `--color-popover` / `--color-popover-foreground`                                                                                              | `var(--popover)` / `var(--popover-foreground)`     | Yes — `--popover`, `--popover-foreground`                                                              |
| `--color-primary` / `--color-primary-foreground`                                                                                              | `var(--primary)` / `var(--primary-foreground)`     | Yes — `--primary`, `--primary-foreground`                                                              |
| `--color-secondary` / `--color-secondary-foreground`                                                                                          | `var(--secondary)` / `var(--secondary-foreground)` | Yes — `--secondary`, `--secondary-foreground`                                                          |
| `--color-muted` / `--color-muted-foreground`                                                                                                  | `var(--muted)` / `var(--muted-foreground)`         | Yes — `--muted`, `--muted-foreground`                                                                  |
| `--color-accent` / `--color-accent-foreground`                                                                                                | `var(--accent)` / `var(--accent-foreground)`       | Yes — `--accent`, `--accent-foreground`                                                                |
| `--color-destructive`                                                                                                                         | `var(--destructive)`                               | Yes — `--destructive`                                                                                  |
| `--color-border`                                                                                                                              | `var(--border)`                                    | Yes — `--border`                                                                                       |
| `--color-input`                                                                                                                               | `var(--input)`                                     | Yes — `--input`                                                                                        |
| `--color-ring`                                                                                                                                | `var(--ring)`                                      | Yes — `--ring`                                                                                         |
| `--color-chart-1..5`                                                                                                                          | `var(--chart-1..5)`                                | Yes — `--chart-1` .. `--chart-5`                                                                       |
| `--color-sidebar*` (7 vars: `sidebar`, `-foreground`, `-primary`, `-primary-foreground`, `-accent`, `-accent-foreground`, `-border`, `-ring`) | `var(--sidebar*)`                                  | Yes — all 8 `--sidebar*` vars appear directly in component `style`/inline usage                        |
| `--color-toaster-background`                                                                                                                  | `var(--toaster-background)`                        | No direct `var(--…)` reference found; only used via a `bg-toaster-background`-style utility if present |
| `--radius-sm`                                                                                                                                 | `calc(var(--radius) - 4px)`                        | No direct reference (only via `rounded-sm`)                                                            |
| `--radius-md`                                                                                                                                 | `calc(var(--radius) - 2px)`                        | Yes — `--radius-md` (used directly, e.g. `rounded-[min(var(--radius-md),10px)]`)                       |
| `--radius-lg`                                                                                                                                 | `var(--radius)`                                    | No direct reference                                                                                    |
| `--radius-xl`                                                                                                                                 | `calc(var(--radius) + 4px)`                        | No direct reference                                                                                    |
| `--radius-2xl`                                                                                                                                | `calc(var(--radius) + 8px)`                        | No direct reference                                                                                    |
| `--radius-3xl`                                                                                                                                | `calc(var(--radius) + 12px)`                       | No direct reference                                                                                    |
| `--radius-4xl`                                                                                                                                | `calc(var(--radius) + 16px)`                       | No direct reference                                                                                    |

A grep of `var(--…)` across `apps/ui/src` also turns up `--radius` (bare, referenced directly —
the raw un-suffixed token, not one of the `@theme inline` calc'd steps), and three
**component-local** custom properties that are _not_ part of `@theme inline` at all —
`--sidebar-width`, `--sidebar-width-icon` (both set inline by `apps/ui/src/components/ui/sidebar.tsx`,
not in `index.css`), `--anchor-width`, `--available-height`, and `--skeleton-width` (set inline
by their respective components). These need to be modeled as component-scoped StyleX
dynamic-style inputs, not global theme tokens.

---

## Unresolved / flagged tokens

Everything else in the ~620-token Tailwind-shaped set compiled to real CSS via the ground-truth
build and is covered by the tables above (or follows the same `calc(var(--spacing) * N)` /
`color-mix` / composition patterns already documented). Two tokens found in real `className`
strings do **not** compile to any CSS under the project's current Tailwind v4 setup — these are
authoring bugs in the existing codebase, not missing documentation, and should be fixed (not
"translated") during the StyleX migration:

- **`text-md`** (`apps/ui/src/components/ui/toaster.tsx:10`) — there is no `--text-md` token in
  Tailwind v4's default theme or the project's `@theme inline`; likely meant `text-base` or
  `text-sm`.
- **`origin-top-center`** (`apps/ui/src/components/ui/navigation-menu.tsx:107`) — not one of
  Tailwind's nine standard `transform-origin` keywords (`center`, `top`, `top-right`, `right`,
  `bottom-right`, `bottom`, `bottom-left`, `left`, `top-left`); likely meant `origin-top`.

All other tokens the raw tokeniser flagged as "unresolved" (`accordion-item`, `select-content`,
`icon-lg`, `block-start`, `table-header`, bare words like `top`, `left`, `size`, `content`,
etc.) are false positives of the naive string-literal tokeniser — they are cva variant keys,
Radix/Base UI `data-slot` attribute values, or plain English/JS identifiers picked up from the
same string literals as real utility classes, not Tailwind utilities themselves.
