import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'

import { colors, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { Button } from '@/components/ui/button'

/**
 * `data-open:` / `data-closed:`, the `shadcn/tailwind.css` custom variants.
 * Radix writes `data-state` on the overlay and the content, which is the half
 * of each variant reproduced here — the same choice as `dialog.tsx`.
 */
const OPEN = ':is([data-state="open"])'
const CLOSED = ':is([data-state="closed"])'

/** `sm:` and `md:` — Tailwind's 40rem and 48rem breakpoints. */
const SM = '@media (min-width: 40rem)'
const MD = '@media (min-width: 48rem)'

/** `supports-backdrop-filter:`, character for character as Tailwind writes it. */
const BACKDROP_FILTER_SUPPORTED =
  '@supports ((-webkit-backdrop-filter: var(--supported-filter)) or (backdrop-filter: var(--supported-filter)))'

/** `data-[size=default]:` / `data-[size=sm]:` — the content's own attribute. */
const SIZE_DEFAULT = ':is([data-size="default"])'
const SIZE_SM = ':is([data-size="sm"])'

/**
 * The group marker the header, footer, media and title select through, kept as
 * a literal class name (PR 10). It carries no styling of its own and could
 * become `[data-slot="alert-dialog-content"]` in PR 32.
 */
const GROUP_CONTENT = 'group/alert-dialog-content'

/**
 * `group-data-[size=…]/alert-dialog-content:` — Tailwind emits
 * `:is(:where(.group\/alert-dialog-content)[data-size=…] *)`. The `:where()`
 * only zeroes the marker's specificity, which no longer decides anything once
 * the rule is a StyleX one in a `priorityN` layer, so the same match set is
 * written without it.
 */
const IN_DEFAULT_CONTENT = ':is(.group\\/alert-dialog-content[data-size="default"] *)'
const IN_SM_CONTENT = ':is(.group\\/alert-dialog-content[data-size="sm"] *)'

/**
 * The title's condition stacks two group variants —
 * `group-data-[size=default]/…` and `group-has-data-[slot=…]/…` — which
 * Tailwind emits as two `:is(… *)` compounds on the same element. There is only
 * ever one marked ancestor, so requiring both of *it* is the same match set and
 * one key instead of two nested ones.
 */
const IN_DEFAULT_CONTENT_WITH_MEDIA =
  ':is(.group\\/alert-dialog-content[data-size="default"]:has([data-slot="alert-dialog-media"]) *)'

/** `has-data-[slot=alert-dialog-media]:` — a descendant of the header itself. */
const HAS_MEDIA = ':has([data-slot="alert-dialog-media"])'

/** The one-pixel ring, as the whole five-layer chain (`tailwind-values.md` §5, §6). */
const RING_1 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 0 #0000'

/**
 * `bg-black/10`, kept as the `color-mix()` Tailwind writes.
 *
 * The literal form `color-mix(in oklab, #000 10%, transparent)` is folded by
 * `lightningcss` at build time into an sRGB `#0000001a` plus a `lab(0% 0 0 / .1)`,
 * and Chrome then reports `lab(0 0 0 / 0.1)` where Tailwind reports
 * `oklab(0 0 0 / 0.1)`. The pixels are identical — black is black in every
 * space — but the computed string is not, and the computed-style dump is part
 * of the gate. A `var()` cannot be folded, so the mix survives to the browser
 * and resolves in the same space Tailwind's does. The fallback keeps the value
 * correct if `--color-black` stops being emitted, which happens as soon as no
 * utility names it (`sheet.tsx` and `drawer.tsx` still do).
 */
const OVERLAY_BLACK_10 = 'color-mix(in oklab, var(--overlay-black, #000) 10%, transparent)'

/** `duration-100`: the animation duration *and* a transition over every property. */
const DURATION = '0.1s'

/**
 * The four enter/exit animations, resolved per element.
 *
 * See the long note in `dialog.tsx`: `tw-animate-css` ships one variable-driven
 * `@keyframes` pair that every overlay in the project shares, and
 * `stylex.keyframes` hashes a name instead of sharing it. The values are the
 * ones the built CSS produces for these two elements.
 */
const fadeIn = stylex.keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0deg)',
    filter: 'blur(0)',
  },
})

const fadeOut = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0deg)',
    filter: 'blur(0)',
  },
})

const fadeZoomIn = stylex.keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0deg)',
    filter: 'blur(0)',
  },
})

const fadeZoomOut = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0deg)',
    filter: 'blur(0)',
  },
})

const styles = stylex.create({
  // `bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed
  //  inset-0 z-50` — the same overlay as `dialog.tsx` without `isolate`.
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: OVERLAY_BLACK_10,
    transitionDuration: DURATION,
    backdropFilter: {
      default: null,
      [BACKDROP_FILTER_SUPPORTED]: 'blur(4px)',
    },
    animationName: { default: null, [OPEN]: fadeIn, [CLOSED]: fadeOut },
    animationDuration: { default: null, [OPEN]: DURATION, [CLOSED]: DURATION },
    animationTimingFunction: { default: null, [OPEN]: 'ease', [CLOSED]: 'ease' },
    animationDelay: { default: null, [OPEN]: '0s', [CLOSED]: '0s' },
    animationIterationCount: { default: null, [OPEN]: '1', [CLOSED]: '1' },
    animationDirection: { default: null, [OPEN]: 'normal', [CLOSED]: 'normal' },
    animationFillMode: { default: null, [OPEN]: 'none', [CLOSED]: 'none' },
  },

  // `bg-background ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100
  //  data-[size=default]:max-w-xs data-[size=sm]:max-w-xs
  //  data-[size=default]:sm:max-w-sm fixed top-1/2 left-1/2 z-50 grid w-full
  //  outline-none`, plus the enter/exit pair.
  //
  // The two width steps are the `--container-xs` / `--container-sm` theme
  // variables, which stop being emitted once nothing references the utilities,
  // so the 20rem and 24rem they resolve to are written out. The two `data-size`
  // keys are mutually exclusive, so their relative order never decides
  // anything.
  content: {
    translate: '-50% -50%',
    position: 'fixed',
    top: '50%',
    left: '50%',
    zIndex: 50,
    display: 'grid',
    width: '100%',
    maxWidth: {
      default: null,
      [SIZE_SM]: '20rem',
      [SIZE_DEFAULT]: { default: '20rem', [SM]: '24rem' },
    },
    gap: '1rem',
    padding: '1rem',
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    boxShadow: RING_1,
    outlineStyle: 'none',
    transitionDuration: DURATION,
    animationName: { default: null, [OPEN]: fadeZoomIn, [CLOSED]: fadeZoomOut },
    animationDuration: { default: null, [OPEN]: DURATION, [CLOSED]: DURATION },
    animationTimingFunction: { default: null, [OPEN]: 'ease', [CLOSED]: 'ease' },
    animationDelay: { default: null, [OPEN]: '0s', [CLOSED]: '0s' },
    animationIterationCount: { default: null, [OPEN]: '1', [CLOSED]: '1' },
    animationDirection: { default: null, [OPEN]: 'normal', [CLOSED]: 'normal' },
    animationFillMode: { default: null, [OPEN]: 'none', [CLOSED]: 'none' },
  },

  // `grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center
  //  has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr]
  //  has-data-[slot=alert-dialog-media]:gap-x-4
  //  sm:group-data-[size=default]/…:place-items-start
  //  sm:group-data-[size=default]/…:text-left
  //  sm:group-data-[size=default]/…:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]`
  //
  // Three rules contest `grid-template-rows`, and in Tailwind they are ordered
  // by specificity: (0,1,0), then (0,2,0) for the `:has()` one, then (0,3,0) for
  // the one that also asks about the ancestor. StyleX orders by *nesting depth*
  // instead, so the two conditional values are nested inside the condition they
  // share rather than written as siblings — the same reason `conventions.md`
  // gives for resolving every tie by nesting.
  //
  // `place-items` and `gap` are written as their longhands, which no other rule
  // on this element contests, because StyleX expands a shorthand into exactly
  // those longhands anyway.
  header: {
    display: 'grid',
    rowGap: '0.375rem',
    columnGap: { default: '0.375rem', [HAS_MEDIA]: '1rem' },
    gridTemplateRows: {
      default: 'auto 1fr',
      [HAS_MEDIA]: {
        default: 'auto auto 1fr',
        [IN_DEFAULT_CONTENT]: { default: null, [SM]: 'auto 1fr' },
      },
    },
    alignItems: { default: 'center', [IN_DEFAULT_CONTENT]: { default: null, [SM]: 'start' } },
    justifyItems: { default: 'center', [IN_DEFAULT_CONTENT]: { default: null, [SM]: 'start' } },
    textAlign: { default: 'center', [IN_DEFAULT_CONTENT]: { default: null, [SM]: 'left' } },
  },

  // `bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse
  //  gap-2 group-data-[size=sm]/…:grid group-data-[size=sm]/…:grid-cols-2
  //  sm:flex-row sm:justify-end`
  //
  // A small alert dialog lays its two actions out as a two-column grid, at which
  // point `flex-direction` and `justify-content` stop applying — both are kept
  // anyway, because Tailwind sets them unconditionally too.
  footer: {
    display: { default: 'flex', [IN_SM_CONTENT]: 'grid' },
    gridTemplateColumns: { default: null, [IN_SM_CONTENT]: 'repeat(2, minmax(0, 1fr))' },
    flexDirection: { default: 'column-reverse', [SM]: 'row' },
    justifyContent: { default: null, [SM]: 'flex-end' },
    gap: '0.5rem',
    marginInline: '-1rem',
    marginBottom: '-1rem',
    padding: '1rem',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderBottomRightRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
  },

  // `bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md
  //  sm:group-data-[size=default]/…:row-span-2`
  media: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { default: '2.5rem', ':is(*)>svg:not([class*="size-"])': '1.5rem' },
    height: { default: '2.5rem', ':is(*)>svg:not([class*="size-"])': '1.5rem' },
    marginBottom: '0.5rem',
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    gridRow: { default: null, [IN_DEFAULT_CONTENT]: { default: null, [SM]: 'span 2 / span 2' } },
  },

  // `text-base font-medium sm:group-data-[size=default]/…:group-has-data-[slot=…]/…:col-start-2`
  //
  // `--text-base--line-height` is a bare `1.5`, not a ratio expression, so this
  // paired step is the one that *can* be converted: the literal is exact, it
  // stays unitless, and a sized descendant inherits the same number it does
  // today. (`--tw-leading` is only ever written by a `leading-*` utility, and
  // there is none here.)
  title: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 500,
    gridColumnStart: {
      default: null,
      [IN_DEFAULT_CONTENT_WITH_MEDIA]: { default: null, [SM]: 2 },
    },
  },

  // `text-muted-foreground text-balance md:text-pretty`
  description: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    textDecorationLine: { default: null, ':is(*)>a': 'underline' },
    textUnderlineOffset: { default: null, ':is(*)>a': '3px' },
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':is(*)>a:hover': colors.foreground },
    },
    textWrap: { default: 'balance', [MD]: 'pretty' },
  },
})

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay> & { sx?: Sx }) {
  const sx = stylex.props(styles.overlay, sxProp)
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  style,
  size = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: 'default' | 'sm'
  sx?: Sx
}) {
  const sx = stylex.props(styles.content, sxProp)
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={[GROUP_CONTENT, sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)
  return (
    <div
      data-slot="alert-dialog-header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.footer, sxProp)
  return (
    <div
      data-slot="alert-dialog-footer"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.media, sxProp)
  return (
    <div
      data-slot="alert-dialog-media"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title> & { sx?: Sx }) {
  const sx = stylex.props(styles.title, sxProp)
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description> & { sx?: Sx }) {
  const sx = stylex.props(styles.description, sxProp)
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/** Actions compose the shared Button styles through its existing slot. */
function AlertDialogAction({
  className,
  variant = 'default',
  size = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size' | 'sx'>) {
  return (
    <Button variant={variant} size={size} sx={sxProp} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={[className].filter(Boolean).join(' ')}
        {...props}
      />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = 'outline',
  size = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size' | 'sx'>) {
  return (
    <Button variant={variant} size={size} sx={sxProp} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={[className].filter(Boolean).join(' ')}
        {...props}
      />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
