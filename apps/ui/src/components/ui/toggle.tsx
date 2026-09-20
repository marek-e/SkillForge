import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * Kept for the exported type only (PR 04). Nothing outside this file calls
 * `toggleVariants()`; `Toggle` renders from the StyleX styles below, and every
 * class of this string has a comment there. PR 32 removes it.
 */
const toggleVariants = cva(
  "hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted gap-1 rounded-lg text-sm font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-input hover:bg-muted border bg-transparent',
      },
      size: {
        default: 'h-8 min-w-8 px-2',
        sm: 'h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-1.5 text-[0.8rem]',
        lg: 'h-9 min-w-9 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/** the focus ring: `focus-visible:ring-ring/50` at three pixels — see `button.tsx` for the layer chain */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** the destructive ring at 20%: `aria-invalid:ring-destructive/20` recolours the focus ring, it declares no ring of its own */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** the destructive ring at 40%, used by the `dark:` rule */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

/**
 * The hover rules below are nested in `@media (hover: hover)`, the shape
 * Tailwind v4 emits for a hover variant (PR 09's correction commit). All three
 * ask for the same value as the rules they tie with, so the priority the
 * wrapper adds changes nothing here.
 */
const styles = stylex.create({
  base: {
    // `inline-flex`
    display: 'inline-flex',
    // `items-center`
    alignItems: 'center',
    // `justify-center`
    justifyContent: 'center',
    // `whitespace-nowrap`
    whiteSpace: 'nowrap',
    // `gap-1`
    gap: '0.25rem',
    // `rounded-lg`; the `sm` size overrides it
    borderRadius: radius.lg,
    // `text-sm`, the paired line-height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    // `font-medium`
    fontWeight: 500,
    // `transition-all`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:pointer-events-none` and `[&_svg]:pointer-events-none`
    pointerEvents: {
      default: null,
      ':disabled': 'none',
      ':is(*) svg': 'none',
    },
    // `disabled:opacity-50`
    opacity: {
      default: null,
      ':disabled': '50%',
    },
    // `[&_svg]:shrink-0`
    flexShrink: {
      default: null,
      ':is(*) svg': 0,
    },
    // `hover:text-foreground`
    color: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    // `focus-visible:border-ring` and `aria-invalid:border-destructive`. The
    // `default` variant has no border width, so only `outline` shows them.
    // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so the
    // nesting states which wins when a toggle is both.
    borderColor: {
      default: null,
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': {
        default: colors.destructive,
        ':focus-visible': colors.destructive,
      },
    },
    // The three-pixel focus ring with `focus-visible:ring-ring/50`. Unlike
    // `Button` this base declares no ring under `aria-invalid:`, so an invalid
    // toggle that is not focused has no ring at all —
    // `aria-invalid:ring-destructive/20` only recolours the focus ring.
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      ':is([aria-invalid="true"])': {
        default: null,
        ':focus-visible': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default: null,
          ':focus-visible': RING_DESTRUCTIVE_40,
        },
      },
    },
  },

  // --- variants -------------------------------------------------------------
  // Both variants restate the base's background conditions
  // (`hover:bg-muted`, `aria-pressed:bg-muted`, `data-[state=on]:bg-muted`),
  // because their own `bg-transparent` merges the whole property.

  // `bg-transparent`
  default: {
    backgroundColor: {
      default: 'transparent',
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      ':is([aria-pressed="true"])': colors.muted,
      '[data-state="on"]': colors.muted,
    },
  },

  // `border-input hover:bg-muted border bg-transparent`
  outline: {
    backgroundColor: {
      default: 'transparent',
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      ':is([aria-pressed="true"])': colors.muted,
      '[data-state="on"]': colors.muted,
    },
    // `border` — 1px, `--tw-border-style` defaults to solid
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-input`, plus the base's focus / invalid colours, which a variant
    // `borderColor` would otherwise replace wholesale
    borderColor: {
      default: colors.input,
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': {
        default: colors.destructive,
        ':focus-visible': colors.destructive,
      },
    },
  },

  // --- sizes ----------------------------------------------------------------
  // As in `button.tsx`, `[&_svg:not([class*='size-'])]:size-4` is restated in
  // every size, because a size that sets the toggle's own `height` would
  // otherwise drop the base's whole `height` property, icon rule included.

  // `h-8 min-w-8 px-2`
  sizeDefault: {
    height: '2rem',
    minWidth: '2rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },

  // `h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-1.5 text-[0.8rem]`
  sizeSm: {
    height: '1.75rem',
    minWidth: '1.75rem',
    // `--radius-md` expanded to the project's own `calc()`
    borderRadius: 'min(calc(var(--radius) - 2px), 12px)',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
    fontSize: '0.8rem',
    // `text-[0.8rem]` is arbitrary, so it has no paired line-height: Tailwind
    // emits `line-height: var(--tw-leading)`, which is invalid at
    // computed-value time and falls back to `inherit`.
    lineHeight: 'inherit',
  },

  // `h-9 min-w-9 px-2.5`
  sizeLg: {
    height: '2.25rem',
    minWidth: '2.25rem',
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
  },
})

/** `[&_svg:not([class*='size-'])]:size-4`, kept as a Tailwind class — see `button.tsx` */
const ICON_SIZE_CLASS = "[&_svg:not([class*='size-'])]:size-4"

const variantStyles = {
  default: styles.default,
  outline: styles.outline,
} as const

const sizeStyles = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
} as const

function Toggle({
  className,
  style,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  const sx = stylex.props(
    styles.base,
    variantStyles[variant ?? 'default'],
    sizeStyles[size ?? 'default']
  )

  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      // `group/toggle` is a marker class with no rules of its own; it is kept
      // literally so any `group-*/toggle` variant a caller adds keeps working.
      className={cn('group/toggle', ICON_SIZE_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
