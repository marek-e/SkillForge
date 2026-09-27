# StyleX migration conventions

Shared rules for every migration PR. Read `docs/stylex-migration-plan.md` first; this file
records the decisions taken so each PR does not re-derive them. The per-row worktree protocol
lives in [`row-brief.md`](row-brief.md). Findings below were verified
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
- `useCSSLayers` makes StyleX emit `@layer priority1 … priorityN`. **N is the number of distinct
  `Math.floor(priority / 1000)` buckets the build has rules for, and the layers are named by
  position**, so N grows as new kinds of declaration appear: it was 7 through PR 04 and reached 10
  in PR 05, whose `::placeholder` and `::file-selector-button` rules are the first in the
  8000/9000 range. `apps/ui/src/index.css` declares the layer order **before** any `@import`:
  `@layer theme, base, priority1 … priority10, components, utilities;`
  Verified order in dev and in the production bundle:
  `properties → theme → base → priority1…priority10 → components → utilities`.
  A layer the plugin uses that the statement does not name is appended **after** every declared
  layer, so in the production bundle (where the StyleX CSS is parsed last) it would outrank
  `utilities`, while in dev it would land in the right place — a silent dev/production split.
  Ten is the ceiling: a priority is a property priority (≤ 4000) plus 5000 for a pseudo-element
  plus a few hundred for nested conditions, and the zero-priority bucket that holds `defineVars`
  counts as one. Check `grep -o '@layer priority[0-9]*' dist/assets/*.css` after any PR that adds
  a new kind of rule.
  Effect during coexistence: StyleX beats Tailwind preflight (`base`) and the `@layer base` rules in
  `styles/global.css`, but loses to Tailwind utilities, which reproduces today's "caller `className` wins"
  (`twMerge`) behaviour. Unlayered global rules (`.drag`, the `.electron-app` offsets) still beat
  everything; they live in `src/styles/global.css` and are migrated with the components that
  own them (`.drag`/`.no-drag` in PR 20, the `.electron-app` sidebar offsets in PR 17).
- **An unlayered third-party stylesheet outranks Tailwind and StyleX equally.** vaul injects its
  own drawer-overlay rules outside any layer, so its `0.5s`/`cubic-bezier(0.32, 0.72, 0, 1)` beat
  `animate-in` before the migration and the StyleX longhands after it — the translation is inert
  either way. Verify a library-driven element stays inert rather than assuming it (PR 11).
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
  from `src/styles/tokens.stylex.ts` are allowed. In practice: import the token module rather
  than writing `var(--…)` by hand.

## Tokens (`src/styles/tokens.stylex.ts`)

_Built and verified in [PR 02](pr-02.md)._

```ts
import { colors, fonts, motion, radius } from '@/styles/tokens.stylex'

const styles = stylex.create({
  card: {
    backgroundColor: colors.card, // -> var(--x1hc5pdo), itself var(--card)
    color: colors.cardForeground,
    borderColor: colors.border,
    borderRadius: radius.xl, // -> calc(var(--radius) + 4px), inlined
    fontFamily: fonts.sans, // -> 'Geist Variable', sans-serif, inlined
    transitionDuration: motion.duration,
  },
})
```

- Always import from `@/styles/tokens.stylex`; never re-export the groups from another module.
  The compiler resolves `defineVars`/`defineConsts` through the import path, and the file name
  must end in `.stylex.ts`. The Vite `@` alias works for the compiler only because
  `vite.config.ts` passes it `aliases: { '@/*': […] }` plus a pinned
  `unstable_moduleResolution.rootDir`; Vite's own `resolve.alias` is invisible to it.
- `colors` is a `stylex.defineVars` group of 32 entries (`background` … `toasterBackground`),
  each aliasing one project custom property. `stylex.defineVars` **cannot** express `.dark`
  overrides (`':where(.dark)'` keys compile to invalid nested CSS), so the `:root { … }` and
  `.dark { … }` blocks stay in `src/styles/global.css` and keep doing the switching. That works
  because `.dark` sits on `<html>`, which is `:root`. `next-themes` is untouched.
- `radius`, `fonts` and `motion` are `stylex.defineConsts` groups: the compiler inlines them at
  each use site and emits nothing, so the declaration is character for character what Tailwind
  produces. `radius` carries the `@theme inline` steps (`base`/`lg` = `var(--radius)`,
  `sm` = `calc(var(--radius) - 4px)`, `md` = `- 2px`, `xl` = `+ 4px`, `2xl` = `+ 8px`,
  `3xl` = `+ 12px`, `4xl` = `+ 16px`); there is no `xs`, because the project does not override
  Tailwind's `--radius-xs`. `fonts` has `sans`, `serif` and Tailwind's `mono` stack. `motion` has
  `duration: '150ms'` and `ease: 'cubic-bezier(0.4, 0, 0.2, 1)'`, Tailwind's transition defaults.
- Prefer a const over a var for anything that is already a literal. Reach for `defineVars` only
  when a runtime custom property is genuinely needed.
- Other Tailwind scale values are written literally in styles (e.g. `0.875rem`); take them from
  [`tailwind-values.md`](tailwind-values.md), `node_modules/tailwindcss/theme.css` and
  `node_modules/tw-animate-css` — never from memory.
- Tailwind's source scanner reads every text file under the Vite root (`apps/ui`), **including
  comments and the JSON snapshots the visual suite writes**. A Tailwind-shaped string such as
  `ring`, `rounded-xs` or `pr-0` in a migrated file makes it emit a utility rule that did not
  exist before, which shows up as a built-CSS diff. So does a _computed value_ that happens to be
  a utility name: PR 07's first computed-style dump tracked `display` over `thead`/`tbody`/`tfoot`,
  whose three values are the names of three display utilities, and the build grew three rules no
  element uses. Inspect the built CSS whenever a PR adds token-like strings **or a new
  computed-style snapshot**, and reword — or stop dumping — whatever leaks. Files outside
  `apps/ui` (this directory included) are not scanned.
- **One shape cannot be reworded away: a CSS _keyword_ the migration has to emit that is also a
  utility name.** PR 09's accordion animation is `ease-out`, and Chrome does not serialise the
  equivalent `cubic-bezier()` back to the keyword (measured), so both the component and the JSON
  snapshot of its computed value must contain the literal string. The build gains an `.ease-out`
  rule no element renders **and** an `--ease-out` entry in the `:root` token block. Accept it,
  measure that it changes no pixel, and say so in the PR notes — the alternative is either losing
  the value or losing the coverage.
- **Keep every surviving Tailwind class in a named `const`.** The scanner reads comments as well
  as code, so a comment merely naming `text-sm` for a class the migration just removed re-emits
  the utility anyway (PR 10).
- **A comment may only name the utility the source actually had, variant prefix included.** A
  _bare_ utility named in a comment for a class the file only ever used behind a variant prefix
  emits a rule that never existed. Copy the full original class into the comment, never a
  paraphrase of it (PR 11).
- **A comment may not name a `--*` theme variable either.** Writing `--animate-in` while
  explaining an `animation` shorthand added two lines to the built `@theme` block; reword around
  it instead (PR 13).

## Selector mapping (all verified to compile)

| Tailwind                                   | StyleX key inside a property value object                                                                                                                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hover:x`                                  | `'@media (hover: hover)': { default: null, ':hover': … }` — see "`hover:` **is** wrapped" below                                                                                                                                          |
| `[a]:hover:x` (arbitrary variant)          | `':is(a)'` inside the same media query; `[a]:` compiles to `&:is(a)`                                                                                                                                                                     |
| `[&>a:hover]:x` (arbitrary **selector**)   | `':is(*)>a:hover'` — no media query; the wrapper comes from the `hover:` _variant_, not from the `:hover` pseudo-class                                                                                                                   |
| `focus-visible:` / `disabled:` / `active:` | `':focus-visible'`, `':disabled'`, `':active'`                                                                                                                                                                                           |
| `dark:x`                                   | `':is(.dark *)'` (same shape/specificity as `@custom-variant dark (&:is(.dark *))`)                                                                                                                                                      |
| `data-[state=open]:x`                      | `'[data-state="open"]'`                                                                                                                                                                                                                  |
| `data-open:x` / `data-closed:x`            | `':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'` — `switch.tsx`/`checkbox.tsx` (PR 06) instead use the un-`:where()`'d `':is([data-state="checked"], …)'`, one specificity class higher (PR 11, PR 12) |
| `aria-invalid:x` / `aria-expanded:x`       | `':is([aria-invalid="true"])'` / `':is([aria-expanded="true"])'`                                                                                                                                                                         |
| `has-data-[icon=inline-end]:x`             | `':has([data-icon="inline-end"])'`                                                                                                                                                                                                       |
| `has-[>svg]:x`                             | `':has(>svg)'`                                                                                                                                                                                                                           |
| `in-data-[slot=button-group]:x`            | `':is([data-slot="button-group"] *)'`                                                                                                                                                                                                    |
| `group-data-[x=y]/name:`                   | `':is(.group\\/name[data-x="y"] *)'` while the group class exists; switch to `[data-slot=…]` when the group owner migrates                                                                                                               |
| `peer-*:`                                  | `':is(.peer:checked ~ *)'` etc. (`:is()` accepts complex selectors)                                                                                                                                                                      |
| `[&_svg]:x` (descendant)                   | `':is(*) svg'` → compiles to `.cls:is(*) svg { … }`                                                                                                                                                                                      |
| `[&>svg]:x` (child)                        | `':is(*)>svg'`                                                                                                                                                                                                                           |
| `[&_svg:not([class*='size-'])]:size-4`     | `':is(*) svg:not([class*="size-"])'`                                                                                                                                                                                                     |
| `*:x`                                      | `':is(*)>*'`                                                                                                                                                                                                                             |
| `sm:` `md:` `lg:`                          | `'@media (width >= 40rem)'`, `'@media (width >= 48rem)'`, `'@media (width >= 64rem)'`                                                                                                                                                    |
| `motion-reduce:`                           | `'@media (prefers-reduced-motion: reduce)'`                                                                                                                                                                                              |
| `bg-primary/80`                            | `color-mix(in oklab, var(--primary) 80%, transparent)`                                                                                                                                                                                   |
| `ring-3 ring-ring/50`                      | `boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)'` (append existing `shadow-*` value after it, in the same order Tailwind composes them)                                                                         |
| `animate-in fade-in-0 zoom-in-95` etc.     | `stylex.keyframes` + exact durations/easings copied from `tw-animate-css`                                                                                                                                                                |
| `size-4`                                   | `width: '1rem', height: '1rem'`                                                                                                                                                                                                          |
| `placeholder:x`                            | `'::placeholder'` (a top-level key in the style object)                                                                                                                                                                                  |
| `file:x`                                   | `'::file-selector-button'` — compiles, and lands in the 8000/9000 priority range (see below)                                                                                                                                             |
| `last:x` / `nth-last-2:x`                  | `':last-child'` / `':nth-last-child(2)'`                                                                                                                                                                                                 |
| `[[data-variant=legend]+&]:x`              | `':is([data-variant="legend"]+*)'` — a preceding-sibling prefix has to go inside `:is()`, because a StyleX key is appended to the class                                                                                                  |
| `[.border-b]:x`                            | `':is(.border-b)'`                                                                                                                                                                                                                       |
| `has-disabled:x`                           | `':has(:disabled)'`                                                                                                                                                                                                                      |
| `has-data-checked:x`                       | `':has(:where([data-state="checked"]), :where([data-checked]:not([data-checked="false"])))'` — a `shadcn/tailwind.css` custom variant; read it off the built CSS                                                                         |
| `*:data-[slot=x]:y`                        | `':is(*)>[data-slot="x"]'`                                                                                                                                                                                                               |
| `has-[>[data-align=x]]:[&>input]:y`        | `':has(>[data-align="x"])>input'`                                                                                                                                                                                                        |
| `group-has-data-horizontal/field:x`        | `':is(.group\\/field:has([data-orientation="horizontal"]) *)'`                                                                                                                                                                           |
| `@container/name`                          | `containerType: 'inline-size', containerName: 'name'`                                                                                                                                                                                    |
| `@md/name:x`                               | `'@container name (min-width: 28rem)'` — compiles; worth +300 priority and a doubled class selector                                                                                                                                      |
| `[&>tr]:last:x`                            | `':is(*)>tr:last-child'` — the `last:` variant applies first, then the arbitrary selector                                                                                                                                                |
| `data-horizontal:` / `data-vertical:`      | `':is([data-orientation="horizontal"])'` / `':is([data-orientation="vertical"])'` — `shadcn/tailwind.css` custom variants (`&:where(…)`)                                                                                                 |
| `data-active:x`                            | `':is([data-state="active"])'` — the same custom-variant family; Radix never writes the `data-active` arm                                                                                                                                |
| `not-last:x`                               | `':not(:last-child)'`                                                                                                                                                                                                                    |
| `aria-[orientation=vertical]:x`            | `':is([aria-orientation="vertical"])'` — an arbitrary variant, so a plain attribute selector on the element itself                                                                                                                       |
| `**:data-[slot=x]:y`                       | `':is(*) [data-slot="x"]'`, or the declaration moved onto the element when the file renders it                                                                                                                                           |
| `[&[attr]>div]:x`                          | `':is([attr])>div'` on the parent                                                                                                                                                                                                        |
| `after:x` / `before:x`                     | a `'::after'` / `'::before'` **top-level key**, with `content: '""'` — see "`after:` always writes `content`" below                                                                                                                      |

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
- A caller can overwrite `data-slot`: a component that spreads `...props` after setting its own
  `data-slot` has no fixed hook once a caller passes its own — `sidebar.tsx` passes
  `data-slot="sidebar"` after `SheetContent` set `data-slot="sheet-content"`, so the mobile sheet
  matches none of the selectors written against the other slot (PR 11).

## Value traps

_Found in [PR 03](pr-03.md)._

### Paired line-heights: never write the ratio

`@stylexjs/unplugin` runs every rule it emits through `lightningcss.transform`, which parses
numbers as `f32` and **serialises them to five decimal places**, folding `calc()` on the way.
That happens with or without `lightningcssOptions`, and a longer literal is rounded just the
same:

| authored in `stylex.create` | emitted CSS |
| --------------------------- | ----------- |
| `'calc(2.5 / 2.25)'`        | `1.11111`   |
| `'1.1111111111111112'`      | `1.11111`   |
| `'2.5rem'`                  | `2.5rem`    |

Tailwind never hits this, because its ratio lives inside a custom property
(`--text-4xl--line-height: calc(2.5 / 2.25)`) that nothing folds, and the browser does the
division itself at full precision. So `text-4xl` computes to exactly `40px` while a StyleX
`1.11111` computes to `39.99996px` — a visible one-pixel box difference and a different
`line-height` string in the computed-style snapshots.

**Rule:** write a Tailwind paired line-height as the length it resolves to
(`text-4xl` → `fontSize: '2.25rem', lineHeight: '2.5rem'`), which is exact and is the number
the pair was derived from. Keep a _standalone_ `leading-*` exactly as Tailwind has it —
`leading-7` is already `1.75rem` and `leading-none` is already a whole `1`.

The one behaviour this gives up is inheritance: a unitless line-height passes the ratio down to
a descendant with a different font size, a length passes the length.

_PR 05 hit it._ `InputGroupAddon` is `text-sm` and both filter bars put a `<kbd class="text-[10px]">`
inside it. `text-[10px]` compiles to `font-size: 10px; line-height: var(--tw-leading)` with no
fallback, so the kbd's own line height is invalid at computed-value time and it **inherits**:
`calc(1.25 / 0.875)` resolves against its 10px to 14.2857px, while `1.25rem` passes down 20px and
grows the addon by six pixels. Writing the ratio instead is not a way out either, because
lightningcss folds it to five decimals and moves the addon's _own_ line box off 20px.

**So the rule has an exception:** if the element has (or a caller can give it) a descendant with a
different font size and no line height of its own, the paired `text-*` **stays a Tailwind class**.
Check the call sites before converting a `text-*` on a container.

**Exception to the exception:** `text-base`'s ratio is `calc(1.5 / 1)`, which folds to exactly
`1.5` — the five-decimal rounding the length rule exists to avoid cannot happen there, so
`text-base` is the one paired line-height allowed to stay a ratio and keep its inheritable
behaviour (PR 11).

**A third shape of the descendant exception:** not a descendant the component renders itself, but
a whole other component a caller drops inside it. `calendar.tsx`'s `text-[0.8rem]` weekday cells
inherit their line height from the `PopoverContent` a caller puts them in — check what a
component's callers render _inside_ it, not only what it renders itself (PR 12).

_PR 09 hit it four times_ — `TabsTrigger`, `TabsContent`, `AccordionTrigger` and the accordion
body — and its **first probe missed it**. A `Button size="sm"` inside those containers inherits the
line height and changes nothing a screenshot can see, because a button has a fixed height. The
probe has to sit where the inherited line box actually **sizes a box**: a ten-pixel span in a
vertical tab trigger (content-sized) moved it from `20.2812px` to `26px`, and the same span in an
accordion trigger from `38px` to `42px`. Write the probe case that way before concluding that a
container's `text-*` is safe to convert.

### `py-*`/`px-*` are logical, `pt-*`/`pr-*`/`pb-*`/`pl-*` are physical

_Found in [PR 07](pr-07.md)._

`py-4` compiles to `padding-block`, `px-4` to `padding-inline`, `my-2` to `margin-block` — logical
properties. The single-side utilities compile to the physical longhands. Blink resolves a physical
longhand **over** the logical property that maps to it whatever the source order, so a `pt-0`
emitted _before_ a `py-3` of the same specificity still wins.

Reading the two offsets out of the built CSS and picking a winner is therefore wrong. **Keep
Tailwind's own choice of property**: write `paddingBlock`/`paddingInline`/`marginBlock` where
Tailwind does and the physical longhand where Tailwind does, and the same resolution happens for
the same reason. StyleX emits both forms unchanged.

The corollary: converting a `px-*` to `paddingLeft`/`paddingRight` also makes the component's own
rule beat a caller's `px-*` utility, which the cascade layer would otherwise let win. Same trap,
seen from the caller's side.

The same split applies to negative margins: `-mx-4` compiles to `margin-inline` and `-mb-4` to
`margin-bottom` — keep Tailwind's own choice per utility here too, and give a wrapped child's box
adjustment to the component's `sx` prop rather than a second class list (PR 10).

### `twMerge` used to delete the base declaration; StyleX only overrides it

`cn(base, callerClassName)` removes the conflicting base class outright, so a caller class that
is _partially_ invalid removes the base value with it. A StyleX base style survives and is
merely overridden, so the two diverge whenever the caller's declaration is
"invalid at computed-value time".

The live example is `text-[10px]`, which compiles to
`font-size: 10px; line-height: var(--tw-leading)` — and `--tw-leading` has no initial value, so
that second declaration is invalid and the property falls back to _inherit_, not to the StyleX
value it beat. Before the migration `twMerge` had already deleted `text-4xl`, so the outcome was
the same by accident. Watch for it whenever a caller passes an arbitrary-value utility.

### Variant utilities lose their specificity advantage

`first:mt-0` compiles to `.first\:mt-0:first-child` and
`[&:not(:first-child)]:mt-6` to `.…:not(:first-child)` — both (0,2,0) **inside
`@layer utilities`**, so they beat a caller's plain `.mt-6` (0,1,0) in the same layer. Once
migrated they are ordinary StyleX rules in a `priorityN` layer, and layer order outranks
specificity, so _any_ caller utility now wins. No caller passes a margin utility to the
typography components today, which is why this is a note and not a blocker, but check the call
sites before migrating a component whose own variant utility contests a property callers
override.

### `hover:` **is** wrapped in `@media (hover: hover)`

_PR 04 claimed the opposite and changed this section and
[`tailwind-values.md`](tailwind-values.md) §9 to match. Both are corrected back in
[PR 06](pr-06.md)._

The shipped CSS asset contains **nine** `@media (hover: hover)` blocks, and every one of the 31
`hover:` utilities in the bundle sits inside one — `hover:bg-muted`, `hover:bg-primary/80`,
`hover:underline`, `hover:ring-3`, `dark:hover:bg-blue-500/25` and `[a]:hover:bg-destructive/20`
included. Count the occurrences, not the lines: the asset is minified onto one line, so
`grep -c` reports `1` however many blocks there are, which is how the earlier measurement went
wrong.

```ts
backgroundColor: {
  default: colors.background,
  '@media (hover: hover)': { default: null, ':hover': colors.muted },
},
```

The one shape that really is bare is a `:hover` written inside an **arbitrary** selector, such as
`[&>a:hover]:text-primary`, which Tailwind emits as `.x>a:hover` with no wrapper.

PR 01's canary was right all along. PR 04's `button.tsx`, `badge.tsx`, `toggle.tsx` and
`display-view-switch.tsx` were not; **all 25 of their hover rules were wrapped in the correction
commit that opens [PR 09](pr-09.md)**, including the eight `[a]:hover:` ones in `badge.tsx`.

**A no-hover pointer is what catches it, and it is not a media emulation.** Chromium reports
`hover: hover` in both viewport projects, and `Emulation.setEmulatedMedia` does _not_ help:
Blink's media-feature overrides have no `hover` entry, so the call is accepted and silently
ignored. What moves it is touch emulation — `Emulation.setTouchEmulationEnabled` makes
`DevToolsEmulator` set the primary hover type to none and the primary pointer type to coarse,
while the mouse keeps working, so `locator.hover()` still matches `:hover`. That is
`emulateNoHover` in `visual/helpers.ts`, and `visual/hover-media.spec.ts` captures five hover
targets through it against originals taken from the frozen tree. The bare rules failed it by
2106 pixels.

**The wrapper also changes the rule's priority**, from 2130 to 2330 in the table below, so it has
to be added at _every_ level of a nested condition at once. A `':is(.dark *)'` branch whose
`':hover'` stays bare drops from 2170 to below the plain hover's new 2330 and stops winning.

### Utility source order decides a same-specificity tie

Several of a component's states are written by different variants of equal specificity
(`.x:hover`, `.x[aria-expanded="true"]`, `.x:focus-visible`, `.x[aria-invalid="true"]`, all
(0,2,0)). Tailwind resolves those by **emission order inside `@layer utilities`**, which is fixed
and can be read off the built CSS. Measured for this project, later wins:

`hover:` → `aria-expanded:` → `focus-visible:` → `aria-invalid:` → every `dark:*` (emitted last)

StyleX gives its own priority per condition. Measured with the compiler, for a property whose
base priority is 2000:

| Key                                                   | Priority |
| ----------------------------------------------------- | -------- |
| `default`                                             | 2000     |
| `':is(…)'` — including every `data-*` mapping         | 2040     |
| `':focus-visible'`                                    | 2040     |
| `':hover'`                                            | 2130     |
| `':active'`                                           | 2170     |
| `'@media (hover: hover)'` + `':hover'`                | 2330     |
| a bare attribute key, e.g. `'[data-state="checked"]'` | 5000     |
| each extra nesting level                              | +40      |

So `':is(…)'` and `':focus-visible'` **tie**, and a tie is not settled by the order the keys appear
in `stylex.create`: identical declarations are deduplicated across the whole app, so a rule's
position in the sheet is wherever the _first_ module that emitted that exact declaration put it.
PR 06 watched a checked, focused checkbox come out `--primary` instead of `--ring` for precisely
that reason. **Do not rely on it.** Write the combination explicitly as a nested condition, which
raises the priority and settles it:

```ts
borderColor: {
  default: 'transparent',
  ':focus-visible': colors.ring,
  ':is([aria-invalid="true"])': {
    default: colors.destructive,
    ':focus-visible': colors.destructive, // aria-invalid: beats focus-visible:
  },
},
```

Only nest where the two rules disagree. A gratuitous nested rule is itself a bug: an
`[aria-expanded]:hover` rule added "for order" also outranks `dark:hover:*`, which Tailwind lets
win — that cost PR 04 four dark-mode screenshot failures.

### `stylex.props` merges a property whole

`stylex.props(base, variant)` keeps only the **last** style object's entry for a property, with
all of its conditions. A variant that sets `borderColor` therefore drops the base's
`':focus-visible'` and `':is([aria-invalid="true"])' `borderColor rules entirely. Restate them in
every variant that touches the property, or keep the property in exactly one object.

**An `sx` prop is subject to the same rule, across files.** PR 05's `FieldLabel` passed an `sx`
that declared `opacity` for one condition and silently dropped the two `opacity` conditions
`Label` declares (`peer-disabled:`, `group-data-[disabled=true]:`), so a `FieldLabel` next to a
disabled control stopped dimming. PR 06's `checkbox-in-disabled-field` case caught it. Before
passing `sx`, read what the target component declares for the same property.

The same trap in reverse: a size that sets the element's own `height` drops a base `height` whose
only declaration was a descendant rule (`[&_svg…]:size-4`).

### Rings and shadows: write the whole composed chain

A `ring-*` or `shadow-*` utility re-declares the five-slot `box-shadow`
(`--tw-inset-shadow, --tw-inset-ring-shadow, --tw-ring-offset-shadow, --tw-ring-shadow, --tw-shadow`)
and fills the unused slots with `0 0 #0000`. Writing the no-op slots out keeps the _computed_
`box-shadow` string identical, so a computed-style snapshot needs no exception:

```ts
':focus-visible':
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000',
```

### Shadow colours, and a literal `color-mix()` gets folded

_Found in [PR 10](pr-10.md) and [PR 11](pr-11.md)._

Write a shadow colour the way Tailwind writes it: `rgb(0 0 0 / 0.1)`, never the hex-alpha form
`#0000001a`. Chromium serialises the hex alpha as `0.102` (26/255) and lightningcss does not
minify the percentage form back to hex, so the two survive into the built asset as visibly
different strings even though they compute to the same colour (PR 11).

A literal `color-mix()` is folded at build time too: `bg-black/10` written with a literal `#000`
becomes `#0000001a` / `lab(0% 0 0 / .1)`, where Tailwind's own `color-mix(in oklab, …)` reports
`oklab(0 0 0 / 0.1)`. Every pixel still matches, but a computed-style dump does not — keep a
`var()` inside the `color-mix()` whenever the computed string itself must match (PR 10).

### `outline-hidden` needs longhands, not the shorthand

_Found in [PR 12](pr-12.md)._

`outline-hidden`'s `@media (forced-colors: active)` branch is `outline: 2px solid transparent` — a
shorthand — but a StyleX condition attaches to one property at a time. Write it as four
conditional longhands instead of the shorthand. (A snapshot's `outline-width: 3px` /
`outline-color: oklab(0.708 0 0 / 0.5)` seen outside that condition comes from an unrelated global
rule, not from the component.)

### `after:` always writes `content`, and where it writes it decides whether the pseudo exists

_Found in [PR 09](pr-09.md)._

Tailwind's `before:`/`after:` variants emit `content: var(--tw-content)` in **every** rule they
generate, and `--tw-content` is registered with an initial value of `""`. So an element with any
`after:*` utility always has a generated `::after` — the tab indicator and the resize handle's hit
area both do. But an `after:*` that appears only behind another variant generates the pseudo-element
only in that state: the accordion trigger's `focus-visible:after:border-ring` brings a zero-width
flex item into a `justify-between` row while the trigger is focused, and nothing at all otherwise.
Reproduce whichever shape the file has:

```ts
'::after': {
  content: '""',                                        // always generated
  content: { default: null, ':focus-visible': '""' },   // only while focused
},
```

A pseudo-element is a **top-level key** in the style object, and conditions nest _inside_ it:
StyleX emits the pseudo-class before the pseudo-element, so `{ ':focus-visible': … }` inside
`'::after'` compiles to `.x:focus-visible::after`. Verified against `::after` computed-style dumps,
which `getComputedStyle(el, '::after')` makes snapshottable — and which return the _originating
element's_ style when the pseudo-element does not exist, so `content: none` is how a dump says "not
generated".

### `data-active:` and its family cost a specificity point

_Found in [PR 09](pr-09.md)._

The `shadcn/tailwind.css` custom variants wrap their selector in `:where()`, which contributes
nothing: `data-active:bg-background` is `.x:where([data-state="active"])`, i.e. (0,1,0), while an
ordinary `group-data-[…]:` rule next to it is (0,2,0). In `tabs.tsx` that means a trigger inside a
`line` list is transparent **whether it is active or not** — the active rule never gets a turn.
Read the specificity, not the variant name.

### Specificity is not nesting depth

_Found in [PR 10](pr-10.md) and [PR 13](pr-13.md)._

Tailwind resolves competing rules of otherwise-equal weight by selector **specificity**; StyleX
resolves them by the priority table above, which is really **nesting depth** of the condition. The
two orders coincide often enough to hide the difference, but not always:

- **`overflow` vs `overflow-y`.** Tailwind lets the longhand win when both are unconditional
  utilities, because it is emitted later; StyleX ranks the shorthand's priority _below_ the
  longhand's regardless of source order. Where the two properties compete under a condition (e.g.
  a `data-*:overflow-hidden` beside a plain `overflow-y`), write the conditional rule on the
  longhand it actually contests, not the shorthand (PR 13).
- **`dark:` nested inside an attribute key** (e.g. `data-[variant=x]:dark:y`) outranks a bare
  `dark:` on the same property, because the attribute selector's priority (5000) sits above the
  nested `:is(.dark *)` condition's (2040 + nesting) — read the priority table, not the variant
  names, to see which one wins (PR 13).

## A rule that styles a foreign element stays Tailwind

_Established in [PR 04](pr-04.md)._

Cascade layers outrank specificity unconditionally. A StyleX rule lives in a `priorityN` layer,
below `utilities`, so **any** utility class sitting on the element itself beats it — however
specific the StyleX selector is. That is fine for the component's own box (the caller's
`className` is meant to win) and wrong for every rule that reaches _out_ to an element the
component does not own, because there the component's selector used to win on specificity.

Keep those as Tailwind classes in the bridge until the element's owner is StyleX, and say in a
comment which PR removes them. Real cases from PR 04:

| Rule                                            | Foreign element it loses to                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `[&_svg:not([class*='size-'])]:size-4` (button) | `mode-toggle.tsx`'s `<Sun className="h-[1.2rem] w-[1.2rem]" />` — 16px became 19.2px |
| `[&>svg]:size-3!` (badge)                       | any caller `size-*` on the icon; the `!` exists precisely to beat it                 |
| `ButtonGroup`'s `[&>*…]:rounded-*`/`border-*`   | `Input`'s own `rounded-lg` and `border`, `SelectTrigger`'s `rounded-lg`              |
| `ButtonGroupSeparator`'s `bg-input`             | `Separator`'s own `bg-border`, which `twMerge` used to delete                        |

### A class name can itself be the contract

_Found in [PR 08](pr-08.md)._

`Button` and `EmptyMedia` size the icons inside them with
`[&_svg:not([class*='size-'])]:size-4` (or `size-3.5`). That selector does not look at the child's
computed size — it looks at the **literal text of the child's `class` attribute**. A component
that renders an icon of its own and whose classes become StyleX hashes stops matching
`[class*='size-']` and starts being resized by its container: `Spinner` went from 16px to 14px
inside a `Button` the moment its `size-4` moved into `stylex.create`.

So a size class on any component that can be rendered _inside_ one of those containers stays a
Tailwind class until the `[class*='size-']` rules themselves go (PR 32) — even when no caller
contests it. Grep for `class*=` before converting a width/height on such a component.

## A caller's utility also shadows the component's own declarations

_Generalised in [PR 05](pr-05.md); the section above is the same cause seen from the other side._

The foreign-element rule is one half of it. The other half is that `twMerge` only ever deleted a
base class with the **same variant key**, so a caller's plain utility used to coexist with the
component's conditional rules and lose to them on specificity. Once those rules are StyleX, the
caller's utility wins — it is in `utilities`, they are in `priorityN`.

Two further mechanisms have no StyleX equivalent at all:

- **A `--tw-*` variable one utility writes and another reads.** `leading-none` sets
  `--tw-leading: 1`, and a caller's `text-base` resolves its line height through
  `var(--tw-leading, …)`; `focus-visible:ring-ring/50` sets `--tw-ring-color`, which a caller's
  `ring-0` composes its ring from. A StyleX declaration writes the property, never the variable, so
  the caller's utility silently falls back to its own default.
- **A media query emitted later.** `md:text-sm` and a caller's `text-2xl` are both (0,1,0), and
  the media query is emitted after, so above 48rem the component still wins. As StyleX it loses.

**Rule:** before converting a declaration, grep the call sites for a utility that touches the same
property (or the same `--tw-*` variable). If one exists, keep the class — in one documented
constant per file, named for what it is, with the PR that removes it. `input.tsx`, `textarea.tsx`,
`label.tsx` and `input-group.tsx` each carry a `CONTESTED_CLASSES` block of that shape.

A StyleX caller overriding a StyleX component is the opposite case and needs no class: give the
component an `sx` prop (typed `Sx` from `src/lib/sx.ts`) and pass the styles as the last argument
to `stylex.props`. That is how `InputGroupButton` overrides `Button`, and how
`ButtonGroupSeparator` and `FieldSeparator` override `Separator` (PR 07). Remember that
`stylex.props` merges a property as a whole: an `sx` that sets `width` for one orientation must
restate the other, or the component's own declaration disappears with it.

## Known coexistence gaps

Cases where a caller's Tailwind class shadows a **conditional** StyleX rule that `twMerge` used to
leave alone. Each disappears when the listed PR migrates the caller; verify the restoration there.

| Caller                                                                 | Effect                                                                                                                                                                                                                                                                                 | Fixed by                                         |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `input-group.tsx`, `shadow-none` on `InputGroupButton`                 | a focused input-group button has no focus ring                                                                                                                                                                                                                                         | **closed in PR 05** (`Button` grew an `sx` prop) |
| `routes/skill-detail.tsx`, `text-muted-foreground` on a ghost `Button` | its `hover:text-foreground` no longer applies                                                                                                                                                                                                                                          | **closed in PR 05** (the class was redundant)    |
| `sidebar.tsx`, `w-auto` on `SidebarSeparator`                          | it now beats `Separator`'s `data-horizontal:w-full` instead of losing to it. No effect measured: the separator is a block-level child of the sidebar's flex column, so `auto` and `100%` compute to the same width — verified in the `sidebar-parts` section and in PR 07's live probe | PR 17                                            |

Only the `SidebarSeparator` one is open, and it changes no computed value today. PR 05 opened none of its own: every declaration a current caller would have shadowed
stayed a Tailwind class instead (see the section above), which a 440-dump before/after probe of
both themes and both viewports confirmed.

## Animations: the name is the one value that changes

_Established in [PR 08](pr-08.md)._

`stylex.keyframes` hashes its name, so a migrated `animate-*` utility keeps its frames, duration,
timing function and iteration count but **not** its `animation-name`. Leave `animation-name` out
of a computed-style snapshot and pin the curve instead: dump the animation longhands, and capture
the element at fixed timestamps with `installAnimationFreeze` + `freezeAnimationsAt`
(`animations.spec.ts` does 0/500/1000 ms for the skeleton pulse and the spinner spin).

`animation: …` is a shorthand and the StyleX version is a set of longhands, so anything the
shorthand resets (delay, direction, fill-mode, play-state) is only equal because both sides leave
it at its initial value. Snapshot those too.

An infinite animation also makes any computed-style dump non-deterministic — a `Skeleton`'s
`opacity` is wherever the compositor clock was. Freeze the page at 0 ms before collecting, in the
test and in a live probe alike.

**One `stylex.keyframes` per enter-modifier combination.** `tw-animate-css` parameterises a
single `enter` (and `exit`) keyframes block through `--tw-enter-*`/`--tw-exit-*` custom properties
that each `fade-*`/`zoom-*`/`slide-in-from-*` utility sets one of; a StyleX keyframes body is
fixed, so every reachable combination needs its own block, with the resolved
translate/scale/blur values substituted and the untouched axes/slots spelled out at their initial
value (e.g. `scale3d(1, 1, 1)`, `rotate(0)`, `blur(0)` — `filter: blur(0)` is not `filter: none`).
Put the resulting `animationName` behind a two-level condition — state (`data-open:`/
`data-closed:`) outside, `data-side` inside. Identical bodies dedupe by content hash across files
and across components, so sibling components sharing an animation cost nothing extra
(PR 10, PR 12, PR 13).

**`duration-N` sets two things.** It writes both `--tw-duration` (which the `animation` shorthand
reads) and `transition-duration` directly. A component that combines `animate-in` with a
`duration-*` utility needs both `animationDuration` **and** `transitionDuration` in StyleX; missing
one only shows up in a computed-style snapshot (PR 12).

**lightningcss rewrites `blur(0)` to `blur()`** inside a keyframes body. Both are valid — the
Filter Effects grammar is `blur( <length>? )` with a `0` default — but expect the built CSS to
differ textually from what was authored; `rotate(0)` is kept as written (PR 12).

## Gallery cases are append-only per section

`gallery.spec.ts` captures one **full-page** screenshot per section on top of the per-case
element shots. Adding a case to an existing section therefore changes that section's page
height and invalidates a frozen original, which `visual:update` (`--update-snapshots=missing`)
cannot rewrite and no migration PR may replace.

New cases for an already-covered component go in a **new sibling section** (PR 03 added
`typography-extra` next to `typography`). Register it in
`src/visual-gallery/sections/index.ts` and in `SECTIONS` in `visual/gallery.spec.ts`, capture
its originals with `visual:update` **before** touching the component, and commit those
originals in the same PR.

**Copy the migrated components to a scratch directory before capturing.** The procedure ends in
`git checkout HEAD -- apps/ui/src/components`, which restores them to `HEAD` — and `HEAD` does not
contain the row being written, so an uncommitted migration is destroyed without warning. PR 09 lost
two rounds of work to it. Restore from the copy, not from git, and only put the frozen tree in
place once the copy exists.

A new `computed-styles.spec.ts` snapshot has no such constraint: it is a new test name, so it
only ever creates new originals. Reading an existing gallery section for a new computed-style
snapshot is fine — it changes no DOM.

Capture a section's originals **after** its last case is written, not while the section is still
being edited. An element screenshot rounds its clip rect to whole pixels, so a case that moves by
half a pixel — which is what happens to every case below one whose height changed — differs from
its original by a one-pixel shift of the entire image. PR 05 had to recapture the seven interaction
states of `forms-extra` for exactly that reason. The symptom is a diff image where the whole border
lights up; the cause is upstream of the case, not in it.

Give a new gallery section and every one of its new tests one distinctive token in their names
(e.g. `menus-extra`, `floating`). It lets `-g <token>` select exactly the new tests, which the
"capture originals on the clean base first" step needs in a worktree where nothing else may be
checked out (PR 12).

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

Operational notes:

- Run `visual:check-originals` immediately after a full suite run, not later (PR 13).
- A dev server left listening on 4320 is silently reused by Playwright's `reuseExistingServer`;
  stop it before a `VISUAL_BUILD=1` (production) run, or the suite tests dev code against a
  production URL (PR 10).
- Animation-frame and `route * error` cases are load-sensitive — a 0 ms frame or a TanStack
  backoff wait can fail under machine load. Rerun the failing case in isolation; never touch an
  original to make it pass (PR 10, PR 11).
