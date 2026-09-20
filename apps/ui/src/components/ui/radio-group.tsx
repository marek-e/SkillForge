import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { colors } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { CircleIcon } from 'lucide-react'

/** `focus-visible:ring-3` with `focus-visible:ring-ring/50` (see `button.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** `aria-invalid:ring-3` with `aria-invalid:ring-destructive/20` */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** `dark:aria-invalid:ring-destructive/40` */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

const styles = stylex.create({
  // `grid gap-2 w-full`
  root: {
    display: 'grid',
    gap: '0.5rem',
    width: '100%',
  },

  // `flex size-4 rounded-full relative aspect-square shrink-0 border outline-none
  //  border-input dark:bg-input/30 focus-visible:border-ring …`
  item: {
    display: 'flex',
    position: 'relative',
    width: '1rem',
    height: '1rem',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    // `rounded-full`
    borderRadius: 'calc(infinity * 1px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: colors.input,
      ':focus-visible': colors.ring,
      // `aria-invalid:` is emitted after `focus-visible:` at the same
      // specificity, so it wins when an item is both.
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
    // `dark:bg-input/30`
    backgroundColor: {
      default: null,
      ':is(.dark *)': 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
    // `text-primary`
    color: colors.primary,
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
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:cursor-not-allowed`
    cursor: {
      default: null,
      ':disabled': 'not-allowed',
    },
    // `disabled:opacity-50`
    opacity: {
      default: null,
      ':disabled': '50%',
    },
    // `after:absolute after:-inset-x-3 after:-inset-y-2`, the pointer target
    '::after': {
      content: '""',
      position: 'absolute',
      insetInline: '-0.75rem',
      insetBlock: '-0.5rem',
    },
  },

  // `group-aria-invalid/radio-group-item:text-destructive text-primary
  //  flex size-4 items-center justify-center`
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1rem',
    height: '1rem',
    color: {
      default: colors.primary,
      ':is(.group\\/radio-group-item[aria-invalid="true"] *)': colors.destructive,
    },
  },

  // `absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current`
  icon: {
    position: 'absolute',
    top: '50%',
    insetInlineStart: '50%',
    width: '0.5rem',
    height: '0.5rem',
    // Tailwind composes the two translate utilities into one `translate`
    // declaration (`--tw-translate-x --tw-translate-y`).
    translate: '-50% -50%',
    fill: 'currentColor',
  },
})

function RadioGroup({
  className,
  style,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  const sx = stylex.props(styles.root)

  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  style,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const sx = stylex.props(styles.item)
  const indicator = stylex.props(styles.indicator)
  const icon = stylex.props(styles.icon)

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      // Both classes carry no styling of their own: the indicator selects
      // through `group/radio-group-item`, and `Label`'s `peer-disabled:` rules
      // select through `peer`.
      className={cn('group/radio-group-item peer', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={indicator.className}
        style={indicator.style}
      >
        <CircleIcon className={icon.className} style={icon.style} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
