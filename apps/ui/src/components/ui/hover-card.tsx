import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { HoverCard as HoverCardPrimitive } from 'radix-ui'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/** `data-open:` / `data-closed:`, the `shadcn/tailwind.css` custom variants (§9). */
const OPEN = ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'
const CLOSED =
  ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))'

/** `data-[side=…]:`, Tailwind's arbitrary data variant — `&[data-side="…"]`. */
const SIDE_TOP = ':is([data-side="top"])'
const SIDE_RIGHT = ':is([data-side="right"])'
const SIDE_BOTTOM = ':is([data-side="bottom"])'
const SIDE_LEFT = ':is([data-side="left"])'

/**
 * `tw-animate-css`'s `enter`/`exit` keyframes with the `--tw-enter-*` and
 * `--tw-exit-*` values this component sets resolved into them (§10); the same
 * five bodies `popover.tsx` builds, and StyleX hashes a keyframes block by its
 * content, so the two files share one set of `@keyframes` rules in the output.
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

/** `data-closed:fade-out-0 data-closed:zoom-out-95`; no `slide-out-to-*` here either. */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/** `shadow-md ring-1 ring-foreground/10`, the same composed chain as `popover.tsx` (§6). */
const SHADOW_MD_RING_1 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'

const styles = stylex.create({
  // `bg-popover text-popover-foreground w-64 rounded-lg p-2.5 shadow-md ring-1
  //  ring-foreground/10 duration-100 z-50
  //  origin-(--radix-hover-card-content-transform-origin) outline-hidden`
  content: {
    width: '16rem',
    padding: '0.625rem',
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: SHADOW_MD_RING_1,
    zIndex: 50,
    transformOrigin: 'var(--radix-hover-card-content-transform-origin)',
    // `outline-hidden`, longhands plus the forced-colors branch (§5).
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
    // `duration-100`, which sets both `--tw-duration` (read by the
    // `--animate-in` shorthand) and `transition-duration`.
    animationDuration: '100ms',
    animationTimingFunction: 'ease',
    animationDelay: '0s',
    animationIterationCount: 1,
    animationDirection: 'normal',
    animationFillMode: 'none',
    transitionDuration: '100ms',
  },
})

/**
 * `text-sm` stays a Tailwind class, the paired-line-height exception in
 * `conventions.md`: a hover card is a container a caller fills, and a
 * descendant with its own font size but no line height inherits the *ratio*
 * `calc(1.25 / 0.875)`, which a StyleX `1.25rem` cannot pass down. Removed with
 * the utility layer in PR 32.
 */
const PAIRED_TEXT_CLASS = 'text-sm'

function HoverCard({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  style,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  const sx = stylex.props(styles.content)

  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(PAIRED_TEXT_CLASS, sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
