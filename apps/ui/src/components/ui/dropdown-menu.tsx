import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'

import { colors, radius } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { CheckIcon, ChevronRightIcon } from 'lucide-react'

/** `data-open:` / `data-closed:` / `data-disabled:`, the `shadcn/tailwind.css` custom variants. */
const OPEN = ':is([data-state="open"], [data-open]:not([data-open="false"]))'
const CLOSED = ':is([data-state="closed"], [data-closed]:not([data-closed="false"]))'
const DISABLED = ':is([data-disabled="true"], [data-disabled]:not([data-disabled="false"]))'

/**
 * `data-open:animate-in` composed with `data-open:fade-in-0`,
 * `data-open:zoom-in-95` and one `data-[side=bottom]:slide-in-from-top-2`-style
 * class per side.
 *
 * `tw-animate-css` has a single `enter` keyframe set whose `from` frame reads
 * `--tw-enter-opacity`, `--tw-enter-translate-x`, `--tw-enter-translate-y`,
 * `--tw-enter-scale`, `--tw-enter-rotate` and `--tw-enter-blur`; each utility
 * only sets one of those variables (`tailwind-values.md` §10). StyleX has no
 * such indirection, so every combination this component can produce is its own
 * keyframe set with the variables already substituted, written out in full —
 * `translate3d`, `scale3d`, `rotate` and `filter`, no-op slots included.
 *
 * The generated name is the one computed value this migration cannot keep:
 * StyleX hashes it (`conventions.md`, "Animations"). The curve is pinned by the
 * animation longhands and by the fixed-timestamp frames in
 * `visual/animations.spec.ts` instead.
 */
const enter = stylex.keyframes({
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
 * `data-closed:animate-out` with `data-closed:fade-out-0` and
 * `data-closed:zoom-out-95`. The file sets no `slide-out-to-*` class, so the
 * exit frame keeps its translate at zero whatever the side is.
 */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/**
 * `shadow-md ring-1 ring-foreground/10`, and `shadow-lg` with the same ring.
 *
 * A ring and a shadow are two slots of one five-slot `box-shadow`
 * (`tailwind-values.md` §5/§6); the unused slots are written out as `0 0 #0000`
 * so the *computed* string stays exactly what Tailwind produces.
 */
const SHADOW_MD_RING =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
const SHADOW_LG_RING =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'

const descendantStyles = stylex.create({
  icons: {
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    pointerEvents: { default: null, ':is(*) svg': 'none' },
    flexShrink: { default: null, ':is(*) svg': 0 },
  },
  focusDescendants: {
    color: { default: null, ':is(*):focus *': colors.accentForeground },
  },
  rowDescendants: {
    color: {
      default: null,
      ':is([data-variant="destructive"])>svg': colors.destructive,
      ':is(*):not([data-variant="destructive"]):focus *': colors.accentForeground,
    },
  },
})
const ITEM_ICONS = stylex.props(descendantStyles.icons).className
const FOCUS_DESCENDANTS = stylex.props(descendantStyles.focusDescendants).className
const ROW_DESCENDANTS = stylex.props(descendantStyles.rowDescendants).className

const styles = stylex.create({
  // Shared by `DropdownMenuContent` and `DropdownMenuSubContent`:
  // `data-open:animate-in data-closed:animate-out data-closed:fade-out-0
  //  data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95
  //  data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
  //  data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
  //  bg-popover text-popover-foreground p-1 duration-100 z-50
  //  origin-(--radix-dropdown-menu-content-transform-origin)`
  surface: {
    zIndex: 50,
    padding: '0.25rem',
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
    // `duration-100` sets both `--tw-duration`, which the composed `animation`
    // shorthand reads, and `transition-duration`.
    transitionDuration: '100ms',
    animationName: {
      default: null,
      [OPEN]: {
        default: enter,
        '[data-side="bottom"]': enterFromTop,
        '[data-side="left"]': enterFromRight,
        '[data-side="right"]': enterFromLeft,
        '[data-side="top"]': enterFromBottom,
      },
      [CLOSED]: exit,
    },
    // The rest of what `data-open:animate-in` / `data-closed:animate-out`
    // compose, which is one `animation` shorthand:
    // `enter|exit <duration> ease 0s 1 normal none`. Radix always renders one of
    // the two states, so the longhands compute what the shorthand computes
    // without repeating both conditions six times.
    //
    // The theme variable the two utilities read is deliberately *not* named
    // here: Tailwind's scanner reads comments, and naming it adds two lines to
    // the `@theme` block of the built CSS (`conventions.md`, "Tailwind scanner").
    animationDuration: '100ms',
    animationTimingFunction: 'ease',
    animationDelay: '0s',
    animationIterationCount: 1,
    animationDirection: 'normal',
    animationFillMode: 'none',
  },

  // `ring-foreground/10 min-w-32 rounded-lg shadow-md ring-1
  //  max-h-(--radix-dropdown-menu-content-available-height)
  //  w-(--radix-dropdown-menu-trigger-width) overflow-x-hidden overflow-y-auto
  //  data-[state=closed]:overflow-hidden`
  content: {
    minWidth: '8rem',
    width: 'var(--radix-dropdown-menu-trigger-width)',
    maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
    borderRadius: radius.lg,
    boxShadow: SHADOW_MD_RING,
    overflowX: 'hidden',
    // `data-[state=closed]:overflow-hidden` is written on the longhand: StyleX
    // ranks the `overflow` shorthand *below* `overflow-y`, so a shorthand here
    // would lose to `overflow-y-auto`, where Tailwind's (0,2,0) beats (0,1,0).
    overflowY: { default: 'auto', '[data-state="closed"]': 'hidden' },
  },

  // `ring-foreground/10 min-w-[96px] rounded-md shadow-lg ring-1 overflow-hidden`
  subContent: {
    minWidth: '96px',
    borderRadius: radius.md,
    boxShadow: SHADOW_LG_RING,
    overflow: 'hidden',
  },

  // Shared by every row: `gap-1.5 rounded-md text-sm flex cursor-default
  //  items-center outline-hidden select-none`
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    borderRadius: radius.md,
    // `py-1`
    paddingBlock: '0.25rem',
    // `text-sm`, the paired line-height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    cursor: 'default',
    userSelect: 'none',
    // `outline-hidden`: no outline, except under forced colours, where Tailwind
    // restores a transparent one (see `slider.tsx`).
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
  },

  // `px-1.5` with `data-inset:pl-7`. `px-*` is `padding-inline` and `pl-*` the
  // physical longhand, which Blink resolves over the logical property whatever
  // the source order — keeping Tailwind's own choice of property keeps that
  // resolution (`conventions.md`).
  rowPadding: {
    paddingInline: '0.375rem',
    paddingLeft: { default: null, '[data-inset]': '1.75rem' },
  },
  // `pr-8 pl-1.5` with `data-inset:pl-7`: all three are physical longhands and
  // two of them are `padding-left`, so the inset value is a condition on one
  // declaration.
  rowPaddingIndicator: {
    paddingRight: '2rem',
    paddingLeft: { default: '0.375rem', '[data-inset]': '1.75rem' },
  },

  // `focus:bg-accent focus:text-accent-foreground`
  rowFocus: {
    backgroundColor: { default: null, ':focus': colors.accent },
    color: { default: null, ':focus': colors.accentForeground },
  },
  // `data-open:bg-accent data-open:text-accent-foreground` on top of the two
  // `focus:` rules, which ask for the same colours.
  subTriggerOpen: {
    backgroundColor: { default: null, ':focus': colors.accent, [OPEN]: colors.accent },
    color: { default: null, ':focus': colors.accentForeground, [OPEN]: colors.accentForeground },
  },
  // `data-[variant=destructive]:text-destructive
  //  data-[variant=destructive]:focus:bg-destructive/10
  //  dark:data-[variant=destructive]:focus:bg-destructive/20
  //  data-[variant=destructive]:focus:text-destructive`, restating the `focus:`
  //  pair because `stylex.props` merges a property whole.
  //
  // The `dark:` rule is nested *inside* the attribute key rather than the other
  // way round: a bare attribute key is worth 5000 and `:is(.dark *)` 2040, so a
  // `dark:`-first nesting would let the light-mode rule outrank it.
  rowDestructive: {
    backgroundColor: {
      default: null,
      ':focus': colors.accent,
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
      '[data-variant="destructive"]': {
        default: colors.destructive,
        ':focus': colors.destructive,
      },
    },
  },
  // `relative data-disabled:pointer-events-none data-disabled:opacity-50`
  rowSelectable: {
    position: 'relative',
    pointerEvents: { default: null, [DISABLED]: 'none' },
    opacity: { default: null, [DISABLED]: '50%' },
  },

  // The check mark's box: `absolute right-2 flex items-center justify-center
  // pointer-events-none`
  indicator: {
    position: 'absolute',
    right: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // `ml-auto` on the submenu chevron this file renders
  subTriggerIcon: {
    marginLeft: 'auto',
  },

  // `text-muted-foreground px-1.5 py-1 text-xs font-medium data-inset:pl-7`
  label: {
    paddingInline: '0.375rem',
    paddingLeft: { default: null, '[data-inset]': '1.75rem' },
    paddingBlock: '0.25rem',
    // `text-xs`, the paired line-height as the length it resolves to
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 500,
    color: colors.mutedForeground,
  },

  // `bg-border -mx-1 my-1 h-px`
  separator: {
    backgroundColor: colors.border,
    marginInline: '-0.25rem',
    marginBlock: '0.25rem',
    height: '1px',
  },

  // `text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground
  //  ml-auto text-xs tracking-widest`
  shortcut: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0.1em',
    color: {
      default: colors.mutedForeground,
      ':is(.group\\/dropdown-menu-item:focus *)': colors.accentForeground,
    },
  },
})

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  className,
  style,
  sx: sxProp,
  align = 'start',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & { sx?: Sx }) {
  const sx = stylex.props(styles.surface, styles.content, sxProp)

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuItem({
  className,
  style,
  inset,
  variant = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
} & { sx?: Sx }) {
  const sx = stylex.props(
    styles.row,
    styles.rowPadding,
    styles.rowDestructive,
    styles.rowSelectable,
    sxProp
  )

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={[
        // `data-[variant=destructive]:*:[svg]:text-destructive` and
        // `not-data-[variant=destructive]:focus:**:text-accent-foreground` colour
        // the caller's children; `group/dropdown-menu-item` is what
        // `DropdownMenuShortcut` selects through. Removed in PR 32.
        'group/dropdown-menu-item',
        ROW_DESCENDANTS,
        ITEM_ICONS,
        sx.className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  style,
  children,
  checked,
  inset,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(
    styles.row,
    styles.rowPaddingIndicator,
    styles.rowFocus,
    styles.rowSelectable,
    sxProp
  )
  const indicator = stylex.props(styles.indicator)

  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={[
        // `focus:**:text-accent-foreground` colours the caller's children.
        FOCUS_DESCENDANTS,
        ITEM_ICONS,
        sx.className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      checked={checked}
      {...props}
    >
      <span
        className={indicator.className}
        style={indicator.style}
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({
  className,
  style,
  children,
  inset,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(
    styles.row,
    styles.rowPaddingIndicator,
    styles.rowFocus,
    styles.rowSelectable,
    sxProp
  )
  const indicator = stylex.props(styles.indicator)

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={[
        // `focus:**:text-accent-foreground` colours the caller's children.
        FOCUS_DESCENDANTS,
        ITEM_ICONS,
        sx.className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <span
        className={indicator.className}
        style={indicator.style}
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  style,
  sx: sxProp,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  sx?: Sx
  inset?: boolean
}) {
  const sx = stylex.props(styles.label, sxProp)

  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator> & { sx?: Sx }) {
  const sx = stylex.props(styles.separator, sxProp)

  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & { sx?: Sx }) {
  const sx = stylex.props(styles.shortcut, sxProp)

  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  style,
  inset,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(styles.row, styles.rowPadding, styles.subTriggerOpen, sxProp)
  const icon = stylex.props(styles.subTriggerIcon)

  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={[
        // `not-data-[variant=destructive]:focus:**:text-accent-foreground`
        // colours the caller's children.
        ROW_DESCENDANTS,
        ITEM_ICONS,
        sx.className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <ChevronRightIcon className={icon.className} style={icon.style} />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> & { sx?: Sx }) {
  const sx = stylex.props(styles.surface, styles.subContent, sxProp)

  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
