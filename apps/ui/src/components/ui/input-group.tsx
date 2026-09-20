import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/**
 * `shadow-none`, as the five-layer chain it composes.
 *
 * `InputGroupButton` carries it so a button inside a group has no shadow of its
 * own. Every layer is `0 0 #0000`, which is also what the button computes
 * today, so the computed-style snapshot keeps its value.
 */
const SHADOW_NONE = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000'
/** `focus-visible:ring-3` with `focus-visible:ring-ring/50` (see `button.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** the destructive ring at 20% — every `aria-invalid:` ring, and the destructive variant's focus ring */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** the destructive ring at 40%, used by every `dark:` ring rule */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

const styles = stylex.create({
  // `group/input-group relative flex w-full min-w-0 items-center outline-none
  //  h-8 rounded-lg border border-input transition-colors
  //  has-[>[data-align=block-*]]:h-auto/flex-col has-[>textarea]:h-auto
  //  dark:bg-input/30 has-disabled:bg-input/50 dark:has-disabled:bg-input/80
  //  has-disabled:opacity-50`
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: '0rem',
    height: {
      default: '2rem',
      ':has(>[data-align="block-end"])': 'auto',
      ':has(>[data-align="block-start"])': 'auto',
      ':has(>textarea)': 'auto',
    },
    flexDirection: {
      default: null,
      ':has(>[data-align="block-end"])': 'column',
      ':has(>[data-align="block-start"])': 'column',
    },
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-input` only; the three conditional border colours stay Tailwind,
    // see `CONTESTED_CLASSES`.
    borderColor: colors.input,
    backgroundColor: {
      default: null,
      ':has(:disabled)': 'color-mix(in oklab, var(--input) 50%, transparent)',
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
        // `dark:has-disabled:bg-input/80` is (0,3,0) and beats both
        // `has-disabled:bg-input/50` and `dark:bg-input/30`.
        ':has(:disabled)': 'color-mix(in oklab, var(--input) 80%, transparent)',
      },
    },
    opacity: {
      default: null,
      ':has(:disabled)': '50%',
    },
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    outlineStyle: 'none',
    // `has-[>[data-align=block-end]]:[&>input]:pt-3`,
    // `has-[>[data-align=block-start]]:[&>input]:pb-3`,
    // `has-[>[data-align=inline-end]]:[&>input]:pr-1.5`,
    // `has-[>[data-align=inline-start]]:[&>input]:pl-1.5`.
    // These reach the group's own `<input>` child, which is an `Input` — a
    // component this PR migrates — and a conditional StyleX rule is emitted
    // after the child's unconditional padding, so it still wins.
    paddingTop: { default: null, ':has(>[data-align="block-end"])>input': '0.75rem' },
    paddingBottom: { default: null, ':has(>[data-align="block-start"])>input': '0.75rem' },
    paddingRight: { default: null, ':has(>[data-align="inline-end"])>input': '0.375rem' },
    paddingLeft: { default: null, ':has(>[data-align="inline-start"])>input': '0.375rem' },
  },

  // addon base: `text-muted-foreground h-auto gap-2 py-1.5 font-medium
  //  group-data-[disabled=true]/input-group:opacity-50 flex cursor-text
  //  items-center justify-center select-none`
  // (`text-sm` stays a class; see `ADDON_CHILD_CLASSES`.)
  addon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    gap: '0.5rem',
    paddingTop: '0.375rem',
    paddingBottom: '0.375rem',
    fontWeight: 500,
    color: colors.mutedForeground,
    cursor: 'text',
    userSelect: 'none',
    // `group-data-[disabled=true]/input-group:opacity-50`. `InputGroup` never
    // writes `data-disabled`, so this never matches; kept as it is.
    opacity: {
      default: null,
      ':is(.group\\/input-group[data-disabled="true"] *)': '50%',
    },
  },
  // `pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first`
  addonInlineStart: {
    paddingLeft: '0.5rem',
    marginLeft: {
      default: null,
      ':has(>button)': '-0.3rem',
      ':has(>kbd)': '-0.15rem',
    },
    order: -9999,
  },
  // `pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last`
  addonInlineEnd: {
    paddingRight: '0.5rem',
    marginRight: {
      default: null,
      ':has(>button)': '-0.3rem',
      ':has(>kbd)': '-0.15rem',
    },
    order: 9999,
  },
  // `px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2
  //  order-first w-full justify-start`
  addonBlockStart: {
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
    // `pt-2` wins over the base `py-1.5` (measured: 8px top, 6px bottom), and
    // `group-has-[>input]/input-group:pt-2` sets the same value.
    paddingTop: '0.5rem',
    // The base `py-1.5` has to be restated: `stylex.props` merges a property
    // as a whole, so declaring only the `.border-b` condition here would drop it.
    paddingBottom: {
      default: '0.375rem',
      ':is(.border-b)': '0.5rem',
    },
    width: '100%',
    justifyContent: 'flex-start',
    order: -9999,
  },
  // `px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2
  //  order-last w-full justify-start`
  addonBlockEnd: {
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
    paddingTop: {
      default: '0.375rem',
      ':is(.border-t)': '0.5rem',
    },
    paddingBottom: '0.5rem',
    width: '100%',
    justifyContent: 'flex-start',
    order: 9999,
  },

  // `text-muted-foreground gap-2 text-sm flex items-center`
  text: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
  },

  // `InputGroupButton` base: `gap-2 text-sm shadow-none flex items-center`.
  // Passed to `Button` as `sx` rather than as classes, because `shadow-none`
  // as a utility would beat `Button`'s own StyleX focus ring — the gap PR 04
  // recorded. As a StyleX override it replaces only the *unconditional* layer
  // of `box-shadow` and restates the ring conditions below.
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  // every variant except `destructive`: the ring colours of `button.tsx`
  buttonShadow: {
    boxShadow: {
      default: SHADOW_NONE,
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
  },
  // `destructive` focuses with its own ring (`focus-visible:ring-destructive/20`,
  // `dark:focus-visible:ring-destructive/40`)
  buttonShadowDestructive: {
    boxShadow: {
      default: SHADOW_NONE,
      ':focus-visible': RING_DESTRUCTIVE_20,
      ':is([aria-invalid="true"])': {
        default: RING_DESTRUCTIVE_20,
        ':focus-visible': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':focus-visible': RING_DESTRUCTIVE_40,
        ':is([aria-invalid="true"])': {
          default: RING_DESTRUCTIVE_40,
          ':focus-visible': RING_DESTRUCTIVE_40,
        },
      },
    },
  },
  // `h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5`
  buttonXs: {
    height: '1.5rem',
    gap: '0.25rem',
    borderRadius: 'calc(var(--radius) - 3px)',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
  },
  // `size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0`
  buttonIconXs: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: 'calc(var(--radius) - 3px)',
    paddingTop: { default: '0rem', ':has(>svg)': '0rem' },
    paddingRight: { default: '0rem', ':has(>svg)': '0rem' },
    paddingBottom: { default: '0rem', ':has(>svg)': '0rem' },
    paddingLeft: { default: '0rem', ':has(>svg)': '0rem' },
  },
  // `size-8 p-0 has-[>svg]:p-0`
  buttonIconSm: {
    width: '2rem',
    height: '2rem',
    paddingTop: { default: '0rem', ':has(>svg)': '0rem' },
    paddingRight: { default: '0rem', ':has(>svg)': '0rem' },
    paddingBottom: { default: '0rem', ':has(>svg)': '0rem' },
    paddingLeft: { default: '0rem', ':has(>svg)': '0rem' },
  },
})

/**
 * The border and ring rules of `InputGroup`, kept as Tailwind classes.
 *
 * Two reasons, both of which would change a frozen screenshot:
 *
 * - `components/ui/command.tsx` passes `border-input/30` to the group. A plain
 *   utility used to lose to the `has-[…]` rules (0,1,0 against 0,2,0); as
 *   StyleX rules they would lose to it instead, and the command palette's
 *   focused input would stop painting its ring border.
 * - `in-data-[slot=combobox-content]:focus-within:*` only applies inside
 *   `combobox.tsx`'s content, and Tailwind resolves it against the two
 *   `has-[…]` rules by emission order (measured on the built CSS: 724 for the
 *   combobox rule, 758 for the focus ring, 762 for the invalid ring). StyleX
 *   orders the same three by its own per-condition priority and puts the
 *   combobox rule on top, so the mixed states would come out different.
 *
 * They go away with `command.tsx` (PR 16) and `combobox.tsx` (PR 15).
 */
const CONTESTED_CLASSES =
  'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:ring-3 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0'

function InputGroup({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.inputGroup)

  return (
    <div
      data-slot="input-group"
      role="group"
      // `group/input-group` is selected through by `InputGroupAddon`.
      className={cn('group/input-group', CONTESTED_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/**
 * Kept **unchanged** so Tailwind keeps emitting every class it names and so the
 * `align` prop keeps its type. `InputGroupAddon` no longer calls it; the
 * equivalent StyleX styles are above. Removed with `cva` in PR 32.
 */
const inputGroupAddonVariants = cva(
  "text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 flex cursor-text items-center justify-center select-none",
  {
    variants: {
      align: {
        'inline-start': 'pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first',
        'inline-end': 'pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last',
        'block-start':
          'px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start',
        'block-end':
          'px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
)

const ADDON_STYLES = {
  'inline-start': styles.addonInlineStart,
  'inline-end': styles.addonInlineEnd,
  'block-start': styles.addonBlockStart,
  'block-end': styles.addonBlockEnd,
} as const

/**
 * Three classes that stay Tailwind, all because of the addon's children.
 *
 * - `[&>kbd]:rounded-[calc(var(--radius)-5px)]` and
 *   `[&>svg:not([class*='size-'])]:size-4` style a child the caller wrote — a
 *   `<kbd>` and a `lucide` icon — where a StyleX rule would lose to any
 *   utility on that child (PR 32 removes them).
 * - `text-sm` has to keep producing a **unitless** line height. Tailwind pairs
 *   `font-size: 0.875rem` with `calc(1.25 / 0.875)`, and a ratio passes down to
 *   a descendant with a different font size, where the equivalent length
 *   (`1.25rem`) passes down 20px. Both filter bars and the `input-group-search`
 *   gallery case put a `text-[10px]` `<kbd>` inside the addon, and that kbd's
 *   own line height is invalid at computed-value time, so it inherits: it
 *   measures 14.2857px today and 20px from a length. Writing the ratio instead
 *   is not an option either — lightningcss folds it to five decimals, which
 *   moves the addon's own line box off 20px (`conventions.md`, "Paired
 *   line-heights"). Removed with the callers that pass a sized child (PR 21,
 *   PR 22, PR 24).
 */
const ADDON_CHILD_CLASSES =
  "text-sm [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4"

function InputGroupAddon({
  className,
  style,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  const resolved = align ?? 'inline-start'
  const sx = stylex.props(styles.addon, ADDON_STYLES[resolved])

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={resolved}
      className={cn(ADDON_CHILD_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

/**
 * Kept **unchanged** for the same reasons as `inputGroupAddonVariants`.
 * `InputGroupButton` now passes the equivalent StyleX styles to `Button`
 * through its `sx` prop, plus the one icon class below.
 */
const inputGroupButtonVariants = cva('gap-2 text-sm shadow-none flex items-center', {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
      sm: '',
      'icon-xs': 'size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0',
      'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
    },
  },
  defaultVariants: {
    size: 'xs',
  },
})

const BUTTON_SIZE_STYLES = {
  xs: styles.buttonXs,
  sm: null,
  'icon-xs': styles.buttonIconXs,
  'icon-sm': styles.buttonIconSm,
} as const

/**
 * `[&>svg:not([class*='size-'])]:size-3.5` of the `xs` size, kept as a Tailwind
 * class: it styles the caller's icon, and `Button` keeps its own icon rule as a
 * class for the same reason (PR 04), so the two still resolve against each
 * other exactly as they did. Removed with `Button`'s (PR 20 onwards).
 */
const BUTTON_SIZE_CLASSES = {
  xs: "[&>svg:not([class*='size-'])]:size-3.5",
  sm: '',
  'icon-xs': '',
  'icon-sm': '',
} as const

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> &
  VariantProps<typeof inputGroupButtonVariants>) {
  const resolved = size ?? 'xs'

  return (
    <Button
      type={type}
      data-size={resolved}
      variant={variant}
      sx={[
        styles.button,
        variant === 'destructive' ? styles.buttonShadowDestructive : styles.buttonShadow,
        BUTTON_SIZE_STYLES[resolved],
      ]}
      className={cn(BUTTON_SIZE_CLASSES[resolved], className)}
      {...props}
    />
  )
}

function InputGroupText({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.text)

  return (
    <span
      // Both rules style a `lucide` icon the caller passed in, so they stay
      // Tailwind (PR 32).
      className={cn(
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        sx.className,
        className
      )}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/**
 * The control overrides stay Tailwind classes on purpose.
 *
 * They are a caller `className` on `Input`/`Textarea`, and every one of them
 * is a plain utility that beats the component's own StyleX rule exactly the way
 * it used to beat the component's base class — including the three background
 * classes `Input` still carries, which `twMerge` removes here. Rewriting them
 * as StyleX would change nothing and would lose that `twMerge` deletion, so
 * they are left byte for byte as they were.
 */
function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1',
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1 resize-none',
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
