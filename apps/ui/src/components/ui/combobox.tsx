import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ChevronDownIcon, XIcon, CheckIcon } from 'lucide-react'

/** `transition-colors`' property list (see `input.tsx`). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/** `focus-within:ring-3` with `focus-within:ring-ring/50` (see `button.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** `has-aria-invalid:ring-3` with `has-aria-invalid:ring-destructive/20`. */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** the same ring at 40%, which the `dark:has-aria-invalid:` rule uses. */
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
 * `group-data-empty/combobox-content:flex`, rewritten against the popup's
 * `data-slot` now that the popup itself is StyleX: the `group/combobox-content`
 * marker class it used to select through had no other reader
 * (`conventions.md`, "switch to `[data-slot=…]` when the group owner migrates").
 */
const IN_EMPTY_CONTENT = ':is([data-slot="combobox-content"][data-empty] *)'

/**
 * `tw-animate-css`'s `enter` and `exit` keyframes with the popup's inputs
 * resolved: `data-open:fade-in-0` / `data-closed:fade-out-0` (opacity `0`),
 * `data-open:zoom-in-95` / `data-closed:zoom-out-95` (scale `.95`) and one
 * `data-[side=…]:slide-in-*` offset per side (`0.5rem`). The unset
 * `--tw-enter-*` / `--tw-exit-*` inputs are written out at their zero values so
 * the frames stay character-identical; only the animation's *name* changes when
 * it is hashed.
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
/** `data-[side=right]:slide-in-from-left-2`, `data-[side=inline-end]:slide-in-from-left-2` */
const enterFromLeft = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(-0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95) rotate(0)',
    filter: 'blur(0)',
  },
})
/** `data-[side=left]:slide-in-from-right-2`, `data-[side=inline-start]:slide-in-from-right-2` */
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
      ':is(*):not([data-variant="destructive"])[data-highlighted] *': colors.accentForeground,
    },
  },
  content: {
    backgroundColor: {
      default: null,
      ':is(*)>[data-slot="input-group"]': 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
    borderColor: {
      default: null,
      ':is(*)>[data-slot="input-group"]': 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
    margin: { default: null, ':is(*)>[data-slot="input-group"]': '0.25rem' },
    marginBottom: { default: null, ':is(*)>[data-slot="input-group"]': 0 },
    height: { default: null, ':is(*)>[data-slot="input-group"]': '2rem' },
    boxShadow: {
      default: null,
      ':is(*)>[data-slot="input-group"]': '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000',
    },
  },
})
const TRIGGER_ICON_CLASSES = stylex.props(descendantStyles.icons).className
const CONTENT_INPUT_GROUP_CLASSES = stylex.props(descendantStyles.content).className
const ITEM_CLASSES = [
  stylex.props(descendantStyles.icons).className,
  stylex.props(descendantStyles.item).className,
].join(' ')

const styles = stylex.create({
  inputGroup: { width: 'auto' },
  inputGroupButton: {
    display: {
      default: 'flex',
      ':is(.group\\/input-group:has([data-slot="combobox-clear"]) *)': 'none',
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      ':is([aria-expanded="true"])': colors.muted,
      '[data-pressed]': 'transparent',
    },
  },
  // `text-muted-foreground pointer-events-none` on the chevron this component
  // renders itself; its `size-4` stays a class, see `CHEVRON_SIZE_CLASS`.
  chevron: {
    width: '1rem',
    height: '1rem',
    color: colors.mutedForeground,
    pointerEvents: 'none',
  },

  // `pointer-events-none` on the icons this component renders itself. Their
  // size comes from the enclosing button's
  // `[&_svg:not([class*='size-'])]:size-3`, which a StyleX class does not match
  // either.
  icon: {
    pointerEvents: 'none',
  },

  // `-ml-1 opacity-50 hover:opacity-100`, passed to `Button` as `sx` rather
  // than as classes: `Button` is StyleX, so a utility class here would sit in
  // `@layer utilities` and beat its declarations instead of composing with
  // them. Restating `opacity` wholesale also drops `Button`'s
  // `disabled:opacity-50`, whose value this default already is.
  chipRemove: {
    marginLeft: '-0.25rem',
    opacity: {
      default: '50%',
      '@media (hover: hover)': { default: null, ':hover': '100%' },
    },
  },

  // `isolate z-50` on the positioner.
  positioner: {
    isolation: 'isolate',
    zIndex: 50,
  },

  // `bg-popover text-popover-foreground ring-foreground/10 overflow-hidden
  //  rounded-lg shadow-md ring-1 duration-100 relative max-h-(--available-height)
  //  w-(--anchor-width) max-w-(--available-width)
  //  min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin)
  //  data-[chips=true]:min-w-(--anchor-width)` plus the `data-open:` /
  //  `data-closed:` animation stack.
  content: {
    position: 'relative',
    overflow: 'hidden',
    maxHeight: 'var(--available-height)',
    width: 'var(--anchor-width)',
    maxWidth: 'var(--available-width)',
    minWidth: {
      default: 'calc(var(--anchor-width) + 1.75rem)',
      '[data-chips="true"]': 'var(--anchor-width)',
    },
    transformOrigin: 'var(--transform-origin)',
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
        '[data-side="inline-start"]': enterFromRight,
        '[data-side="inline-end"]': enterFromLeft,
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

  // `no-scrollbar
  //  max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))]
  //  scroll-py-1 p-1 data-empty:p-0 overflow-y-auto overscroll-contain`
  list: {
    maxHeight: 'min(15.75rem, calc(var(--available-height) - 2.25rem))',
    scrollPaddingBlock: '0.25rem',
    padding: { default: '0.25rem', '[data-empty]': '0rem' },
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    // `no-scrollbar`, a `shadcn/tailwind.css` utility.
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
  },

  // `data-highlighted:bg-accent data-highlighted:text-accent-foreground gap-2
  //  rounded-md py-1 pr-8 pl-1.5 text-sm relative flex w-full cursor-default
  //  items-center outline-hidden select-none data-disabled:pointer-events-none
  //  data-disabled:opacity-50`
  item: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: radius.md,
    paddingBlock: '0.25rem',
    paddingRight: '2rem',
    paddingLeft: '0.375rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    cursor: 'default',
    userSelect: 'none',
    backgroundColor: { default: null, '[data-highlighted]': colors.accent },
    color: { default: null, '[data-highlighted]': colors.accentForeground },
    // `outline-hidden`: no outline, except under forced colours.
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    pointerEvents: { default: null, [DATA_DISABLED]: 'none' },
    opacity: { default: null, [DATA_DISABLED]: '50%' },
  },

  // `pointer-events-none absolute right-2 flex size-4 items-center
  //  justify-center` on the span the indicator renders as.
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

  // `text-muted-foreground px-2 py-1.5 text-xs`
  label: {
    color: colors.mutedForeground,
    paddingInline: '0.5rem',
    paddingBlock: '0.375rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `text-muted-foreground hidden w-full justify-center py-2 text-center
  //  text-sm group-data-empty/combobox-content:flex`
  empty: {
    display: { default: 'none', [IN_EMPTY_CONTENT]: 'flex' },
    width: '100%',
    justifyContent: 'center',
    paddingBlock: '0.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
  },

  // `bg-border -mx-1 my-1 h-px`
  separator: {
    backgroundColor: colors.border,
    marginInline: '-0.25rem',
    marginBlock: '0.25rem',
    height: '1px',
  },

  // `dark:bg-input/30 border-input focus-within:border-ring
  //  focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20
  //  dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive
  //  dark:has-aria-invalid:border-destructive/50 flex min-h-8 flex-wrap
  //  items-center gap-1 rounded-lg border bg-transparent bg-clip-padding px-2.5
  //  py-1 text-sm transition-colors focus-within:ring-3 has-aria-invalid:ring-3
  //  has-data-[slot=combobox-chip]:px-1`
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.25rem',
    minHeight: '2rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundClip: 'padding-box',
    paddingInline: {
      default: '0.625rem',
      ':has([data-slot="combobox-chip"])': '0.25rem',
    },
    paddingBlock: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    backgroundColor: {
      default: 'transparent',
      ':is(.dark *)': 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
    // The `has-aria-invalid:` utilities are emitted after the `focus-within:`
    // ones and the `dark:` ones after both, so an invalid group keeps its
    // colour while focused; the combination is nested rather than left to the
    // order two same-priority StyleX rules happen to be emitted in.
    borderColor: {
      default: colors.input,
      ':focus-within': colors.ring,
      ':has([aria-invalid="true"])': {
        default: colors.destructive,
        ':focus-within': colors.destructive,
      },
      ':is(.dark *)': {
        default: null,
        ':has([aria-invalid="true"])': {
          default: 'color-mix(in oklab, var(--destructive) 50%, transparent)',
          ':focus-within': 'color-mix(in oklab, var(--destructive) 50%, transparent)',
        },
      },
    },
    boxShadow: {
      default: null,
      ':focus-within': RING_FOCUS,
      ':has([aria-invalid="true"])': {
        default: RING_DESTRUCTIVE_20,
        ':focus-within': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':has([aria-invalid="true"])': {
          default: RING_DESTRUCTIVE_40,
          ':focus-within': RING_DESTRUCTIVE_40,
        },
      },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },

  // `bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center
  //  justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap
  //  has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none
  //  has-disabled:cursor-not-allowed has-disabled:opacity-50`
  chip: {
    display: 'flex',
    width: 'fit-content',
    height: '1.3125rem',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    borderRadius: radius.sm,
    paddingInline: '0.375rem',
    // `has-data-[slot=combobox-chip-remove]:pr-0` writes the physical longhand
    // and `px-1.5` the logical property, so Blink resolves the right padding to
    // zero whatever the source order — Tailwind's own choice of properties, kept.
    paddingRight: {
      default: null,
      ':has([data-slot="combobox-chip-remove"])': '0rem',
    },
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: colors.muted,
    color: colors.foreground,
    pointerEvents: { default: null, ':has(:disabled)': 'none' },
    cursor: { default: null, ':has(:disabled)': 'not-allowed' },
    opacity: { default: null, ':has(:disabled)': '50%' },
  },

  // `min-w-16 flex-1 outline-none`
  chipsInput: {
    minWidth: '4rem',
    // `flex-1` compiles to the `flex: 1` shorthand in Tailwind v4 (see
    // `progress.tsx`); the computed longhands are the same either way.
    flex: 1,
    outlineStyle: 'none',
  },
})

const Combobox = ComboboxPrimitive.Root

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
  className,
  style,
  children,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Trigger.Props & { sx?: Sx }) {
  const sx = stylex.props(sxProp)
  const icon = stylex.props(styles.chevron)

  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={[TRIGGER_ICON_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={
        typeof style === 'function'
          ? (state) => ({ ...sx.style, ...style(state) })
          : sx.style || style
            ? { ...sx.style, ...style }
            : undefined
      }
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={['size-explicit', icon.className].filter(Boolean).join(' ')}
        style={icon.style}
      />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Clear.Props & { sx?: Sx }) {
  const sx = stylex.props(sxProp)
  const icon = stylex.props(styles.icon)

  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={
        typeof style === 'function'
          ? (state) => ({ ...sx.style, ...style(state) })
          : sx.style || style
            ? { ...sx.style, ...style }
            : undefined
      }
      {...props}
    >
      <XIcon className={icon.className} style={icon.style} />
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxInput({
  className,
  sx: sxProp,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  sx?: Sx
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <InputGroup
      sx={[styles.inputGroup, sxProp]}
      className={typeof className === 'string' ? className : undefined}
    >
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            sx={styles.inputGroupButton}
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  style,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  > & { sx?: Sx }) {
  const positioner = stylex.props(styles.positioner)
  const sx = stylex.props(styles.content, sxProp)

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={positioner.className}
        style={positioner.style}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={[CONTENT_INPUT_GROUP_CLASSES, sx.className, className]
            .filter(Boolean)
            .join(' ')}
          style={sx.style || style ? { ...sx.style, ...style } : undefined}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.List.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.list, sxProp)

  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  style,
  children,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Item.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.item, sxProp)
  const indicator = stylex.props(styles.itemIndicator)
  const icon = stylex.props(styles.icon)

  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={[ITEM_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={<span className={indicator.className} style={indicator.style} />}
      >
        <CheckIcon className={icon.className} style={icon.style} />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Group.Props & { sx?: Sx }) {
  const sx = stylex.props(sxProp)
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={
        typeof style === 'function'
          ? (state) => ({ ...sx.style, ...style(state) })
          : sx.style || style
            ? { ...sx.style, ...style }
            : undefined
      }
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.GroupLabel.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.label, sxProp)

  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

function ComboboxEmpty({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Empty.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.empty, sxProp)

  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Separator.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.separator, sxProp)

  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.chips, sxProp)

  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  style,
  children,
  showRemove = true,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
} & { sx?: Sx }) {
  const sx = stylex.props(styles.chip, sxProp)
  const icon = stylex.props(styles.icon)

  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" sx={styles.chipRemove} />}
          data-slot="combobox-chip-remove"
        >
          <XIcon className={icon.className} style={icon.style} />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  style,
  sx: sxProp,
  ...props
}: ComboboxPrimitive.Input.Props & { sx?: Sx }) {
  const sx = stylex.props(styles.chipsInput, sxProp)

  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
