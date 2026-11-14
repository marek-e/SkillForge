import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui'

import { colors, radius } from '@/styles/tokens.stylex'
import { ChevronRightIcon, CheckIcon } from 'lucide-react'

/** `data-open:` / `data-closed:` / `data-disabled:`, the `shadcn/tailwind.css` custom variants. */
const OPEN = ':is([data-state="open"], [data-open]:not([data-open="false"]))'
const CLOSED = ':is([data-state="closed"], [data-closed]:not([data-closed="false"]))'
const DISABLED = ':is([data-disabled="true"], [data-disabled]:not([data-disabled="false"]))'

/**
 * The composed `enter` / `exit` frames of `tw-animate-css`, one keyframe set
 * per combination this component can produce. Identical to `dropdown-menu.tsx`,
 * where the mechanism is documented; StyleX hashes keyframes by content, so the
 * two files share the emitted `@keyframes` blocks.
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
/** `data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95` */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

/**
 * `shadow-md ring-1 ring-foreground/10` on the content, and a plain `shadow-lg`
 * on the sub-content, whose ring slot keeps its `0 0 #0000` default because it
 * has no `ring-*` class (`tailwind-values.md` §5/§6).
 */
const SHADOW_MD_RING =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
const SHADOW_LG =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'

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
      ':is(*):not([data-variant="destructive"]):focus>svg': colors.accentForeground,
    },
  },
})
const ITEM_ICONS = stylex.props(descendantStyles.icons).className
const ROW_DESCENDANTS = stylex.props(descendantStyles.rowDescendants).className

const styles = stylex.create({
  // Shared by `ContextMenuContent` and `ContextMenuSubContent`:
  // `data-open:animate-in data-closed:animate-out data-closed:fade-out-0
  //  data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95
  //  data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
  //  data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
  //  bg-popover text-popover-foreground p-1 duration-100 z-50
  //  origin-(--radix-context-menu-content-transform-origin)`
  surface: {
    zIndex: 50,
    padding: '0.25rem',
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    transformOrigin: 'var(--radix-context-menu-content-transform-origin)',
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
    // `enter|exit <duration> ease 0s 1 normal none` (see `dropdown-menu.tsx`,
    // including why the theme variable behind the two utilities is not named).
    animationDuration: '100ms',
    animationTimingFunction: 'ease',
    animationDelay: '0s',
    animationIterationCount: 1,
    animationDirection: 'normal',
    animationFillMode: 'none',
  },

  // `ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1
  //  max-h-(--radix-context-menu-content-available-height) overflow-x-hidden
  //  overflow-y-auto`
  content: {
    minWidth: '9rem',
    maxHeight: 'var(--radix-context-menu-content-available-height)',
    borderRadius: radius.lg,
    boxShadow: SHADOW_MD_RING,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  // `min-w-32 rounded-lg border shadow-lg overflow-hidden`
  subContent: {
    minWidth: '8rem',
    borderRadius: radius.lg,
    // `border`: width and style only; the colour keeps coming from preflight.
    borderWidth: '1px',
    borderStyle: 'solid',
    boxShadow: SHADOW_LG,
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
  // the source order (`conventions.md`).
  rowPadding: {
    paddingInline: '0.375rem',
    paddingLeft: { default: null, '[data-inset]': '1.75rem' },
  },
  // `pr-8 pl-1.5` with `data-inset:pl-7`: two `padding-left` declarations, so
  // the inset value is a condition on one of them.
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
  // The `dark:` rule is nested *inside* the attribute key: a bare attribute key
  // is worth 5000 and `:is(.dark *)` 2040, so a `dark:`-first nesting would let
  // the light-mode rule outrank it.
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

  // The check mark's box: `absolute right-2 pointer-events-none`. Unlike the
  // dropdown menu's, it is not a flex container — a frozen difference between
  // the two files, kept.
  indicator: {
    position: 'absolute',
    right: '0.5rem',
    pointerEvents: 'none',
  },
  // `ml-auto` on the submenu chevron this file renders
  subTriggerIcon: {
    marginLeft: 'auto',
  },

  // `select-none` on the trigger
  trigger: {
    userSelect: 'none',
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

  // `text-muted-foreground group-focus/context-menu-item:text-accent-foreground
  //  ml-auto text-xs tracking-widest`
  shortcut: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0.1em',
    color: {
      default: colors.mutedForeground,
      ':is(.group\\/context-menu-item:focus *)': colors.accentForeground,
    },
  },
})

function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger> & { sx?: Sx }) {
  const sx = stylex.props(styles.trigger, sxProp)

  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ContextMenuGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

function ContextMenuPortal({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

function ContextMenuSub({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

function ContextMenuContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
} & { sx?: Sx }) {
  const sx = stylex.props(styles.surface, styles.content, sxProp)

  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  style,
  inset,
  variant = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
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
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={[
        // `data-[variant=destructive]:*:[svg]:text-destructive` and
        // `focus:*:[svg]:text-accent-foreground` colour the caller's children;
        // `group/context-menu-item` is what `ContextMenuShortcut` selects
        // through. Removed in PR 32.
        'group/context-menu-item',
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

function ContextMenuSubTrigger({
  className,
  style,
  inset,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(styles.row, styles.rowPadding, styles.subTriggerOpen, sxProp)
  const icon = stylex.props(styles.subTriggerIcon)

  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={[ITEM_ICONS, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <ChevronRightIcon className={icon.className} style={icon.style} />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent> & { sx?: Sx }) {
  const sx = stylex.props(styles.surface, styles.subContent, sxProp)

  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  style,
  children,
  checked,
  inset,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
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
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={[ITEM_ICONS, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      checked={checked}
      {...props}
    >
      <span className={indicator.className} style={indicator.style}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  style,
  children,
  inset,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
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
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={[ITEM_ICONS, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <span className={indicator.className} style={indicator.style}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  style,
  inset,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(styles.label, sxProp)

  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator> & { sx?: Sx }) {
  const sx = stylex.props(styles.separator, sxProp)

  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & { sx?: Sx }) {
  const sx = stylex.props(styles.shortcut, sxProp)

  return (
    <span
      data-slot="context-menu-shortcut"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
