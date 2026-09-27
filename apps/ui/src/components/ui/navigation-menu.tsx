import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva } from 'class-variance-authority'
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'

/**
 * The composed `box-shadow` of `focus-visible:ring-3 focus-visible:ring-ring/50`
 * and of `ring-foreground/10 ring-1 shadow-md` / the bare `shadow` (PR 14).
 *
 * A ring or shadow utility never writes `box-shadow` on its own: it sets one
 * `--tw-*` slot and re-declares the five-slot chain
 * (`--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow`,
 * `--tw-ring-shadow`, `--tw-shadow`), and every slot no utility set defaults to
 * `0 0 #0000`. Writing the no-op slots out keeps the *computed* `box-shadow`
 * string identical. The ring widths are `calc(N px + var(--tw-ring-offset-width))`
 * with an offset width of `0px` (`tailwind-values.md` §5, §6). The bare
 * `shadow` utility resolves to the deprecated `--shadow` value, which is the
 * same pair of layers as `shadow-sm`.
 */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
const SHADOW_RING =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
const SHADOW_MD =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'

/** the property list the bare `transition` utility expands to */
const TRANSITION_ALL_PROPERTIES =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events'

/**
 * `tw-animate-css`'s `enter` and `exit`, with this component's inputs written
 * in (`tailwind-values.md` §10).
 *
 * The shipped keyframes read every value from a `--tw-enter-*` / `--tw-exit-*`
 * custom property that one utility sets and the composed enter/exit utility
 * reads. That is a mechanism StyleX has no equivalent of, so each combination
 * the component can actually produce is its own keyframes block.
 *
 * The content composes two independent sets. `data-[motion^=from-]` /
 * `data-[motion^=to-]` add a full fade and a ±13rem slide
 * (`slide-in-from-{left,right}-52` is `calc(52 * var(--spacing))`), and inside
 * a `data-viewport=false` menu the `data-open:` / `data-closed:` set adds the
 * 95% zoom on top of whatever motion is running — so the sliding variants come
 * in a plain and a zoomed flavour.
 *
 * `stylex.keyframes` hashes the name, so `animation-name` is the one computed
 * value the migration cannot keep; `animations.spec.ts` pins the curve at
 * 0/100/200 ms instead.
 */

/** `data-[motion=from-start]:slide-in-from-left-52` with `data-[motion^=from-]:fade-in` */
const enterFromStart = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(-13rem, 0, 0) scale3d(1, 1, 1) rotate(0)',
    filter: 'blur(0)',
  },
})
/** `data-[motion=from-end]:slide-in-from-right-52` with the same fade */
const enterFromEnd = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(13rem, 0, 0) scale3d(1, 1, 1) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the same, plus `group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95` */
const enterFromStartZoom = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(-13rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
const enterFromEndZoom = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(13rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/**
 * `group-data-[viewport=false]/navigation-menu:data-open:animate-in` with
 * `…:data-open:fade-in-0` and `…:data-open:zoom-in-95`, and no motion running.
 */
const enterZoom = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** `data-[motion=to-start]:slide-out-to-left-52` with `data-[motion^=to-]:fade-out` */
const exitToStart = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(-13rem, 0, 0) scale3d(1, 1, 1) rotate(0)',
    filter: 'blur(0)',
  },
})
/** `data-[motion=to-end]:slide-out-to-right-52` with the same fade */
const exitToEnd = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(13rem, 0, 0) scale3d(1, 1, 1) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the same, plus `group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95` */
const exitToStartZoom = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(-13rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
const exitToEndZoom = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(13rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** `…:data-closed:animate-out` with `…:data-closed:fade-out-0 …:data-closed:zoom-out-95` */
const exitZoom = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/**
 * The viewport's own pair: `data-open:zoom-in-90` / `data-closed:zoom-out-95`
 * with **no** fade utility, so `--tw-enter-opacity` and `--tw-exit-opacity`
 * stay at their registered initial value of `1`.
 */
const viewportEnter = stylex.keyframes({
  from: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0) scale3d(0.9, 0.9, 0.9) rotate(0)',
    filter: 'blur(0)',
  },
})
const viewportExit = stylex.keyframes({
  to: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the indicator's `data-[state=visible]:fade-in` / `data-[state=hidden]:fade-out` */
const indicatorEnter = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0)',
    filter: 'blur(0)',
  },
})
const indicatorExit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0)',
    filter: 'blur(0)',
  },
})

/**
 * Selector keys are spelled out rather than shared through a constant, because
 * `stylex.create` needs its keys statically.
 *
 * - `data-open:` / `data-closed:` / `data-active:` are `shadcn/tailwind.css`
 *   custom variants and each compiles to a pair of `:where()` alternatives, so
 *   the key adds nothing to specificity, exactly like the two comma-separated
 *   selectors Tailwind emits.
 * - `group-data-[viewport=false]/navigation-menu:` keeps the compiled
 *   `:is(:where(.group\/navigation-menu)[data-viewport="false"] *)` shape; the
 *   group class stays on the root for as long as this selector exists.
 * - On `NavigationMenuContent`, `data-[motion=…]` sits at the **top** level and
 *   the viewport-less branch is nested inside it. A bare attribute key is worth
 *   5000 to the compiler and `:is(…)` only 2040, so a nested combination is
 *   5040 and reliably outranks both halves — which is what Tailwind gets from
 *   two `(0,2,0)` rules that each contribute a different `--tw-*` input to the
 *   same `enter` animation.
 * - `data-[motion^=from-]` / `data-[motion^=to-]` are written as the four exact
 *   values instead of a `^=` prefix match, because the slide distance is
 *   per-value anyway and Radix emits nothing else: the attribute is built as
 *   `` `${enter ? 'from-' : 'to-'}${direction}` `` with `direction` restricted
 *   to `start` | `end`. A prefix key would need a third nesting level to carry
 *   the same four translations and would decide its own priority ties.
 */
const styles = stylex.create({
  // `group/navigation-menu relative flex max-w-max flex-1 items-center justify-center`
  root: {
    position: 'relative',
    display: 'flex',
    maxWidth: 'max-content',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // `gap-0 group flex flex-1 list-none items-center justify-center`
  list: {
    gap: '0rem',
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    listStyleType: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // `relative`
  item: {
    position: 'relative',
  },

  // the `navigationMenuTriggerStyle` cva string, declaration for declaration:
  // `bg-background hover:bg-muted focus:bg-muted data-open:hover:bg-muted
  //  data-open:focus:bg-muted data-open:bg-muted/50 focus-visible:ring-ring/50
  //  data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted rounded-lg px-2.5
  //  py-1.5 text-sm font-medium transition-all focus-visible:ring-3
  //  focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger
  //  inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none
  //  outline-none`
  trigger: {
    backgroundColor: {
      default: colors.background,
      ':focus': colors.muted,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))': {
        default: 'color-mix(in oklab, var(--muted) 50%, transparent)',
        ':focus': colors.muted,
        '@media (hover: hover)': { default: null, ':hover': colors.muted },
      },
      // the base-ui flavour of the same state; no Radix element ever carries it
      '[data-popup-open]': {
        default: 'color-mix(in oklab, var(--muted) 50%, transparent)',
        '@media (hover: hover)': { default: null, ':hover': colors.muted },
      },
    },
    borderRadius: radius.lg,
    paddingInline: '0.625rem',
    paddingBlock: '0.375rem',
    // `text-sm`, with the paired line-height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    // `transition-all`, with Tailwind's `--default-transition-*`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    boxShadow: { default: null, ':focus-visible': RING_FOCUS },
    // `outline-none` writes `--tw-outline-style: none`, and
    // `focus-visible:outline-1` re-reads that same variable for its
    // `outline-style` — so the focus outline is one pixel of `none`, and only
    // the width ever changes. Preserved, not fixed.
    outlineStyle: 'none',
    outlineWidth: { default: null, ':focus-visible': '1px' },
    opacity: { default: null, ':disabled': '50%' },
    display: 'inline-flex',
    height: '2.25rem',
    width: 'max-content',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: { default: null, ':disabled': 'none' },
  },

  // the trigger's own chevron: `relative top-px ml-1 size-3 transition
  // duration-300 group-data-open/navigation-menu-trigger:rotate-180
  // group-data-popup-open/navigation-menu-trigger:rotate-180`
  triggerIcon: {
    position: 'relative',
    top: '1px',
    marginLeft: '0.25rem',
    width: '0.75rem',
    height: '0.75rem',
    transitionProperty: TRANSITION_ALL_PROPERTIES,
    transitionTimingFunction: motion.ease,
    transitionDuration: '0.3s',
    rotate: {
      default: null,
      ':is(:is(:where(.group\\/navigation-menu-trigger):where([data-state="open"]), :where(.group\\/navigation-menu-trigger):where([data-open]:not([data-open="false"]))) *)':
        '180deg',
      ':is(:where(.group\\/navigation-menu-trigger)[data-popup-open] *)': '180deg',
    },
  },

  // `data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out
  //  data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out
  //  data-[motion=from-end]:slide-in-from-right-52
  //  data-[motion=from-start]:slide-in-from-left-52
  //  data-[motion=to-end]:slide-out-to-right-52
  //  data-[motion=to-start]:slide-out-to-left-52
  //  group-data-[viewport=false]/navigation-menu:bg-popover
  //  group-data-[viewport=false]/navigation-menu:text-popover-foreground
  //  group-data-[viewport=false]/navigation-menu:data-open:animate-in
  //  group-data-[viewport=false]/navigation-menu:data-closed:animate-out
  //  group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95
  //  group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95
  //  group-data-[viewport=false]/navigation-menu:data-open:fade-in-0
  //  group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0
  //  group-data-[viewport=false]/navigation-menu:ring-foreground/10 p-1
  //  ease-[cubic-bezier(0.22,1,0.36,1)]
  //  group-data-[viewport=false]/navigation-menu:rounded-lg
  //  group-data-[viewport=false]/navigation-menu:shadow
  //  group-data-[viewport=false]/navigation-menu:ring-1
  //  group-data-[viewport=false]/navigation-menu:duration-300 top-0 left-0 w-full
  //  group-data-[viewport=false]/navigation-menu:top-full
  //  group-data-[viewport=false]/navigation-menu:mt-1.5
  //  group-data-[viewport=false]/navigation-menu:overflow-hidden md:absolute md:w-auto`
  content: {
    padding: '0.25rem',
    top: {
      default: '0rem',
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': '100%',
    },
    left: '0rem',
    width: { default: '100%', '@media (width >= 48rem)': 'auto' },
    position: { default: null, '@media (width >= 48rem)': 'absolute' },
    marginTop: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': '0.375rem',
    },
    backgroundColor: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': colors.popover,
    },
    color: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': colors.popoverForeground,
    },
    borderRadius: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': radius.lg,
    },
    boxShadow: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': SHADOW_RING,
    },
    overflow: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': 'hidden',
    },
    // `ease-[cubic-bezier(0.22,1,0.36,1)]` sets `--tw-ease`, which both the
    // transition and the composed enter/exit animation read, and
    // `…:duration-300` sets `--tw-duration`, which is the animation's duration
    // as well. Outside a viewport-less menu nothing sets it, so the animation
    // falls back to tw-animate-css's own `0.15s`.
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDuration: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': '0.3s',
    },
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    animationDuration: {
      default: '0.15s',
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': '0.3s',
    },
    animationName: {
      default: null,
      ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))': enterZoom,
        ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))':
          exitZoom,
      },
      '[data-motion="from-start"]': {
        default: enterFromStart,
        ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': enterFromStartZoom,
      },
      '[data-motion="from-end"]': {
        default: enterFromEnd,
        ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': enterFromEndZoom,
      },
      '[data-motion="to-start"]': {
        default: exitToStart,
        ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': exitToStartZoom,
      },
      '[data-motion="to-end"]': {
        default: exitToEnd,
        ':is(:where(.group\\/navigation-menu)[data-viewport="false"] *)': exitToEndZoom,
      },
    },
  },

  // the viewport's wrapper: `absolute top-full left-0 isolate z-50 flex justify-center`
  viewportTrack: {
    position: 'absolute',
    top: '100%',
    left: '0rem',
    isolation: 'isolate',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'center',
  },

  // `bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out
  //  data-closed:zoom-out-95 data-open:zoom-in-90 ring-foreground/10 rounded-lg
  //  shadow ring-1 duration-100 relative mt-1.5
  //  h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden
  //  md:w-(--radix-navigation-menu-viewport-width)`
  viewport: {
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    animationName: {
      default: null,
      ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
        viewportEnter,
      ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))':
        viewportExit,
    },
    animationDuration: '0.1s',
    animationTimingFunction: 'ease',
    transitionDuration: '0.1s',
    borderRadius: radius.lg,
    boxShadow: SHADOW_RING,
    position: 'relative',
    marginTop: '0.375rem',
    height: 'var(--radix-navigation-menu-viewport-height)',
    width: {
      default: '100%',
      '@media (width >= 48rem)': 'var(--radix-navigation-menu-viewport-width)',
    },
    overflow: 'hidden',
  },

  // `data-active:focus:bg-muted data-active:hover:bg-muted data-active:bg-muted/50
  //  focus-visible:ring-ring/50 hover:bg-muted focus:bg-muted flex items-center
  //  gap-2 rounded-lg p-2 text-sm transition-all outline-none
  //  focus-visible:ring-3 focus-visible:outline-1
  //  in-data-[slot=navigation-menu-content]:rounded-md`
  link: {
    backgroundColor: {
      default: null,
      ':focus': colors.muted,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      ':is(:where([data-state="active"]), :where([data-active]:not([data-active="false"])))': {
        default: 'color-mix(in oklab, var(--muted) 50%, transparent)',
        ':focus': colors.muted,
        '@media (hover: hover)': { default: null, ':hover': colors.muted },
      },
    },
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: {
      default: radius.lg,
      ':is([data-slot="navigation-menu-content"] *)': radius.md,
    },
    padding: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    boxShadow: { default: null, ':focus-visible': RING_FOCUS },
    // same `outline-none` + `focus-visible:outline-1` pairing as the trigger
    outlineStyle: 'none',
    outlineWidth: { default: null, ':focus-visible': '1px' },
  },

  // `data-[state=visible]:animate-in data-[state=hidden]:animate-out
  //  data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex
  //  h-1.5 items-end justify-center overflow-hidden`
  indicator: {
    animationName: {
      default: null,
      '[data-state="visible"]': indicatorEnter,
      '[data-state="hidden"]': indicatorExit,
    },
    animationDuration: '0.15s',
    animationTimingFunction: 'ease',
    top: '100%',
    zIndex: 1,
    display: 'flex',
    height: '0.375rem',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // the indicator's arrow: `bg-border rounded-tl-sm shadow-md relative top-[60%]
  // h-2 w-2 rotate-45`
  indicatorArrow: {
    backgroundColor: colors.border,
    borderTopLeftRadius: radius.sm,
    boxShadow: SHADOW_MD,
    position: 'relative',
    top: '60%',
    height: '0.5rem',
    width: '0.5rem',
    rotate: '45deg',
  },
})

/**
 * Classes that stay Tailwind until **PR 32** removes Tailwind itself.
 *
 * Cascade layers outrank specificity, so a StyleX rule in a `priorityN` layer
 * loses to any utility class on the target. That is wrong for a rule that
 * reaches out to an element this component does not style directly:
 *
 * - `**:data-[slot=navigation-menu-link]:focus:ring-0` and its `outline-none`
 *   twin compile to `:is(.content *)[data-slot=navigation-menu-link]:focus`,
 *   `(0,3,0)`, and exist to beat `NavigationMenuLink`'s own focus ring. Kept as
 *   utilities, they still do, whichever layer the link's own rules sit in.
 * - `[&_svg:not([class*='size-'])]:size-4` matches on the *literal text* of the
 *   child's `class` attribute, so it is a naming contract, not a measurement.
 *
 * `origin-top-center` is in the list for a different reason: Tailwind's
 * transform-origin scale has no such step, so the class compiles to **no CSS
 * at all** and the viewport keeps the initial `50% 50%` origin.
 * Translating it would invent a transform origin the frozen UI does not have,
 * so it stays exactly as dead as it is today.
 */
const CONTENT_LINK_RESET_CLASSES =
  '**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none'
const ICON_SIZE_CLASS = "[&_svg:not([class*='size-'])]:size-4"
const VIEWPORT_ORIGIN_CLASS = 'origin-top-center'

function NavigationMenu({
  className,
  style,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  const sx = stylex.props(styles.root)

  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      // `group/navigation-menu` carries no styling of its own, but
      // `NavigationMenuContent` still selects through it.
      className={cn('group/navigation-menu', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  const sx = stylex.props(styles.list)

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn('group', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  const sx = stylex.props(styles.item)

  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/**
 * Kept **byte-identical** and still exported: an exported `cva` helper only
 * goes once every call site has moved, and removing it is PR 32's job together
 * with `cva`, `cn` and `tailwind-merge`. No file outside this one calls it
 * today (`grep -rn navigationMenuTriggerStyle apps/ui/src`), and
 * `NavigationMenuTrigger` no longer does either — every class in this string
 * has a comment against its StyleX equivalent in `styles.trigger` above.
 */
const navigationMenuTriggerStyle = cva(
  'bg-background hover:bg-muted focus:bg-muted data-open:hover:bg-muted data-open:focus:bg-muted data-open:bg-muted/50 focus-visible:ring-ring/50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all focus-visible:ring-3 focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none outline-none'
)

function NavigationMenuTrigger({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  const sx = stylex.props(styles.trigger)
  const icon = stylex.props(styles.triggerIcon)

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      // `group/navigation-menu-trigger` is what the chevron's rotation selects
      // through, and the bare `group` was already on the element.
      className={cn('group/navigation-menu-trigger', 'group', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}{' '}
      <ChevronDownIcon
        className={icon.className}
        style={icon.style || undefined}
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  const sx = stylex.props(styles.content)

  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(CONTENT_LINK_RESET_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  const track = stylex.props(styles.viewportTrack)
  const sx = stylex.props(styles.viewport)

  return (
    <div className={cn(track.className)} style={track.style || undefined}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(VIEWPORT_ORIGIN_CLASS, sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  const sx = stylex.props(styles.link)

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(ICON_SIZE_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  const sx = stylex.props(styles.indicator)
  const arrow = stylex.props(styles.indicatorArrow)

  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <div className={cn(arrow.className)} style={arrow.style || undefined} />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
