import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Select as SelectPrimitive } from 'radix-ui'

import { colors, motion, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react'

/** `transition-colors`' property list (see `input.tsx`). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/** `focus-visible:ring-3` with `focus-visible:ring-ring/50` (see `button.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** `aria-invalid:ring-3` with `aria-invalid:ring-destructive/20`. */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** the same ring at 40%, which every `dark:aria-invalid:` rule uses. */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'
/** `shadow-md` layered under `ring-1 ring-foreground/10`, as one composed chain. */
const RING_1_SHADOW_MD =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'

/**
 * `data-open:` / `data-closed:` / `data-disabled:`, the `shadcn/tailwind.css`
 * custom variants, in the exact shape they compile to (`tailwind-values.md` §9).
 */
const OPEN = ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'
const CLOSED =
  ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))'
const DATA_DISABLED =
  ':is(:where([data-disabled="true"]), :where([data-disabled]:not([data-disabled="false"])))'

/**
 * `tw-animate-css`'s `enter` and `exit` keyframes, with the inputs the
 * content's utilities feed them resolved: `data-open:fade-in-0` and
 * `data-closed:fade-out-0` (opacity `0`), `data-open:zoom-in-95` and
 * `data-closed:zoom-out-95` (scale `.95`), and one `data-[side=…]:slide-in-*`
 * offset per side (`0.5rem`). Every other `--tw-enter-*`/`--tw-exit-*` input
 * keeps its default, which is why the translate, rotate and blur slots are
 * written out at their zero values: the frames have to stay
 * character-identical, only the animation's *name* changes when it is hashed
 * (`conventions.md`, "Animations: the name is the one value that changes").
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
/** `data-closed:fade-out-0 data-closed:zoom-out-95`; nothing sets an exit translate. */
const exit = stylex.keyframes({
  to: {
    opacity: 0,
    transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})

const descendantStyles = stylex.create({
  icons: {
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    pointerEvents: { default: null, ':is(*) svg': 'none' },
    flexShrink: { default: null, ':is(*) svg': 0 },
  },
  item: {
    color: {
      default: null,
      ':is(*):not([data-variant="destructive"]):focus *': colors.accentForeground,
    },
    display: { default: null, ':is(*)>span:last-child': 'flex' },
    alignItems: { default: null, ':is(*)>span:last-child': 'center' },
    gap: { default: null, ':is(*)>span:last-child': '0.5rem' },
  },
})
const TRIGGER_CLASSES = stylex.props(descendantStyles.icons).className
const ITEM_CLASSES = [
  stylex.props(descendantStyles.icons).className,
  stylex.props(descendantStyles.item).className,
].join(' ')
const SCROLL_BUTTON_CLASSES = stylex.props(descendantStyles.icons).className

/**
 * `*:data-[slot=select-value]:…`, the four rules the trigger writes on the span
 * `SelectValue` renders.
 *
 * They stay on the trigger, as StyleX descendant keys, because that span is not
 * addressable from the child side: `radix-ui`'s `Select.Value` destructures
 * `className` and `style` out of its props and drops them, forcing
 * `style={{ pointerEvents: 'none' }}` of its own. Nothing can contest these
 * rules for the same reason, so the layer they land in does not matter.
 */
const VALUE_CHILD = ':is(*)>[data-slot="select-value"]'

const styles = stylex.create({
  // `scroll-my-1 p-1`
  group: {
    scrollMarginBlock: '0.25rem',
    padding: '0.25rem',
  },

  // `border-input data-placeholder:text-muted-foreground dark:bg-input/30
  //  dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50
  //  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
  //  aria-invalid:border-destructive dark:aria-invalid:border-destructive/50
  //  gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 transition-colors
  //  select-none focus-visible:ring-3 aria-invalid:ring-3
  //  data-[size=sm]:rounded-[min(var(--radius-md),10px)] flex items-center
  //  justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed
  //  disabled:opacity-50`
  trigger: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    width: 'fit-content',
    height: { default: null, '[data-size="default"]': '2rem', '[data-size="sm"]': '1.75rem' },
    display: { default: 'flex', [VALUE_CHILD]: 'flex' },
    alignItems: { default: 'center', [VALUE_CHILD]: 'center' },
    justifyContent: 'space-between',
    gap: { default: '0.375rem', [VALUE_CHILD]: '0.375rem' },
    whiteSpace: 'nowrap',
    // `*:data-[slot=select-value]:line-clamp-1` — `overflow: hidden` is what
    // takes the span's automatic minimum size to zero and lets the flex line
    // clip; `display: flex` above is emitted after the clamp's own
    // `display: -webkit-box` and wins, exactly as the two utilities do today,
    // so the two `-webkit-` declarations are inert but kept.
    overflow: { default: null, [VALUE_CHILD]: 'hidden' },
    WebkitLineClamp: { default: null, [VALUE_CHILD]: 1 },
    WebkitBoxOrient: { default: null, [VALUE_CHILD]: 'vertical' },
    borderRadius: {
      default: radius.lg,
      '[data-size="sm"]': 'min(calc(var(--radius) - 2px), 10px)',
    },
    borderWidth: '1px',
    borderStyle: 'solid',
    paddingBlock: '0.5rem',
    paddingRight: '0.5rem',
    paddingLeft: '0.625rem',
    color: {
      default: null,
      '[data-placeholder]': colors.mutedForeground,
    },
    backgroundColor: {
      default: 'transparent',
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
        '@media (hover: hover)': {
          default: null,
          ':hover': 'color-mix(in oklab, var(--input) 50%, transparent)',
        },
      },
    },
    // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
    // they win when a trigger is both; the combination is nested rather than
    // left to the order two same-priority StyleX rules happen to be emitted in.
    borderColor: {
      default: colors.input,
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': {
        default: colors.destructive,
        ':focus-visible': colors.destructive,
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default: 'color-mix(in oklab, var(--destructive) 50%, transparent)',
          ':focus-visible': 'color-mix(in oklab, var(--destructive) 50%, transparent)',
        },
      },
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      ':is([aria-invalid="true"])': {
        default: RING_DESTRUCTIVE_20,
        ':focus-visible': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default: RING_DESTRUCTIVE_40,
          ':focus-visible': RING_DESTRUCTIVE_40,
        },
      },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    userSelect: 'none',
    outlineStyle: 'none',
    cursor: {
      default: null,
      ':disabled': 'not-allowed',
    },
    opacity: {
      default: null,
      ':disabled': '50%',
    },
  },

  // `text-muted-foreground size-4 pointer-events-none` on the icon this
  // component renders itself.
  chevron: {
    color: colors.mutedForeground,
    width: '1rem',
    height: '1rem',
    pointerEvents: 'none',
  },

  // `bg-popover p-0.5 text-popover-foreground ring-foreground/10 min-w-36
  //  rounded-lg shadow-md ring-1 duration-100 relative z-50
  //  max-h-(--radix-select-content-available-height)
  //  origin-(--radix-select-content-transform-origin) overflow-x-hidden
  //  overflow-y-auto` plus the `data-open:`/`data-closed:` animation stack.
  content: {
    position: 'relative',
    zIndex: 50,
    minWidth: '9rem',
    maxHeight: 'var(--radix-select-content-available-height)',
    transformOrigin: 'var(--radix-select-content-transform-origin)',
    overflowX: 'hidden',
    overflowY: 'auto',
    padding: '0.125rem',
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: RING_1_SHADOW_MD,
    // `duration-100` writes `transition-duration` as well as the `--tw-duration`
    // the animation shorthand reads.
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
    animationDuration: { default: null, [OPEN]: '100ms', [CLOSED]: '100ms' },
    animationTimingFunction: { default: null, [OPEN]: 'ease', [CLOSED]: 'ease' },
    animationDelay: { default: null, [OPEN]: '0s', [CLOSED]: '0s' },
    animationIterationCount: { default: null, [OPEN]: 1, [CLOSED]: 1 },
    animationDirection: { default: null, [OPEN]: 'normal', [CLOSED]: 'normal' },
    animationFillMode: { default: null, [OPEN]: 'none', [CLOSED]: 'none' },
  },

  // `data-[align-trigger=true]:animate-none`. The attribute is `true` for
  // exactly the item-aligned position, and `animation: none` is a shorthand, so
  // every longhand the enter/exit rules set is restated at its initial value.
  contentAlignTrigger: {
    animationName: 'none',
    animationDuration: '0s',
    animationTimingFunction: 'ease',
    animationDelay: '0s',
    animationIterationCount: 1,
    animationDirection: 'normal',
    animationFillMode: 'none',
  },

  // `data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1
  //  data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1`, the
  //  popper-only offsets.
  contentPopper: {
    translate: {
      default: null,
      '[data-side="bottom"]': '0 0.25rem',
      '[data-side="left"]': '-0.25rem 0',
      '[data-side="right"]': '0.25rem 0',
      '[data-side="top"]': '0 -0.25rem',
    },
  },

  // `data-[position=popper]:h-(--radix-select-trigger-height)
  //  data-[position=popper]:w-full
  //  data-[position=popper]:min-w-(--radix-select-trigger-width)`
  viewport: {
    height: {
      default: null,
      '[data-position="popper"]': 'var(--radix-select-trigger-height)',
    },
    width: {
      default: null,
      '[data-position="popper"]': '100%',
    },
    minWidth: {
      default: null,
      '[data-position="popper"]': 'var(--radix-select-trigger-width)',
    },
  },

  // `text-muted-foreground px-1.5 py-1 text-xs`
  label: {
    color: colors.mutedForeground,
    paddingInline: '0.375rem',
    paddingBlock: '0.25rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-md py-1 pr-8
  //  pl-1.5 text-sm relative flex w-full cursor-default items-center
  //  outline-hidden select-none data-disabled:pointer-events-none
  //  data-disabled:opacity-50`
  item: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '0.375rem',
    borderRadius: radius.md,
    paddingBlock: '0.25rem',
    paddingRight: '2rem',
    paddingLeft: '0.375rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    cursor: 'default',
    userSelect: 'none',
    backgroundColor: { default: null, ':focus': colors.accent },
    color: { default: null, ':focus': colors.accentForeground },
    // `outline-hidden`: no outline, except under forced colours.
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    pointerEvents: { default: null, [DATA_DISABLED]: 'none' },
    opacity: { default: null, [DATA_DISABLED]: '50%' },
  },

  // `pointer-events-none absolute right-2 flex size-4 items-center
  //  justify-center`
  itemIndicator: {
    pointerEvents: 'none',
    position: 'absolute',
    right: '0.5rem',
    display: 'flex',
    width: '1rem',
    height: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // `pointer-events-none` on the check this component renders itself. Its size
  // still comes from the item's `[&_svg:not([class*='size-'])]:size-4`, which
  // the StyleX class does not match either.
  itemCheck: {
    pointerEvents: 'none',
  },

  // `bg-border -mx-1 my-1 h-px pointer-events-none`
  separator: {
    backgroundColor: colors.border,
    marginInline: '-0.25rem',
    marginBlock: '0.25rem',
    height: '1px',
    pointerEvents: 'none',
  },

  // `bg-popover z-10 flex cursor-default items-center justify-center py-1`
  scrollButton: {
    backgroundColor: colors.popover,
    zIndex: 10,
    display: 'flex',
    cursor: 'default',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: '0.25rem',
  },
})

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group> & { sx?: Sx }) {
  const sx = stylex.props(styles.group, sxProp)

  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  style,
  sx: sxProp,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  sx?: Sx
  size?: 'sm' | 'default'
}) {
  const sx = stylex.props(styles.trigger, sxProp)
  const icon = stylex.props(styles.chevron)

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={['w-explicit', TRIGGER_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={icon.className} style={icon.style} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  style,
  children,
  position = 'item-aligned',
  align = 'center',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & { sx?: Sx }) {
  const sx = stylex.props(
    styles.content,
    position === 'item-aligned' && styles.contentAlignTrigger,
    position === 'popper' && styles.contentPopper,
    sxProp
  )
  const viewport = stylex.props(styles.viewport)

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === 'item-aligned'}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={viewport.className}
          style={viewport.style}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label> & { sx?: Sx }) {
  const sx = stylex.props(styles.label, sxProp)

  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SelectItem({
  className,
  style,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & { sx?: Sx }) {
  const sx = stylex.props(styles.item, sxProp)
  const indicator = stylex.props(styles.itemIndicator)
  const check = stylex.props(styles.itemCheck)

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={[ITEM_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <span className={indicator.className} style={indicator.style}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className={check.className} style={check.style} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator> & { sx?: Sx }) {
  const sx = stylex.props(styles.separator, sxProp)

  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton> & { sx?: Sx }) {
  const sx = stylex.props(styles.scrollButton, sxProp)

  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={[SCROLL_BUTTON_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton> & { sx?: Sx }) {
  const sx = stylex.props(styles.scrollButton, sxProp)

  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={[SCROLL_BUTTON_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
