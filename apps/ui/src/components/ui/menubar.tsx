import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Menubar as MenubarPrimitive } from 'radix-ui'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronRightIcon } from 'lucide-react'

/**
 * The composed `box-shadow` of `ring-foreground/10 ring-1 shadow-md` and of the
 * same pair with `shadow-lg` (PR 14).
 *
 * A ring utility never writes `box-shadow` on its own: it sets
 * `--tw-ring-shadow` and re-declares the five-slot chain
 * (`--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow`,
 * `--tw-ring-shadow`, `--tw-shadow`), and every slot no utility set defaults to
 * `0 0 #0000`. Writing the no-op slots out keeps the *computed* `box-shadow`
 * string identical, so no computed-style snapshot needs an exception. The ring
 * width is `calc(1px + var(--tw-ring-offset-width))` with an offset width of
 * `0px` (`tailwind-values.md` §5, §6).
 */
const SHADOW_MD_RING =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
const SHADOW_LG_RING =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'

/**
 * `tw-animate-css`'s `enter` and `exit` keyframes, with this component's inputs
 * already substituted.
 *
 * The shipped keyframes read every value from a `--tw-enter-*` / `--tw-exit-*`
 * custom property that one composable utility sets and the composed
 * enter/exit utility reads (`data-open:fade-in-0` → opacity `0`,
 * `data-open:zoom-in-95` → scale `.95`, `data-[side=bottom]:slide-in-from-top-2`
 * → `--tw-enter-translate-y: calc(2 * var(--spacing) * -1)`, i.e. `-0.5rem`;
 * `tailwind-values.md` §10). StyleX has no equivalent of one utility writing a
 * variable another reads, so the four sides are four keyframes with the numbers
 * written in. The inputs nothing sets keep their registered initial values:
 * rotate `0`, blur `0`, and no translation at all on the way out, because this
 * component has no `slide-out-to-*`.
 *
 * `stylex.keyframes` hashes the name, so `animation-name` is the one computed
 * value the migration cannot keep; `animations.spec.ts` pins the curve at
 * 0/100/200 ms instead.
 */

/** `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95`, unslid */
const enter = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the same plus `data-[side=bottom]:slide-in-from-top-2` */
const enterFromTop = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, -0.5rem, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the same plus `data-[side=top]:slide-in-from-bottom-2` */
const enterFromBottom = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0.5rem, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the same plus `data-[side=right]:slide-in-from-left-2` */
const enterFromLeft = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(-0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** the same plus `data-[side=left]:slide-in-from-right-2` */
const enterFromRight = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** `data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95` */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/**
 * Every selector key below is spelled out rather than shared through a
 * constant, because `stylex.create` needs its keys statically.
 *
 * - `data-open:` / `data-closed:` / `data-disabled:` are `shadcn/tailwind.css`
 *   custom variants and each compiles to a pair of `:where()` alternatives, so
 *   the whole key adds nothing to specificity — exactly like the two
 *   comma-separated selectors Tailwind emits.
 * - `data-[side=…]` sits at the top level, with the open state nested inside:
 *   a bare attribute key is worth 5000 to the compiler and `:is(…)` only 2040,
 *   so the sided rule outranks the plain one the way `(0,2,0)` outranks
 *   `(0,1,0)` today (`conventions.md`, priority table).
 * - `outline-hidden` is the `--tw-outline-style: none` reset plus Tailwind's
 *   `@media (forced-colors: active)` block, which restores a transparent 2px
 *   outline so focus stays visible in forced colours.
 */
const styles = stylex.create({
  // `bg-background h-8 gap-0.5 rounded-lg border p-[3px] flex items-center`
  menubar: {
    backgroundColor: colors.background,
    height: '2rem',
    gap: '0.125rem',
    borderRadius: radius.lg,
    // `border`: 1px wide, `--tw-border-style` defaults to `solid`, and no
    // colour utility, so it stays at preflight's `currentcolor`.
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '3px',
    display: 'flex',
    alignItems: 'center',
  },

  // `hover:bg-muted aria-expanded:bg-muted rounded-sm px-1.5 py-[2px] text-sm
  //  font-medium flex items-center outline-hidden select-none`
  trigger: {
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      // Tailwind emits every `hover:` variant inside `@media (hover: hover)`.
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
    },
    borderRadius: radius.sm,
    paddingInline: '0.375rem',
    paddingBlock: '2px',
    // `text-sm`, with the paired line-height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    // `outline-hidden`
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    userSelect: 'none',
  },

  // `bg-popover text-popover-foreground data-open:animate-in data-open:fade-in-0
  //  data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2
  //  data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2
  //  data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-lg
  //  p-1 shadow-md ring-1 duration-100 z-50
  //  origin-(--radix-menubar-content-transform-origin) overflow-hidden`
  content: {
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    minWidth: '9rem',
    borderRadius: radius.lg,
    padding: '0.25rem',
    boxShadow: SHADOW_MD_RING,
    animationName: {
      default: null,
      ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))': enter,
      '[data-side="bottom"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromTop,
      },
      '[data-side="top"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromBottom,
      },
      '[data-side="right"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromLeft,
      },
      '[data-side="left"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromRight,
      },
    },
    // `duration-100` sets `--tw-duration`, which `data-open:animate-in` reads
    // for its own duration, and which the utility also applies as
    // `transition-duration`. The element declares no `transition-property`, so
    // that duration rides on the initial `all`; preserved rather than tidied.
    animationDuration: '0.1s',
    animationTimingFunction: 'ease',
    transitionDuration: '0.1s',
    zIndex: 50,
    transformOrigin: 'var(--radix-menubar-content-transform-origin)',
    overflow: 'hidden',
  },

  // `bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out
  //  data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95
  //  data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2
  //  data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2
  //  data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-32 rounded-lg
  //  p-1 shadow-lg ring-1 duration-100 z-50
  //  origin-(--radix-menubar-content-transform-origin) overflow-hidden`
  subContent: {
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    minWidth: '8rem',
    borderRadius: radius.lg,
    padding: '0.25rem',
    boxShadow: SHADOW_LG_RING,
    animationName: {
      default: null,
      ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))': enter,
      ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))': exit,
      '[data-side="bottom"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromTop,
        ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))':
          exit,
      },
      '[data-side="top"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromBottom,
        ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))':
          exit,
      },
      '[data-side="right"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromLeft,
        ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))':
          exit,
      },
      '[data-side="left"]': {
        default: null,
        ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
          enterFromRight,
        ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))':
          exit,
      },
    },
    animationDuration: '0.1s',
    animationTimingFunction: 'ease',
    transitionDuration: '0.1s',
    zIndex: 50,
    transformOrigin: 'var(--radix-menubar-content-transform-origin)',
    overflow: 'hidden',
  },

  // `focus:bg-accent focus:text-accent-foreground
  //  data-[variant=destructive]:text-destructive
  //  data-[variant=destructive]:focus:bg-destructive/10
  //  dark:data-[variant=destructive]:focus:bg-destructive/20
  //  data-[variant=destructive]:focus:text-destructive gap-1.5 rounded-md px-1.5
  //  py-1 text-sm data-disabled:opacity-50 data-inset:pl-7 relative flex
  //  cursor-default items-center outline-hidden select-none
  //  data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0`
  item: {
    backgroundColor: {
      default: null,
      ':focus': colors.accent,
      // A bare attribute key outranks `:focus`, and each nested condition adds
      // 40, which reproduces (0,3,0) and (0,4,0) beating (0,2,0).
      '[data-variant="destructive"]': {
        default: null,
        ':focus': 'color-mix(in oklab, var(--destructive) 10%, transparent)',
        ':is(.dark *)': {
          default: null,
          ':focus': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
        },
      },
    },
    color: {
      default: null,
      ':focus': colors.accentForeground,
      '[data-variant="destructive"]': { default: colors.destructive, ':focus': colors.destructive },
    },
    gap: '0.375rem',
    borderRadius: radius.md,
    paddingInline: '0.375rem',
    paddingBlock: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    opacity: {
      default: null,
      ':is(:where([data-disabled="true"]), :where([data-disabled]:not([data-disabled="false"])))':
        '50%',
    },
    // `data-inset:pl-7`. A physical longhand resolves over the logical property
    // it maps to whatever the source order, in Blink and in StyleX alike, so
    // this keeps beating the `px-1.5` above exactly as it does today.
    paddingLeft: { default: null, '[data-inset]': '1.75rem' },
    position: 'relative',
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    // `outline-hidden`
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    userSelect: 'none',
    pointerEvents: {
      default: null,
      ':is(:where([data-disabled="true"]), :where([data-disabled]:not([data-disabled="false"])))':
        'none',
      // `[&_svg]:pointer-events-none`
      ':is(*) svg': 'none',
    },
    // `[&_svg]:shrink-0`
    flexShrink: { default: null, ':is(*) svg': 0 },
  },

  // `focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-md py-1 pr-1.5
  //  pl-7 text-sm data-inset:pl-7 relative flex cursor-default items-center
  //  outline-hidden select-none data-disabled:pointer-events-none
  //  [&_svg]:pointer-events-none [&_svg]:shrink-0`
  //
  // No `data-disabled:opacity-50`: the checkbox item is the one item that does
  // not dim when disabled, which the migration preserves rather than fixes.
  checkboxItem: {
    backgroundColor: { default: null, ':focus': colors.accent },
    color: { default: null, ':focus': colors.accentForeground },
    gap: '0.375rem',
    borderRadius: radius.md,
    paddingBlock: '0.25rem',
    paddingRight: '0.375rem',
    // `pl-7` and `data-inset:pl-7` are the same 1.75rem, so the conditional one
    // could never change anything.
    paddingLeft: '1.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    position: 'relative',
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    userSelect: 'none',
    pointerEvents: {
      default: null,
      ':is(:where([data-disabled="true"]), :where([data-disabled]:not([data-disabled="false"])))':
        'none',
      ':is(*) svg': 'none',
    },
    flexShrink: { default: null, ':is(*) svg': 0 },
  },

  // the same set plus `data-disabled:opacity-50`
  radioItem: {
    backgroundColor: { default: null, ':focus': colors.accent },
    color: { default: null, ':focus': colors.accentForeground },
    gap: '0.375rem',
    borderRadius: radius.md,
    paddingBlock: '0.25rem',
    paddingRight: '0.375rem',
    paddingLeft: '1.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    opacity: {
      default: null,
      ':is(:where([data-disabled="true"]), :where([data-disabled]:not([data-disabled="false"])))':
        '50%',
    },
    position: 'relative',
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    userSelect: 'none',
    pointerEvents: {
      default: null,
      ':is(:where([data-disabled="true"]), :where([data-disabled]:not([data-disabled="false"])))':
        'none',
      ':is(*) svg': 'none',
    },
    flexShrink: { default: null, ':is(*) svg': 0 },
  },

  // `left-1.5 size-4 pointer-events-none absolute flex items-center justify-center`
  indicator: {
    left: '0.375rem',
    width: '1rem',
    height: '1rem',
    pointerEvents: 'none',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // `px-1.5 py-1 text-sm font-medium data-inset:pl-7`
  label: {
    paddingInline: '0.375rem',
    paddingBlock: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    paddingLeft: { default: null, '[data-inset]': '1.75rem' },
  },

  // `bg-border -mx-1 my-1 h-px`
  separator: {
    backgroundColor: colors.border,
    marginInline: '-0.25rem',
    marginBlock: '0.25rem',
    height: '1px',
  },

  // `text-muted-foreground group-focus/menubar-item:text-accent-foreground
  //  text-xs tracking-widest ml-auto`
  shortcut: {
    color: {
      default: colors.mutedForeground,
      // `group/menubar-item` stays on `MenubarItem`, so this is the selector
      // Tailwind compiles the variant to, character for character.
      ':is(:where(.group\\/menubar-item):focus *)': colors.accentForeground,
    },
    // `text-xs`, with the paired line-height as the length it resolves to
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0.1em',
    marginLeft: 'auto',
  },

  // `focus:bg-accent focus:text-accent-foreground data-open:bg-accent
  //  data-open:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm
  //  data-inset:pl-7 flex cursor-default items-center outline-none select-none`
  subTrigger: {
    backgroundColor: {
      default: null,
      ':focus': colors.accent,
      ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
        colors.accent,
    },
    color: {
      default: null,
      ':focus': colors.accentForeground,
      ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))':
        colors.accentForeground,
    },
    gap: '0.375rem',
    borderRadius: radius.md,
    paddingInline: '0.375rem',
    paddingBlock: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    paddingLeft: { default: null, '[data-inset]': '1.75rem' },
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    // `outline-none`, the plain reset with no forced-colours block
    outlineStyle: 'none',
    userSelect: 'none',
  },

  // the sub-trigger's own chevron: `ml-auto size-4`
  subTriggerIcon: {
    marginLeft: 'auto',
    width: '1rem',
    height: '1rem',
  },
})

/**
 * Rules that reach an element this component does not own, kept as Tailwind
 * classes until **PR 32** removes Tailwind itself.
 *
 * Cascade layers outrank specificity, so a StyleX rule in a `priorityN` layer
 * loses to any utility class sitting on the target — which is wrong for a rule
 * that used to win on specificity over the target's own classes.
 *
 * - `[&_svg:not([class*='size-'])]:size-4` matches on the *literal text* of the
 *   child's `class` attribute, so it is a naming contract, not a measurement.
 * - the `**:` colour rules paint every descendant, including nodes the caller
 *   passes in, and the destructive one carries `!` precisely to beat a caller.
 */
const ICON_SIZE_CLASS = "[&_svg:not([class*='size-'])]:size-4"
const ITEM_DESCENDANT_CLASSES =
  'data-[variant=destructive]:*:[svg]:text-destructive! not-data-[variant=destructive]:focus:**:text-accent-foreground'
const FOCUS_DESCENDANT_CLASS = 'focus:**:text-accent-foreground'

function Menubar({
  className,
  style,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  const sx = stylex.props(styles.menubar)

  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarTrigger({
  className,
  style,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const sx = stylex.props(styles.trigger)

  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  style,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  const sx = stylex.props(styles.content)

  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  style,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  const sx = stylex.props(styles.item)

  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      // `group/menubar-item` carries no styling of its own, but
      // `MenubarShortcut` still selects through it, so the literal class name
      // is part of the contract until PR 32.
      className={cn(
        'group/menubar-item',
        ICON_SIZE_CLASS,
        ITEM_DESCENDANT_CLASSES,
        sx.className,
        className
      )}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  style,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  const sx = stylex.props(styles.checkboxItem)
  const indicator = stylex.props(styles.indicator)

  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(FOCUS_DESCENDANT_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      checked={checked}
      {...props}
    >
      <span
        className={cn(ICON_SIZE_CLASS, indicator.className)}
        style={indicator.style || undefined}
      >
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  style,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  inset?: boolean
}) {
  const sx = stylex.props(styles.radioItem)
  const indicator = stylex.props(styles.indicator)

  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(FOCUS_DESCENDANT_CLASS, ICON_SIZE_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <span
        className={cn(ICON_SIZE_CLASS, indicator.className)}
        style={indicator.style || undefined}
      >
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  style,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  const sx = stylex.props(styles.label)

  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  const sx = stylex.props(styles.separator)

  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function MenubarShortcut({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.shortcut)

  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  style,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  const sx = stylex.props(styles.subTrigger)
  const icon = stylex.props(styles.subTriggerIcon)

  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(ICON_SIZE_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <ChevronRightIcon className={icon.className} style={icon.style || undefined} />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  const sx = stylex.props(styles.subContent)

  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
