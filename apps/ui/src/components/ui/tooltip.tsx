import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Tooltip as TooltipPrimitive } from 'radix-ui'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/** `data-open:` / `data-closed:`, the `shadcn/tailwind.css` custom variants (§9). */
const OPEN = ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'
const CLOSED =
  ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))'

/**
 * `data-[state=delayed-open]:`, Tailwind's arbitrary data variant, kept apart
 * from `data-open:` because it is a different `data-state` value. Radix's
 * tooltip has three open states — `delayed-open`, `instant-open` and the
 * `open` the custom variant matches — and the original class list covers only
 * two of them, so an `instant-open` tooltip animates in neither tree.
 */
const DELAYED_OPEN = ':is([data-state="delayed-open"])'

/** `data-[side=…]:`, Tailwind's arbitrary data variant — `&[data-side="…"]`. */
const SIDE_TOP = ':is([data-side="top"])'
const SIDE_RIGHT = ':is([data-side="right"])'
const SIDE_BOTTOM = ':is([data-side="bottom"])'
const SIDE_LEFT = ':is([data-side="left"])'

/**
 * `tw-animate-css`'s `enter`/`exit` keyframes with this component's
 * `--tw-enter-*` / `--tw-exit-*` values resolved into them (§10) — the same
 * five bodies `popover.tsx` and `hover-card.tsx` build, so all three share one
 * set of `@keyframes` rules in the output.
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

/** `data-closed:fade-out-0 data-closed:zoom-out-95`; no `slide-out-to-*` class here. */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

const styles = stylex.create({
  // `bg-foreground text-background rounded-md px-3 py-1.5 z-50 w-fit max-w-xs
  //  origin-(--radix-tooltip-content-transform-origin)`
  content: {
    width: 'fit-content',
    maxWidth: '20rem',
    paddingInline: '0.75rem',
    paddingBlock: '0.375rem',
    borderRadius: radius.md,
    backgroundColor: colors.foreground,
    color: colors.background,
    zIndex: 50,
    transformOrigin: 'var(--radix-tooltip-content-transform-origin)',

    // `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
    //  data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0
    //  data-[state=delayed-open]:zoom-in-95 data-closed:animate-out
    //  data-closed:fade-out-0 data-closed:zoom-out-95
    //  data-[side=bottom]:slide-in-from-top-2
    //  data-[side=left]:slide-in-from-right-2
    //  data-[side=right]:slide-in-from-left-2
    //  data-[side=top]:slide-in-from-bottom-2`
    //
    // `data-open:` and `data-[state=delayed-open]:` carry the same three
    // classes and are spelled out twice for the same reason Tailwind writes
    // them twice: they match different `data-state` values.
    animationName: {
      default: null,
      [OPEN]: {
        default: enterCentered,
        [SIDE_TOP]: enterFromBottom,
        [SIDE_RIGHT]: enterFromLeft,
        [SIDE_BOTTOM]: enterFromTop,
        [SIDE_LEFT]: enterFromRight,
      },
      [DELAYED_OPEN]: {
        default: enterCentered,
        [SIDE_TOP]: enterFromBottom,
        [SIDE_RIGHT]: enterFromLeft,
        [SIDE_BOTTOM]: enterFromTop,
        [SIDE_LEFT]: enterFromRight,
      },
      [CLOSED]: exit,
    },
    // No `duration-*` class here, so the `--animate-in` shorthand falls through
    // `var(--tw-animation-duration, var(--tw-duration, 0.15s))` to its own
    // default; the remaining longhands are the shorthand's other defaults.
    // `transition-duration` is deliberately absent: unlike the popover, nothing
    // on this element sets it.
    animationDuration: '0.15s',
    animationTimingFunction: 'ease',
    animationDelay: '0s',
    animationIterationCount: 1,
    animationDirection: 'normal',
    animationFillMode: 'none',
  },

  // `bg-foreground fill-foreground size-2.5 rotate-45 rounded-[2px] z-50
  //  translate-y-[calc(-50%_-_2px)]`
  arrow: {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '2px',
    backgroundColor: colors.foreground,
    fill: colors.foreground,
    zIndex: 50,
    rotate: '45deg',
    // Tailwind writes both axes through `--tw-translate-x` / `--tw-translate-y`
    // and the untouched axis keeps its registered `0` default.
    translate: '0px calc(-50% - 2px)',
  },
})

/**
 * `text-xs` stays a Tailwind class, the paired-line-height exception in
 * `conventions.md`: a tooltip's children come from the caller —
 * `sidebar.tsx` forwards a whole `TooltipContent` prop bag — and a descendant
 * with its own font size but no line height inherits the *ratio*
 * `calc(1 / 0.75)`, which a StyleX `1rem` cannot pass down. Removed with the
 * utility layer in PR 32.
 */
const PAIRED_TEXT_CLASS = 'text-xs'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  style,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const sx = stylex.props(styles.content)

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(PAIRED_TEXT_CLASS, sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className={stylex.props(styles.arrow).className} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
