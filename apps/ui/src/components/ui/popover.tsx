import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'
import { Popover as PopoverPrimitive } from 'radix-ui'

import { colors, radius, typography } from '@/styles/tokens.stylex'

/**
 * `data-open:` and `data-closed:`, the `shadcn/tailwind.css` custom variants
 * (`tailwind-values.md` §9). Both compile through `:where()`, so the rule stays
 * at (0,1,0) — `:is(:where(a), :where(b))` reproduces that exactly, where a
 * bare `:is(a, b)` would be (0,2,0).
 */
const OPEN = ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'
const CLOSED =
  ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))'

/** `data-[side=…]:`, Tailwind's arbitrary data variant — `&[data-side="…"]`, (0,2,0). */
const SIDE_TOP = ':is([data-side="top"])'
const SIDE_RIGHT = ':is([data-side="right"])'
const SIDE_BOTTOM = ':is([data-side="bottom"])'
const SIDE_LEFT = ':is([data-side="left"])'

/**
 * `tw-animate-css`'s `enter` and `exit` keyframes, resolved (§10).
 *
 * Tailwind has **one** pair of keyframes and feeds them per-utility custom
 * properties: `data-open:fade-in-0` sets `--tw-enter-opacity: 0`,
 * `data-open:zoom-in-95` sets `--tw-enter-scale: .95`, and each
 * `data-[side=…]:slide-in-from-…-2` sets one `--tw-enter-translate-*` to
 * ±`0.5rem` (2 × `--spacing`). StyleX has no equivalent — a `stylex.keyframes`
 * body is fixed — so the four side variants become four keyframes and the
 * resolved values are written out. The frames are otherwise character for
 * character what `enter`/`exit` contain, including the `filter: blur(0)` the
 * `--tw-enter-blur` default produces.
 *
 * `animation-name` is the one computed value this migration cannot keep
 * (StyleX hashes it), which is why `computed-styles.spec.ts` dumps the
 * longhands around it and `animations.spec.ts` captures 0/100/200 ms instead.
 *
 * `enterCentered` is the `data-side`-less fallback. Radix's popper always sets
 * `data-side`, so it is unreachable in practice; it exists because Tailwind
 * would animate an unsided content with no translate, and a nested StyleX
 * condition must declare a `default`.
 */
const enterCentered = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/** `data-[side=bottom]:slide-in-from-top-2` */
const enterFromTop = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, -0.5rem, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/** `data-[side=top]:slide-in-from-bottom-2` */
const enterFromBottom = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0.5rem, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/** `data-[side=right]:slide-in-from-left-2` */
const enterFromLeft = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(-0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/** `data-[side=left]:slide-in-from-right-2` */
const enterFromRight = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/**
 * `data-closed:fade-out-0 data-closed:zoom-out-95`. There is no
 * `slide-out-to-*` class on this component, so the exit translate stays at the
 * `--tw-exit-translate-*` default of `0` whatever side the content resolved to.
 */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/**
 * `shadow-md ring-1 ring-foreground/10`, composed.
 *
 * Every shadow or ring utility re-declares the whole five-slot `box-shadow`
 * chain and fills the slots it does not own with `0 0 #0000`
 * (`tailwind-values.md` §6). `--tw-shadow` is two layers for `shadow-md`, and
 * the ring's width is `calc(1px + var(--tw-ring-offset-width))` with the offset
 * at its `0px` default.
 */
const SHADOW_MD_RING_1 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'

const styles = stylex.create({
  // `bg-popover text-popover-foreground flex flex-col gap-2.5 rounded-lg p-2.5
  //  shadow-md ring-1 ring-foreground/10 duration-100 z-50 w-72
  //  origin-(--radix-popover-content-transform-origin) outline-hidden`
  content: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    width: '18rem',
    padding: '0.625rem',
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: SHADOW_MD_RING_1,
    zIndex: 50,
    transformOrigin: 'var(--radix-popover-content-transform-origin)',
    // `outline-hidden` — `outline-style: none` plus the forced-colors escape
    // hatch Tailwind pairs with it (`tailwind-values.md` §5). It also writes
    // `--tw-outline-style: none`, which only a caller's own `outline-*` utility
    // would read; none does. Written as longhands because the `outline`
    // shorthand would not carry the conditional.
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },

    // `data-open:animate-in data-closed:animate-out data-closed:fade-out-0
    //  data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95
    //  data-[side=bottom]:slide-in-from-top-2
    //  data-[side=left]:slide-in-from-right-2
    //  data-[side=right]:slide-in-from-left-2
    //  data-[side=top]:slide-in-from-bottom-2`
    animationName: {
      default: null,
      [OPEN]: {
        default: enterCentered,
        [SIDE_TOP]: enterFromBottom,
        [SIDE_RIGHT]: enterFromLeft,
        [SIDE_BOTTOM]: enterFromTop,
        [SIDE_LEFT]: enterFromRight,
      },
      [CLOSED]: exit,
    },
    // `duration-100` sets `--tw-duration`, which the `--animate-in` shorthand
    // reads for its duration, *and* `transition-duration` — both unconditional,
    // so both are written unconditionally here. The remaining longhands are
    // what the `animation` shorthand expands to: `var(--tw-ease, ease)`,
    // `var(--tw-animation-delay, 0s)` and the three `--tw-animation-*`
    // defaults, all at their registered values.
    animationDuration: '100ms',
    animationTimingFunction: 'ease',
    animationDelay: '0s',
    animationIterationCount: 1,
    animationDirection: 'normal',
    animationFillMode: 'none',
    transitionDuration: '100ms',
  },

  // `flex flex-col gap-0.5`
  header: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },

  // `font-medium`
  title: {
    fontWeight: 500,
  },

  // `text-muted-foreground`
  description: {
    color: colors.mutedForeground,
  },
})

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  style,
  align = 'center',
  sideOffset = 4,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { sx?: Sx }) {
  const sx = stylex.props(styles.content, sxProp)

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)

  return (
    <div
      data-slot="popover-header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function PopoverTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'h2'> & { sx?: Sx }) {
  const sx = stylex.props(styles.title, sxProp)

  return (
    <div
      data-slot="popover-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'p'> & { sx?: Sx }) {
  const sx = stylex.props(styles.description, sxProp)

  return (
    <p
      data-slot="popover-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
