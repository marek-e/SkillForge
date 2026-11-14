import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Dialog as SheetPrimitive } from 'radix-ui'

import { colors, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'

/**
 * `data-open:` and `data-closed:` are **custom variants** from
 * `shadcn/tailwind.css`, not Tailwind's generic `data-[…]` syntax. Each one
 * emits two `:where()` branches — the Radix/vaul `data-state` value and a bare
 * boolean attribute — and `:where()` contributes no specificity, so wrapping
 * both in one `:is()` reproduces the selector *and* its (0,1,0) weight
 * (`tailwind-values.md` §9).
 */
const OPEN = ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'
const CLOSED =
  ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))'

/**
 * `data-open:animate-in` / `data-closed:animate-out` composed by hand
 * (`tailwind-values.md` §10).
 *
 * Every Tailwind class named in this file's comments is written with the
 * variant prefix it carries in the frozen source. An unprefixed utility name
 * in a comment is a candidate Tailwind's scanner emits a rule for, and for
 * several of these the unprefixed rule never existed in the bundle
 * (`conventions.md`, the scanner trap).
 *
 * `tw-animate-css` ships two keyframe rules, `enter` and `exit`, whose single
 * frame reads nine `--tw-enter-*` / `--tw-exit-*` custom properties that the
 * `fade-*` and `slide-*` utilities set. StyleX must not reference those
 * properties (they go with Tailwind in PR 32), so every combination the sheet
 * uses becomes its own `stylex.keyframes` with the variables substituted:
 *
 * - `data-open:fade-in-0` / `data-closed:fade-out-0` → `opacity: 0`
 * - `data-[side=right]:data-open:slide-in-from-right-10` sets
 *   `--tw-enter-translate-x: 10%`. The emitted value is a **percentage**, not
 *   `2.5rem`: `10` matches tw-animate-css's own `--percentage-*` theme scale
 *   after it matches the integer/spacing branch, and the later declaration
 *   wins. Read off the built CSS, not derived.
 * - the untouched defaults stay written out — `scale3d(1, 1, 1)`, `rotate(0)`
 *   and `blur(0)` are what `var(--tw-enter-scale, 1)` and friends resolve to,
 *   and `filter: blur(0)` is not the same computed value as `filter: none`.
 *
 * `stylex.keyframes` hashes the name, so `animation-name` is the one computed
 * value this migration cannot keep; `animations.spec.ts` pins the curve at
 * 0/100/200/300 ms instead.
 */
const FADE_FROM = {
  opacity: 0,
  transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0)',
  filter: 'blur(0)',
} as const

const overlayEnter = stylex.keyframes({ from: FADE_FROM })
const overlayExit = stylex.keyframes({ to: FADE_FROM })

const enterFromRight = stylex.keyframes({
  from: { ...FADE_FROM, transform: 'translate3d(10%, 0, 0) scale3d(1, 1, 1) rotate(0)' },
})
const exitToRight = stylex.keyframes({
  to: { ...FADE_FROM, transform: 'translate3d(10%, 0, 0) scale3d(1, 1, 1) rotate(0)' },
})
const enterFromLeft = stylex.keyframes({
  from: { ...FADE_FROM, transform: 'translate3d(-10%, 0, 0) scale3d(1, 1, 1) rotate(0)' },
})
const exitToLeft = stylex.keyframes({
  to: { ...FADE_FROM, transform: 'translate3d(-10%, 0, 0) scale3d(1, 1, 1) rotate(0)' },
})
const enterFromTop = stylex.keyframes({
  from: { ...FADE_FROM, transform: 'translate3d(0, -10%, 0) scale3d(1, 1, 1) rotate(0)' },
})
const exitToTop = stylex.keyframes({
  to: { ...FADE_FROM, transform: 'translate3d(0, -10%, 0) scale3d(1, 1, 1) rotate(0)' },
})
const enterFromBottom = stylex.keyframes({
  from: { ...FADE_FROM, transform: 'translate3d(0, 10%, 0) scale3d(1, 1, 1) rotate(0)' },
})
const exitToBottom = stylex.keyframes({
  to: { ...FADE_FROM, transform: 'translate3d(0, 10%, 0) scale3d(1, 1, 1) rotate(0)' },
})

/**
 * `shadow-lg`, with the four unused slots of the composed chain written out.
 *
 * The colour has to be written the way Tailwind writes it — `rgb(0 0 0 / 0.1)`,
 * not the `#0000001a` shorthand. Chromium serialises the hex alpha as `0.102`
 * (26/255) and the percentage one as `0.1`, so the two produce different
 * computed `box-shadow` strings for the same intent.
 */
const SHADOW_LG =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'

const styles = stylex.create({
  // `bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed
  //  inset-0 z-50 data-open:animate-in data-closed:animate-out
  //  data-closed:fade-out-0 data-open:fade-in-0
  //  data-ending-style:opacity-0 data-starting-style:opacity-0`
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    // Tailwind emits a `#0000001a` fallback and then overrides it inside
    // `@supports (color: color-mix(…))`, which every Chromium satisfies, so the
    // `color-mix` is the value that renders. `#000` rather than
    // `var(--color-black)`: the Tailwind custom property disappears in PR 32.
    backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
    // `duration-100` also writes `transition-duration`, and with no
    // `transition-property` utility the initial `all` applies — so the overlay
    // really does transition every property over 100ms.
    transitionDuration: '100ms',
    // `supports-backdrop-filter:backdrop-blur-xs` resolves to `blur(4px)`,
    // the `xs` step of the blur scale. The `@supports` guard is a no-op: a
    // browser that lacks the property drops the declaration anyway.
    backdropFilter: 'blur(4px)',
    // Base UI attributes that Radix never sets; kept so the rules survive.
    opacity: {
      default: null,
      '[data-ending-style]': 0,
      '[data-starting-style]': 0,
    },
    animationName: { default: null, [OPEN]: overlayEnter, [CLOSED]: overlayExit },
    // `--tw-duration` comes from `duration-100`; `--tw-ease` is unset, so the
    // composed enter animation falls back to `ease`. Delay, iteration count,
    // direction and fill-mode are initial values on both sides.
    animationDuration: '100ms',
    animationTimingFunction: 'ease',
  },

  // `bg-background fixed z-50 flex flex-col gap-4 bg-clip-padding shadow-lg`.
  // Preserve the original inherited font metrics and transition property list.
  content: {
    position: 'fixed',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: colors.background,
    backgroundClip: 'padding-box',
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    '--sheet-transition-properties':
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
    transitionProperty: 'var(--sheet-transition-properties)',
    transitionDuration: '200ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: SHADOW_LG,
    // Unconditional, where Tailwind writes them inside the enter/exit
    // animation shorthand: Radix keeps a `data-state` on this element for
    // as long as it is mounted, so there is no third state in which an
    // `animation-duration` without an `animation-name` could be observed.
    // `--tw-duration` is `duration-200` and `--tw-ease` is `ease-in-out`.
    animationDuration: '200ms',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // `data-[side=right]:inset-y-0 data-[side=right]:right-0
  //  data-[side=right]:h-full data-[side=right]:border-l
  //  data-[side=right]:sm:max-w-sm`, plus the two keyframes for this edge.
  // The `side` prop and the `data-side` attribute are written from the same
  // value, so selecting the style object by prop matches the same elements.
  sideRight: {
    width: '75%',
    insetBlock: 0,
    right: 0,
    height: '100%',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    maxWidth: { default: null, '@media (width >= 40rem)': '24rem' },
    animationName: { default: null, [OPEN]: enterFromRight, [CLOSED]: exitToRight },
  },
  sideLeft: {
    width: '75%',
    insetBlock: 0,
    left: 0,
    height: '100%',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    maxWidth: { default: null, '@media (width >= 40rem)': '24rem' },
    animationName: { default: null, [OPEN]: enterFromLeft, [CLOSED]: exitToLeft },
  },
  sideTop: {
    insetInline: 0,
    top: 0,
    height: 'auto',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    animationName: { default: null, [OPEN]: enterFromTop, [CLOSED]: exitToTop },
  },
  sideBottom: {
    insetInline: 0,
    bottom: 0,
    height: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    animationName: { default: null, [OPEN]: enterFromBottom, [CLOSED]: exitToBottom },
  },

  // `absolute top-3 right-3`, passed to `Button` as `sx` rather than as a
  // utility class: `Button` is StyleX now, so both sides belong in the same
  // cascade layer. It declares no `position`/`top`/`right` of its own, so
  // nothing is merged away.
  closeButton: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
  },

  // `sr-only`
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },

  // `gap-0.5 flex flex-col`
  header: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },

  // `gap-2 p-4 mt-auto flex flex-col`
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    marginTop: 'auto',
  },

  // `text-foreground text-base font-medium`
  title: {
    color: colors.foreground,
    fontSize: '1rem',
    // `--text-base--line-height` is `calc(1.5 / 1)`, which folds to exactly
    // `1.5` — the one paired line-height lightningcss cannot round. So the
    // ratio is kept as a number rather than rewritten as `1.5rem`: same
    // computed value on the title, and a child with its own font size keeps
    // inheriting the ratio the way it does today.
    lineHeight: 1.5,
    fontWeight: 500,
  },

  // `text-muted-foreground text-sm`
  description: {
    color: colors.mutedForeground,
    // The paired line-height as the length it resolves to: `calc(1.25 / 0.875)`
    // is folded to five decimals by lightningcss and lands on 19.99998px.
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  const sx = stylex.props(styles.overlay)

  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

const sideStyles = {
  top: styles.sideTop,
  right: styles.sideRight,
  bottom: styles.sideBottom,
  left: styles.sideLeft,
} as const

function SheetContent({
  className,
  style,
  children,
  side = 'right',
  showCloseButton = true,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  showCloseButton?: boolean
  sx?: Sx
}) {
  const sx = stylex.props(styles.content, sideStyles[side], sxProp)

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button variant="ghost" sx={styles.closeButton} size="icon-sm">
              <XIcon />
              <span {...stylex.props(styles.srOnly)}>Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)

  return (
    <div
      data-slot="sheet-header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SheetFooter({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.footer)

  return (
    <div
      data-slot="sheet-footer"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  const sx = stylex.props(styles.title)

  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  const sx = stylex.props(styles.description)

  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
