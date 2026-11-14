import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { colors, motion, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
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
const FOCUSED_CONTROL = ':has([data-slot="input-group-control"]:focus-visible)'
const INVALID_CONTROL = ':has([data-slot][aria-invalid="true"])'
const IN_COMBOBOX = ':is([data-slot="combobox-content"] *)'
const RING_ZERO = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 0px currentColor, 0 0 #0000'
const RING_ZERO_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 0px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
const RING_ZERO_INVALID =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 0px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
const RING_ZERO_INVALID_DARK =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 0px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'
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
    borderColor: {
      default: colors.input,
      [FOCUSED_CONTROL]: colors.ring,
      [INVALID_CONTROL]: { default: colors.destructive, [FOCUSED_CONTROL]: colors.destructive },
      [IN_COMBOBOX]: {
        default: null,
        ':focus-within': {
          default: 'inherit',
          [FOCUSED_CONTROL]: colors.ring,
          [INVALID_CONTROL]: { default: colors.destructive, [FOCUSED_CONTROL]: colors.destructive },
        },
      },
    },
    boxShadow: {
      default: null,
      [FOCUSED_CONTROL]: RING_FOCUS,
      [INVALID_CONTROL]: { default: RING_DESTRUCTIVE_20, [FOCUSED_CONTROL]: RING_DESTRUCTIVE_20 },
      ':is(.dark *)': {
        default: null,
        [INVALID_CONTROL]: { default: RING_DESTRUCTIVE_40, [FOCUSED_CONTROL]: RING_DESTRUCTIVE_40 },
      },
      [IN_COMBOBOX]: {
        default: null,
        ':focus-within': {
          default: RING_ZERO,
          [FOCUSED_CONTROL]: RING_FOCUS,
          [INVALID_CONTROL]: {
            default: RING_DESTRUCTIVE_20,
            [FOCUSED_CONTROL]: RING_DESTRUCTIVE_20,
          },
          ':is(.dark *)': {
            default: null,
            [INVALID_CONTROL]: {
              default: RING_DESTRUCTIVE_40,
              [FOCUSED_CONTROL]: RING_DESTRUCTIVE_40,
            },
          },
        },
      },
    },
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
  },
  inputGroupChildren: {
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
  addon: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: {
      default: 'auto',
    },
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
  addonChildren: {
    borderRadius: { default: null, ':is(*)>kbd': 'calc(var(--radius) - 5px)' },
    width: { default: null, ':is(*)>svg:not([class*="size-"])': '1rem' },
    height: {
      default: null,
      ':is(*)>svg:not([class*="size-"])': '1rem',
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
  textChildren: {
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    pointerEvents: { default: null, ':is(*) svg': 'none' },
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
    height: {
      default: '1.5rem',
    },
    gap: '0.25rem',
    borderRadius: 'calc(var(--radius) - 3px)',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
  },
  buttonXsChildren: {
    width: { default: null, ':is([data-size="xs"])>svg:not([class*="size-"])': '0.875rem' },
    height: {
      default: null,
      ':is([data-size="xs"])>svg:not([class*="size-"])': '0.875rem',
    },
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
  control: {
    borderRadius: '0',
    borderWidth: '0px',
    backgroundColor: 'transparent',
    flex: '1',
    boxShadow: {
      default: RING_ZERO,
      ':focus-visible': RING_ZERO_FOCUS,
      ':is([aria-invalid="true"])': {
        default: RING_ZERO_INVALID,
        ':focus-visible': RING_ZERO_INVALID,
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default: RING_ZERO_INVALID_DARK,
          ':focus-visible': RING_ZERO_INVALID_DARK,
        },
      },
    },
  },
  textareaControl: { paddingBlock: '0.5rem', resize: 'none' },
})
function InputGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.inputGroup, sxProp)
  return (
    <div
      data-slot="input-group"
      role="group"
      // `group/input-group` is selected through by `InputGroupAddon`.
      className={[
        'group/input-group',
        sx.className,
        stylex.props(styles.inputGroupChildren).className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
const ADDON_STYLES = {
  'inline-start': styles.addonInlineStart,
  'inline-end': styles.addonInlineEnd,
  'block-start': styles.addonBlockStart,
  'block-end': styles.addonBlockEnd,
} as const
function InputGroupAddon({
  className,
  style,
  align = 'inline-start',
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  align?: keyof typeof ADDON_STYLES | null
  sx?: Sx
}) {
  const resolved = align
  const sx = stylex.props(styles.addon, resolved && ADDON_STYLES[resolved], sxProp)
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={resolved}
      className={[sx.className, stylex.props(styles.addonChildren).className, className]
        .filter(Boolean)
        .join(' ')}
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
const BUTTON_SIZE_STYLES = {
  xs: styles.buttonXs,
  sm: null,
  'icon-xs': styles.buttonIconXs,
  'icon-sm': styles.buttonIconSm,
} as const
function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  sx: sxProp,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & {
  size?: keyof typeof BUTTON_SIZE_STYLES | null
}) {
  const resolved = size
  return (
    <Button
      type={type}
      data-size={resolved}
      variant={variant}
      sx={[
        styles.button,
        variant === 'destructive' ? styles.buttonShadowDestructive : styles.buttonShadow,
        resolved && BUTTON_SIZE_STYLES[resolved],
        sxProp,
      ]}
      className={[resolved === 'xs' && stylex.props(styles.buttonXsChildren).className, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
function InputGroupText({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.text, sxProp)
  return (
    <span
      className={[sx.className, stylex.props(styles.textChildren).className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function InputGroupInput({
  className,
  sx: sxProp,
  ...props
}: React.ComponentProps<'input'> & {
  sx?: Sx
}) {
  return (
    <Input
      data-slot="input-group-control"
      className={className}
      sx={[styles.control, sxProp]}
      {...props}
    />
  )
}
function InputGroupTextarea({
  className,
  sx: sxProp,
  ...props
}: React.ComponentProps<'textarea'> & {
  sx?: Sx
}) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={className}
      sx={[styles.control, styles.textareaControl, sxProp]}
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
