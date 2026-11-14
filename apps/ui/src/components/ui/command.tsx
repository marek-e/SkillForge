import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'
import { Command as CommandPrimitive } from 'cmdk'

import { colors, radius } from '@/styles/tokens.stylex'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { SearchIcon, CheckIcon } from 'lucide-react'

/**
 * `data-selected:`, a `shadcn/tailwind.css` custom variant that expands to the
 * single selector `&:where([data-selected="true"])`
 * ([`tailwind-values.md`](../../../../../docs/stylex-migration/tailwind-values.md) §9). cmdk
 * writes that attribute on the highlighted item and on nothing else, and no
 * other rule in this file contests the two properties it drives, so the modest
 * `:is()` form is enough.
 */
const SELECTED = ':is([data-selected="true"])'

/** `data-[disabled=true]:`, Tailwind's arbitrary data variant with a value. */
const DISABLED = '[data-disabled="true"]'

/**
 * `**:[[cmdk-group-heading]]:` — every descendant carrying cmdk's
 * `cmdk-group-heading` attribute.
 *
 * The heading element is rendered by cmdk *inside* the group this file owns and
 * carries no class of its own, so nothing can outrank the rule from the
 * `utilities` layer and it is safe to move. It is the one descendant key in
 * this file (`conventions.md`, "Selector mapping").
 */
const GROUP_HEADING = ':is(*) [cmdk-group-heading]'

/** `group-data-[checked=true]/command-item:` on the check mark. */
const ITEM_CHECKED = ':is(.group\\/command-item[data-checked="true"] *)'

/** `group-has-data-[slot=command-shortcut]/command-item:` on the check mark. */
const ITEM_HAS_SHORTCUT = ':is(.group\\/command-item:has([data-slot="command-shortcut"]) *)'

/** `group-data-selected/command-item:` on the shortcut. */
const ITEM_SELECTED = ':is(.group\\/command-item[data-selected="true"] *)'

const styles = stylex.create({
  rootRadius: { borderRadius: radius.xl },
  dialogHeader: {
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
  dialogContent: {
    borderRadius: radius.xl,
    top: 'calc(100% / 3)',
    translate: '-50% 0px',
    overflow: 'hidden',
    padding: 0,
  },
  inputGroup: {
    backgroundColor: {
      default: 'color-mix(in oklab, var(--input) 30%, transparent)',
      ':has(:disabled)': 'color-mix(in oklab, var(--input) 50%, transparent)',
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
        ':has(:disabled)': 'color-mix(in oklab, var(--input) 80%, transparent)',
      },
    },
    borderColor: {
      default: 'color-mix(in oklab, var(--input) 30%, transparent)',
      ':has([data-slot="input-group-control"]:focus-visible)': colors.ring,
      ':has([data-slot][aria-invalid="true"])': colors.destructive,
    },
    height: '2rem',
    borderRadius: radius.lg,
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000',
    paddingLeft: { default: null, ':is(*)>[data-slot="input-group-addon"]': '0.5rem' },
  },
  // `bg-popover text-popover-foreground p-1 flex size-full flex-col
  //  overflow-hidden`. The radius stays a class; see `ROOT_RADIUS_CLASS`.
  root: {
    borderRadius: radius.xl,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    padding: '0.25rem',
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
  },

  // `p-1 pb-0` on the wrapper this file renders around the input group. `p-*`
  // is the shorthand and `pb-*` the physical longhand, which is Tailwind's own
  // choice of property and therefore kept (`conventions.md`, "Value traps").
  inputWrapper: {
    padding: '0.25rem',
    paddingBottom: 0,
  },

  // `w-full text-sm outline-hidden disabled:cursor-not-allowed
  //  disabled:opacity-50`
  input: {
    width: '100%',
    // the paired line height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    // `outline-hidden`: longhands plus the forced-colors branch (§5)
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    cursor: { default: null, ':disabled': 'not-allowed' },
    opacity: { default: null, ':disabled': '50%' },
  },

  // `size-4 shrink-0 opacity-50` on the magnifier this file renders.
  //
  // `InputGroupAddon` also sizes it, through
  // `[&>svg:not([class*='size-'])]:size-4` — a rule the hashed class now
  // matches where the literal `size-4` did not. Both ask for the same `1rem`,
  // so the box is unchanged; the addon's copy simply wins from `utilities`.
  searchIcon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    opacity: '50%',
  },

  // `max-h-72 scroll-py-1 outline-none overflow-x-hidden overflow-y-auto`.
  // `no-scrollbar` stays a class; see `LIST_SCROLLBAR_CLASS`.
  list: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
    maxHeight: '18rem',
    scrollPaddingBlock: '0.25rem',
    overflowX: 'hidden',
    overflowY: 'auto',
    // `outline-none` also sets `--tw-outline-style: none`, which nothing reads
    // back here.
    outlineStyle: 'none',
  },

  // `py-6 text-center text-sm`
  empty: {
    paddingBlock: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `text-foreground overflow-hidden p-1`, plus the heading colour, which has
  // to sit in the same object as the group's own `color` because
  // `stylex.props` merges a property whole.
  group: {
    overflow: 'hidden',
    padding: '0.25rem',
    color: { default: colors.foreground, [GROUP_HEADING]: colors.mutedForeground },
  },
  // `**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5
  //  **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium`
  groupHeading: {
    paddingInline: { default: null, [GROUP_HEADING]: '0.5rem' },
    paddingBlock: { default: null, [GROUP_HEADING]: '0.375rem' },
    fontSize: { default: null, [GROUP_HEADING]: '0.75rem' },
    lineHeight: { default: null, [GROUP_HEADING]: '1rem' },
    fontWeight: { default: null, [GROUP_HEADING]: 500 },
  },

  // `bg-border -mx-1 h-px`
  separator: {
    backgroundColor: colors.border,
    marginInline: '-0.25rem',
    height: '1px',
  },

  // `data-selected:bg-muted data-selected:text-foreground relative flex
  //  cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm
  //  outline-hidden select-none data-[disabled=true]:pointer-events-none
  //  data-[disabled=true]:opacity-50`
  item: {
    borderRadius: { default: radius.sm, ':is([data-slot="dialog-content"] *)': radius.lg },
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingInline: '0.5rem',
    paddingBlock: '0.375rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    cursor: 'default',
    userSelect: 'none',
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    backgroundColor: { default: null, [SELECTED]: colors.muted },
    color: { default: null, [SELECTED]: colors.foreground },
    // the icon rule that stays a class also writes `pointer-events`, on a
    // different element and with the same value
    pointerEvents: { default: null, [DISABLED]: 'none' },
    opacity: { default: null, [DISABLED]: '50%' },
  },

  // `ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden
  //  group-data-[checked=true]/command-item:opacity-100` on the check mark this
  // file renders. Its size still comes from the item's
  // `[&_svg:not([class*='size-'])]:size-4`, which it matched before and matches
  // now — it carries no width or height of its own either way.
  itemCheck: {
    marginLeft: 'auto',
    opacity: { default: '0%', [ITEM_CHECKED]: '100%' },
    display: { default: null, [ITEM_HAS_SHORTCUT]: 'none' },
  },

  // `text-muted-foreground group-data-selected/command-item:text-foreground
  //  ml-auto text-xs tracking-widest`
  //
  // `tracking-widest` also publishes `--tw-tracking`, which only a paired
  // `text-*` utility on the same element would read back; there is none.
  shortcut: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0.1em',
    color: { default: colors.mutedForeground, [ITEM_SELECTED]: colors.foreground },
  },
})

const descendantStyles = stylex.create({
  item: {
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    pointerEvents: { default: null, ':is(*) svg': 'none' },
    flexShrink: { default: null, ':is(*) svg': 0 },
    color: { default: null, ':is([data-selected="true"])>svg': colors.foreground },
  },
})
const ITEM_CLASSES = stylex.props(descendantStyles.item).className

function Command({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive> & { sx?: Sx }) {
  const sx = stylex.props(styles.root, sxProp, styles.rootRadius)
  return (
    <CommandPrimitive
      data-slot="command"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  sx?: Sx
}) {
  return (
    <Dialog {...props}>
      <DialogHeader sx={styles.dialogHeader}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={className}
        sx={[styles.dialogContent, sxProp, styles.rootRadius]}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & { sx?: Sx }) {
  const sx = stylex.props(styles.input, sxProp)
  return (
    <div data-slot="command-input-wrapper" {...stylex.props(styles.inputWrapper)}>
      <InputGroup sx={styles.inputGroup}>
        <CommandPrimitive.Input
          data-slot="command-input"
          className={[sx.className, className].filter(Boolean).join(' ')}
          style={sx.style || style ? { ...sx.style, ...style } : undefined}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon {...stylex.props(styles.searchIcon)} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List> & { sx?: Sx }) {
  const sx = stylex.props(styles.list, sxProp)
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty> & { sx?: Sx }) {
  const sx = stylex.props(styles.empty, sxProp)
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> & { sx?: Sx }) {
  const sx = stylex.props(styles.group, styles.groupHeading, sxProp)
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator> & { sx?: Sx }) {
  const sx = stylex.props(styles.separator, sxProp)
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandItem({
  className,
  style,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & { sx?: Sx }) {
  const sx = stylex.props(styles.item, sxProp)
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={['group/command-item', ITEM_CLASSES, sx.className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <CheckIcon {...stylex.props(styles.itemCheck)} />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & { sx?: Sx }) {
  const sx = stylex.props(styles.shortcut, sxProp)
  return (
    <span
      data-slot="command-shortcut"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
