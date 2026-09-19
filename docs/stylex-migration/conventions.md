# StyleX migration conventions

Shared rules for every migration PR. Read `docs/stylex-migration-plan.md` first; this file
records the decisions taken so each PR does not re-derive them. Findings below were verified
against `@stylexjs/babel-plugin` / `@stylexjs/unplugin` 0.19.1.

## Toolchain

_Wired up and verified in [PR 01](pr-01.md)._

- `@stylexjs/stylex` + `@stylexjs/unplugin` registered **before** `react()` in
  `apps/ui/vite.config.ts` as
  `stylex.vite({ useCSSLayers: { before: ['theme', 'base'], after: ['components', 'utilities'] } })`.
  The object form (rather than `useCSSLayers: true`) makes StyleX repeat the whole layer order in
  its own output, so the cascade is the same whether the browser parses the StyleX CSS before or
  after `index.css`. In dev it parses it **before**, because the adapter injects its `<link>` into
  the HTML shell while `index.css` only arrives from JS.
- In production the unplugin appends StyleX CSS to the existing CSS asset (after `index.css`), and
  the build still emits exactly one CSS asset. In dev the adapter's own `transformIndexHtml` hook
  injects `<link rel="stylesheet" href="/virtual:stylex.css">` and
  `<script type="module" src="/@id/virtual:stylex:runtime">`; both are same-origin, so the app's CSP
  covers them and neither `index.html` nor `main.tsx` needs a dev-only shim.
- The dev runtime refetches `/virtual:stylex.css` on **every** watched file change (the plugin's
  `handleHotUpdate` is unconditional). Anything that writes inside the Vite root while a page is
  open therefore keeps the network busy forever — which is why `server.watch.ignored` excludes the
  Playwright artifact directories. Add new tooling output to that list rather than to the root.
- `useCSSLayers` makes StyleX emit `@layer priority1 … priorityN` (N = number of distinct
  property-priority buckets, ≤ 8). `apps/ui/src/index.css` declares the layer order **before**
  any `@import`:
  `@layer theme, base, priority1, priority2, priority3, priority4, priority5, priority6, priority7, priority8, components, utilities;`
  Verified order in dev and in the production bundle:
  `properties → theme → base → priority1…priority8 → components → utilities`.
  Effect during coexistence: StyleX beats Tailwind preflight (`base`) and the `@layer base` rules in
  `index.css`, but loses to Tailwind utilities, which reproduces today's "caller `className` wins"
  (`twMerge`) behaviour. Unlayered global rules (`.drag`, the `.electron-app` offsets) still beat
  everything; they are migrated in PR 02.
- StyleX CSS is collected **at transform time**, not from the final module graph: rules from a
  module the bundler later tree-shakes still ship in the CSS asset. `visual:check-gallery` only
  proves that gallery _code_ is absent from the bundle, never that its CSS is.
- `lightningcss` inside the unplugin takes its targets from browserslist, which currently falls back
  to the defaults. Watch for `light-dark()` lowering (the unplugin README documents how it breaks
  silently) and pin `lightningcssOptions.targets` if a migrated component needs it.
- Never reference Tailwind-generated custom properties from StyleX (`--tw-*`, `--spacing`,
  `--text-*`, `--color-*`, `--radius-sm|md|lg|xl|2xl…`, `--font-*`, `--default-*`, `--ease-*`,
  `--animate-*`, `--shadow-*`, `--leading-*`, `--tracking-*`). They disappear in PR 32. Only the
  project's own tokens (`--background` … `--toaster-background`, `--radius`) and StyleX vars
  from `src/styles/tokens.stylex.ts` are allowed.

## Tokens (`src/styles/tokens.stylex.ts`, PR 02)

- `stylex.defineVars` **cannot** express `.dark` overrides (`':where(.dark)'` keys compile to
  invalid nested CSS). Therefore the `:root { … }` and `.dark { … }` token blocks stay in the
  minimal global stylesheet, and StyleX vars alias them:
  `colors.background = 'var(--background)'`, etc. `.dark` switching by `next-themes` is untouched.
- Derived values that Tailwind currently generates from `@theme inline` are defined as StyleX
  vars/consts with literal values: `radius.lg = 'var(--radius)'`, `radius.md = 'calc(var(--radius) - 2px)'`,
  `radius.sm = 'calc(var(--radius) - 4px)'`, `radius.xl = 'calc(var(--radius) + 4px)'`,
  `font.sans = "'Geist Variable', sans-serif"`, `font.serif = "'MedievalSharp', serif"`.
- Tailwind default scale values are written literally in styles (e.g. `0.875rem`, `150ms`,
  `cubic-bezier(0.4, 0, 0.2, 1)`); take them from `node_modules/tailwindcss/theme.css` and
  `node_modules/tw-animate-css` — never from memory.

## Selector mapping (all verified to compile)

| Tailwind                                   | StyleX key inside a property value object                                                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hover:x`                                  | `'@media (hover: hover)': { ':hover': … }` (Tailwind v4 wraps hover in this media query)                                                                         |
| `focus-visible:` / `disabled:` / `active:` | `':focus-visible'`, `':disabled'`, `':active'`                                                                                                                   |
| `dark:x`                                   | `':is(.dark *)'` (same shape/specificity as `@custom-variant dark (&:is(.dark *))`)                                                                              |
| `data-[state=open]:x`                      | `'[data-state="open"]'`                                                                                                                                          |
| `aria-invalid:x` / `aria-expanded:x`       | `':is([aria-invalid="true"])'` / `':is([aria-expanded="true"])'`                                                                                                 |
| `has-data-[icon=inline-end]:x`             | `':has([data-icon="inline-end"])'`                                                                                                                               |
| `has-[>svg]:x`                             | `':has(>svg)'`                                                                                                                                                   |
| `in-data-[slot=button-group]:x`            | `':is([data-slot="button-group"] *)'`                                                                                                                            |
| `group-data-[x=y]/name:`                   | `':is(.group\\/name[data-x="y"] *)'` while the group class exists; switch to `[data-slot=…]` when the group owner migrates                                       |
| `peer-*:`                                  | `':is(.peer:checked ~ *)'` etc. (`:is()` accepts complex selectors)                                                                                              |
| `[&_svg]:x` (descendant)                   | `':is(*) svg'` → compiles to `.cls:is(*) svg { … }`                                                                                                              |
| `[&>svg]:x` (child)                        | `':is(*)>svg'`                                                                                                                                                   |
| `[&_svg:not([class*='size-'])]:size-4`     | `':is(*) svg:not([class*="size-"])'`                                                                                                                             |
| `*:x`                                      | `':is(*)>*'`                                                                                                                                                     |
| `sm:` `md:` `lg:`                          | `'@media (width >= 40rem)'`, `'@media (width >= 48rem)'`, `'@media (width >= 64rem)'`                                                                            |
| `motion-reduce:`                           | `'@media (prefers-reduced-motion: reduce)'`                                                                                                                      |
| `bg-primary/80`                            | `color-mix(in oklab, var(--primary) 80%, transparent)`                                                                                                           |
| `ring-3 ring-ring/50`                      | `boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)'` (append existing `shadow-*` value after it, in the same order Tailwind composes them) |
| `animate-in fade-in-0 zoom-in-95` etc.     | `stylex.keyframes` + exact durations/easings copied from `tw-animate-css`                                                                                        |
| `size-4`                                   | `width: '1rem', height: '1rem'`                                                                                                                                  |

Nested conditions are allowed (`':is(.dark *)': { default: …, '@media (hover: hover)': { ':hover': … } }`);
`default` is mandatory at every level. Descendant keys are a compiler pass-through hack: keep
them minimal and comment each one with the original Tailwind class.

## Component pattern (className bridge during coexistence)

```tsx
import * as stylex from '@stylexjs/stylex'
import { cn } from '@/lib/utils'

const styles = stylex.create({ base: { … }, default: { … }, outline: { … } })

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, style, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button'
    const sx = stylex.props(styles.base, variantStyles[variant], sizeStyles[size])
    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        {...props}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
      />
    )
  }
)
```

- Keep variant and size names, `data-*`/ARIA attributes, refs, `asChild`, prop order and
  defaults exactly as before. Do not add or remove DOM nodes.
- Keep `className?: string` in the props during coexistence; add an optional `sx` prop only when a
  StyleX caller needs to override (pass it as the last argument to `stylex.props`). Type it as
  `stylex.StyleXArray<(null | undefined | stylex.CompiledStyles) | boolean | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>>`,
  which is exactly what `stylex.props` accepts. `stylex.StyleXStyles` is too narrow: a style object
  whose only declarations sit behind an attribute selector compiles to
  `StyleXClassNameFor<'prop', unknown>` and fails to assign, and dynamic styles are tuples.
  Drop the `className` bridge only in the PR that migrates the last Tailwind caller of that component.
- Keep exported `cva` helpers (e.g. `buttonVariants`) untouched until every call site has moved;
  list the remaining callers in the PR notes.
- Runtime values (widths, transforms, CSS vars) that are inline styles today stay inline styles
  (StyleX dynamic styles are fine: `stylex.create({ w: (w: string) => ({ width: w }) })`).

## Verification per PR

1. `pnpm typecheck && pnpm lint && pnpm format && pnpm knip`
2. `pnpm --filter @skillforge/ui build` (also with `VITE_VISUAL_GALLERY=true`)
3. Full visual suite in dev mode and against the production build (see `docs/visual-testing.md`).
   Zero pixel diffs against `__originals__`. Never run `visual:update` in a migration PR.
   If a computed-style JSON snapshot differs only textually while pixels match (e.g. Tailwind's
   `0 0 #0000` ring placeholders versus a literal `box-shadow`), explain the exact difference in
   the PR notes; do not silence it otherwise.
4. Live check: dev server + headless Chromium walk of every touched page/gallery section with
   console/network error capture; Electron when layout, theme, overlays or titlebar are touched.
5. Write `docs/stylex-migration/pr-XX.md` with touched files, cases, baseline commit `ee0f797`,
   Chromium build, pre-existing defects noticed (never fixed), commands and observations.
6. One commit per PR; conventional commit message; no AI attribution trailers.
