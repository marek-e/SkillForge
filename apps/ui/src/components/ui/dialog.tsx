import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { colors, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'

/**
 * `data-open:` / `data-closed:` are `shadcn/tailwind.css` custom variants. Each
 * one expands to two selectors — `&:where([data-state="…"])` and
 * `&:where([data-…]:not([data-…="false"]))` — and Radix writes the first form
 * on both the overlay and the content, so that is the half reproduced here
 * (`tailwind-values.md` §9, and the same choice as `accordion.tsx` in PR 09).
 */
const OPEN = ':is([data-state="open"])'
const CLOSED = ':is([data-state="closed"])'

/** `sm:` — Tailwind's 40rem breakpoint. */
const SM = '@media (min-width: 40rem)'

/**
 * The `supports-backdrop-filter:` variant, character for character as Tailwind
 * writes it. `var(--tw)` is undefined on purpose: a `var()` makes the
 * declaration syntactically valid whatever the property's grammar, so the query
 * asks only whether the property exists.
 */
const BACKDROP_FILTER_SUPPORTED =
  '@supports ((-webkit-backdrop-filter: var(--supported-filter)) or (backdrop-filter: var(--supported-filter)))'

/**
 * The one-pixel ring, written as the whole five-layer chain Tailwind composes
 * (`tailwind-values.md` §5, §6). `ring-1` fills the fourth slot with
 * `0 0 0 calc(1px + var(--tw-ring-offset-width))`, and nothing here sets an
 * offset width, so the radius is a flat pixel.
 */
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

/**
 * `duration-100` sets `--tw-duration`, which the enter/exit `animate-…`
 * shorthand reads for its duration — and, because it also writes
 * `transition-duration` while `transition-property` keeps its initial `all`,
 * every property on these two elements transitions over the same tenth of a
 * second. Both halves are reproduced: the literal below goes into the animation
 * longhands and into `transitionDuration`.
 */
const DURATION = '0.1s'

/**
 * The four enter/exit animations.
 *
 * `tw-animate-css` ships one `@keyframes enter` and one `@keyframes exit` whose
 * every value is a `var()`, and the `fade-*` / `zoom-*` utilities set those
 * variables per element. A keyframe block resolves its variables against the
 * *animated element*, so one shared pair of keyframes behaves as four; StyleX
 * hashes a keyframe name instead of sharing it, so the four resolved forms are
 * written out. The values are the ones the built CSS produces: opacity 0 from
 * the two `fade-…` utilities, scale 0.95 from the two `zoom-…` utilities, and
 * the registered initial value (`0` translate, `0` rotate, `0` blur, scale `1`)
 * everywhere else.
 *
 * `enter` has only a `0%` frame and `exit` only a `to` frame; the missing end is
 * synthesised from the element's own values, which is why `animation-fill-mode`
 * stays `none`. `translate3d` is kept even at zero because it is what forces the
 * computed transform to a `matrix3d`, and `blur(0)` because a filter — even a
 * no-op one — creates a containing block for the duration of the animation.
 *
 * `stylex.keyframes` hashes the name, so `animation-name` is the one computed
 * value this cannot keep: the computed-style dumps leave it out and
 * `animations.spec.ts` pins both curves at 0ms, 100ms and 200ms instead
 * (`conventions.md`).
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
  //  inset-0 isolate z-50`, plus the enter/exit pair.
  //
  // The blur radius is written as the 4px `var(--blur-xs)` resolves to: it is a
  // Tailwind *theme* variable, emitted only while some utility still names it.
  // The colour cannot take the same treatment — see `OVERLAY_BLACK_10`.
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    isolation: 'isolate',
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

  // `bg-background ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4
  //  rounded-xl p-4 ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50
  //  w-full outline-none`, plus the enter/exit pair. `text-sm` and the two
  // translate utilities stay Tailwind; see the notes below.
  content: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    translate: '-50% -50%',
    position: 'fixed',
    top: '50%',
    left: '50%',
    zIndex: 50,
    display: 'grid',
    width: '100%',
    // `max-w-sm` is `var(--container-sm)`, another theme variable that is only
    // emitted while a utility names it, so the 24rem it resolves to is written
    // out.
    maxWidth: { default: 'calc(100% - 2rem)', [SM]: '24rem' },
    gap: '1rem',
    padding: '1rem',
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    boxShadow: RING_1,
    // `outline-none` also sets `--tw-outline-style: none`, which nothing here
    // reads back.
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

  // `absolute top-2 right-2` — the corner close button's box, passed to
  // `Button` through its `sx` prop so the two style objects merge in one
  // `stylex.props` call instead of meeting as two class lists (`conventions.md`,
  // "a StyleX caller overriding a StyleX component"). `Button` declares none of
  // these three properties today, and `sx` is applied last, so it stays that way.
  closeButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
  },

  // `sr-only`
  closeLabel: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },

  // `gap-2 flex flex-col`
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  // `bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse
  //  gap-2 sm:flex-row sm:justify-end`
  //
  // `border-t` sets only a width and `var(--tw-border-style)`, whose registered
  // initial value is `solid`; the colour keeps coming from the `*` rule in
  // `@layer base`, which no StyleX layer contests.
  footer: {
    display: 'flex',
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

  // Title retains its original unitless line height.
  title: {
    lineHeight: 1,
    fontSize: '1rem',
    fontWeight: 500,
  },

  // `text-muted-foreground`
  description: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    textDecorationLine: { default: null, ':is(*)>a': 'underline' },
    textUnderlineOffset: { default: null, ':is(*)>a': '3px' },
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':is(*)>a:hover': colors.foreground },
    },
  },
})

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & { sx?: Sx }) {
  const sx = stylex.props(styles.overlay, sxProp)
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DialogContent({
  className,
  style,
  children,
  showCloseButton = true,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  sx?: Sx
}) {
  const sx = stylex.props(styles.content, sxProp)
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button variant="ghost" sx={styles.closeButton} size="icon-sm">
              <XIcon />
              <span {...stylex.props(styles.closeLabel)}>Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)
  return (
    <div
      data-slot="dialog-header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  style,
  showCloseButton = false,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(styles.footer, sxProp)
  return (
    <div
      data-slot="dialog-footer"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & { sx?: Sx }) {
  const sx = stylex.props(styles.title, sxProp)
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description> & { sx?: Sx }) {
  const sx = stylex.props(styles.description, sxProp)
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
