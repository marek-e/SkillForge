import * as stylex from '@stylexjs/stylex'

/**
 * The project's design tokens, as StyleX handles (PR 02).
 *
 * The file name ends in `.stylex.ts` because `defineVars`/`defineConsts` may
 * only live in such a file: the compiler resolves them through the import path
 * at build time, so every consumer must import from here, never re-export.
 *
 * Two mechanisms, chosen per group:
 *
 * - `defineVars` for the colour palette. StyleX cannot express the `.dark`
 *   override itself (a `':where(.dark)'` key compiles to invalid nested CSS),
 *   so the real switch stays where it already is: the `:root { … }` / `.dark { … }`
 *   blocks in `src/styles/global.css`, flipped by `next-themes` on `<html>`.
 *   These vars only *alias* those custom properties, which keeps one indirection
 *   and zero duplicated colour literals.
 * - `defineConsts` for values that are pure literals (radii, font stacks,
 *   motion). The compiler inlines a const at every use site, so nothing extra
 *   is emitted into the stylesheet and the declaration is byte-identical to
 *   what Tailwind produces today.
 *
 * Every literal below is the exact value Tailwind emits in this project; see
 * `docs/stylex-migration/tailwind-values.md` §4, §5, §8 and §12.
 */

/**
 * Colour palette. Each entry aliases the custom property declared in
 * `src/styles/global.css`, so a value automatically follows the `.dark` class.
 */
export const colors = stylex.defineVars({
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',
  destructive: 'var(--destructive)',
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
  sidebar: 'var(--sidebar)',
  sidebarForeground: 'var(--sidebar-foreground)',
  sidebarPrimary: 'var(--sidebar-primary)',
  sidebarPrimaryForeground: 'var(--sidebar-primary-foreground)',
  sidebarAccent: 'var(--sidebar-accent)',
  sidebarAccentForeground: 'var(--sidebar-accent-foreground)',
  sidebarBorder: 'var(--sidebar-border)',
  sidebarRing: 'var(--sidebar-ring)',
  toasterBackground: 'var(--toaster-background)',
})

/**
 * Radius scale. `base` is the raw `--radius` token; the named steps are the
 * `calc()` expressions the `@theme inline` block in `src/index.css` feeds to
 * Tailwind's `rounded-*` utilities, copied character for character.
 *
 * An `xs` step is deliberately absent: the project's `@theme inline` does not
 * override Tailwind's extra-small radius, so the two styles that want it keep
 * the `0.125rem` literal locally. (Spelling the utility name out here would be
 * enough for Tailwind's source scanner to start emitting it.)
 */
export const radius = stylex.defineConsts({
  base: 'var(--radius)',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  '3xl': 'calc(var(--radius) + 12px)',
  '4xl': 'calc(var(--radius) + 16px)',
})

/**
 * Font stacks. `sans` and `serif` are the project's `@theme inline` overrides
 * (and what `@layer base` applies to `html`/`body`); `mono` is Tailwind's
 * default `--font-mono`, which the project does not override.
 */
export const fonts = stylex.defineConsts({
  sans: "'Geist Variable', sans-serif",
  serif: "'MedievalSharp', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
})

/**
 * Tailwind's transition defaults (`--default-transition-duration` and
 * `--default-transition-timing-function`), which every bare `transition*`
 * utility in the codebase resolves to.
 */
export const motion = stylex.defineConsts({
  duration: '150ms',
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
})
