import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Command as CommandPrimitive } from 'cmdk'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
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
  // `bg-popover text-popover-foreground p-1 flex size-full flex-col
  //  overflow-hidden`. The radius stays a class; see `ROOT_RADIUS_CLASS`.
  root: {
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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: radius.sm,
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

/**
 * `rounded-xl!` on the root, kept as a Tailwind class (PR 16).
 *
 * StyleX has no way to emit `!important`, and the `!` is the whole point of the
 * class: it is what makes the radius survive a caller's own `rounded-*`. PR 32.
 */
const ROOT_RADIUS_CLASS = 'rounded-xl!'

/**
 * `no-scrollbar`, a project `@utility` (`-ms-overflow-style: none`,
 * `scrollbar-width: none` and a `::-webkit-scrollbar { display: none }` rule).
 *
 * The pseudo-element half has no StyleX equivalent that keeps the same
 * selector, and the utility is shared with `combobox.tsx` and `sidebar.tsx`, so
 * it stays a class until Tailwind goes. PR 32.
 */
const LIST_SCROLLBAR_CLASS = 'no-scrollbar'

/**
 * The `InputGroup` overrides, kept as Tailwind classes (PR 16).
 *
 * Four of the five carry `!`, and the fifth reaches into the addon `InputGroup`
 * renders. `InputGroup` is already StyleX, so these have to stay in the
 * `utilities` layer to keep winning. PR 32.
 */
const INPUT_GROUP_CLASSES =
  'bg-input/30 border-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!'

/**
 * `sr-only` on the dialog header, kept as a Tailwind class (PR 16).
 *
 * `DialogHeader` has no `sx` prop, so the only way to override its own
 * `display: flex` from here is a utility. PR 32.
 */
const DIALOG_HEADER_CLASS = 'sr-only'

/**
 * The `DialogContent` overrides, kept as Tailwind classes (PR 16).
 *
 * `translate-y-0` is the one that cannot move: `DialogContent` still carries
 * `-translate-x-1/2 -translate-y-1/2` as classes precisely because each utility
 * writes one axis into a `--tw-translate-*` variable and both read the pair
 * back (`dialog.tsx`, `CONTENT_TRANSLATE_CLASSES`). `rounded-xl!` is an
 * important, and `top-1/3`, `overflow-hidden` and `p-0` have to keep beating
 * `DialogContent`'s own StyleX declarations from `utilities`. None of them
 * needs an `sx` prop today; the pair goes when the variables do, in PR 32.
 */
const DIALOG_CONTENT_CLASSES = 'rounded-xl! top-1/3 translate-y-0 overflow-hidden p-0'

/**
 * The item rules that style something this file does not own, kept as Tailwind
 * classes (PR 16).
 *
 * `[&_svg…]` reaches the caller's icons and reads the literal text of their
 * `class` attribute; `data-selected:*:[svg]:text-foreground` colours them;
 * `in-data-[slot=dialog-content]:rounded-lg!` is an important; and
 * `group/command-item` is the hook the shortcut and the check mark select
 * through. PR 32.
 */
const ITEM_CLASSES =
  "data-selected:*:[svg]:text-foreground in-data-[slot=dialog-content]:rounded-lg! [&_svg:not([class*='size-'])]:size-4 group/command-item [&_svg]:pointer-events-none [&_svg]:shrink-0"

function Command({ className, style, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  const sx = stylex.props(styles.root)
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(ROOT_RADIUS_CLASS, sx.className, className)}
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
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className={DIALOG_HEADER_CLASS}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(DIALOG_CONTENT_CLASSES, className)}
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
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  const sx = stylex.props(styles.input)
  return (
    <div data-slot="command-input-wrapper" {...stylex.props(styles.inputWrapper)}>
      <InputGroup className={INPUT_GROUP_CLASSES}>
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(sx.className, className)}
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
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  const sx = stylex.props(styles.list)
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(LIST_SCROLLBAR_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  const sx = stylex.props(styles.empty)
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  const sx = stylex.props(styles.group, styles.groupHeading)
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  const sx = stylex.props(styles.separator)
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CommandItem({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  const sx = stylex.props(styles.item)
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(ITEM_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <CheckIcon {...stylex.props(styles.itemCheck)} />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.shortcut)
  return (
    <span
      data-slot="command-shortcut"
      className={cn(sx.className, className)}
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
