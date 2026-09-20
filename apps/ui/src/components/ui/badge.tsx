import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * Kept for the exported type only (PR 04). Nothing outside this file calls
 * `badgeVariants()`; `Badge` renders from the StyleX styles below, and every
 * class of this string has a comment there. PR 32 removes it.
 */
const badgeVariants = cva(
  'h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/** the focus ring: `focus-visible:ring-ring/50` at three pixels — see `button.tsx` for the layer chain */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** the destructive ring at 20%: `aria-invalid:ring-destructive/20`, and the destructive variant's focus ring */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** the destructive ring at 40%, used by both `dark:` ring rules */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

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
    // `shrink-0`
    flexShrink: 0,
    // `overflow-hidden`
    overflow: 'hidden',
    // `w-fit`
    width: 'fit-content',
    // `h-5`
    height: '1.25rem',
    // `gap-1`
    gap: '0.25rem',
    // `rounded-4xl`
    borderRadius: radius['4xl'],
    // `border`
    borderWidth: '1px',
    borderStyle: 'solid',
    // `px-2` with `has-data-[icon=inline-start|end]:p{l,r}-1.5`
    paddingLeft: { default: '0.5rem', ':has([data-icon="inline-start"])': '0.375rem' },
    paddingRight: { default: '0.5rem', ':has([data-icon="inline-end"])': '0.375rem' },
    // `py-0.5`
    paddingTop: '0.125rem',
    paddingBottom: '0.125rem',
    // `text-xs`, the paired line-height as the length it resolves to
    fontSize: '0.75rem',
    lineHeight: '1rem',
    // `font-medium`
    fontWeight: 500,
    // `transition-all`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `[&>svg]:pointer-events-none`
    pointerEvents: {
      default: null,
      ':is(*)>svg': 'none',
    },
  },

  // --- variants -------------------------------------------------------------
  // As in `button.tsx`, each variant restates the base's `focus-visible:` and
  // `aria-invalid:` border colour and ring: `stylex.props` merges a property as
  // a whole, so a variant's own `borderColor` would drop them.
  //
  // `[a]:hover:` is Tailwind's arbitrary-variant form and compiles to
  // `&:is(a):hover` — the badge only changes colour on hover when `asChild`
  // rendered it as an anchor.

  // `bg-primary text-primary-foreground [a]:hover:bg-primary/80`
  default: {
    backgroundColor: {
      default: colors.primary,
      ':is(a):hover': 'color-mix(in oklab, var(--primary) 80%, transparent)',
    },
    color: colors.primaryForeground,
    // `border-transparent`, `focus-visible:border-ring`, `aria-invalid:border-destructive`
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': colors.destructive,
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      // Unlike `Button`, this base declares no ring under `aria-invalid:`: an
      // invalid badge that is not focused has no ring at all, and
      // `aria-invalid:ring-destructive/20` only recolours the focus ring.
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

  // `bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80`
  secondary: {
    backgroundColor: {
      default: colors.secondary,
      ':is(a):hover': 'color-mix(in oklab, var(--secondary) 80%, transparent)',
    },
    color: colors.secondaryForeground,
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': colors.destructive,
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      // Unlike `Button`, this base declares no ring under `aria-invalid:`: an
      // invalid badge that is not focused has no ring at all, and
      // `aria-invalid:ring-destructive/20` only recolours the focus ring.
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

  // `bg-destructive/10 [a]:hover:bg-destructive/20 dark:bg-destructive/20
  //  text-destructive focus-visible:ring-destructive/20
  //  dark:focus-visible:ring-destructive/40`
  destructive: {
    backgroundColor: {
      default: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
      ':is(a):hover': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--destructive) 20%, transparent)',
        ':is(a):hover': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
      },
    },
    color: colors.destructive,
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': colors.destructive,
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_DESTRUCTIVE_20,
      ':is([aria-invalid="true"])': {
        default: null,
        ':focus-visible': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':focus-visible': RING_DESTRUCTIVE_40,
        ':is([aria-invalid="true"])': {
          default: null,
          ':focus-visible': RING_DESTRUCTIVE_40,
        },
      },
    },
  },

  // `border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground`
  outline: {
    backgroundColor: {
      default: null,
      ':is(a):hover': colors.muted,
    },
    color: {
      default: colors.foreground,
      ':is(a):hover': colors.mutedForeground,
    },
    borderColor: {
      default: colors.border,
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': colors.destructive,
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      // Unlike `Button`, this base declares no ring under `aria-invalid:`: an
      // invalid badge that is not focused has no ring at all, and
      // `aria-invalid:ring-destructive/20` only recolours the focus ring.
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

  // `hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50` — a plain
  // `hover:`, so unlike the other variants it also fires on a non-anchor badge
  ghost: {
    backgroundColor: {
      default: null,
      ':hover': colors.muted,
      ':is(.dark *)': {
        default: null,
        ':hover': 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
    color: {
      default: null,
      ':hover': colors.mutedForeground,
    },
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': colors.destructive,
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      // Unlike `Button`, this base declares no ring under `aria-invalid:`: an
      // invalid badge that is not focused has no ring at all, and
      // `aria-invalid:ring-destructive/20` only recolours the focus ring.
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

  // `text-primary underline-offset-4 hover:underline`
  link: {
    color: colors.primary,
    textUnderlineOffset: '4px',
    textDecorationLine: {
      default: null,
      ':hover': 'underline',
    },
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': colors.destructive,
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      // Unlike `Button`, this base declares no ring under `aria-invalid:`: an
      // invalid badge that is not focused has no ring at all, and
      // `aria-invalid:ring-destructive/20` only recolours the focus ring.
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
})

/**
 * `[&>svg]:size-3!`, kept as a Tailwind class (PR 04).
 *
 * Same reason as `button.tsx`: it styles an icon the badge does not own, and a
 * StyleX rule in a `priorityN` layer cannot beat a width/height utility on the
 * icon. The `!important` makes that even clearer — it exists precisely to win
 * against a caller's own `size-*`, which StyleX has no way to express.
 */
const ICON_SIZE_CLASS = '[&>svg]:size-3!'

const variantStyles = {
  default: styles.default,
  secondary: styles.secondary,
  destructive: styles.destructive,
  outline: styles.outline,
  ghost: styles.ghost,
  link: styles.link,
} as const

function Badge({
  className,
  style,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'
  const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'])

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      // `group/badge` is a marker class with no rules of its own; it is kept
      // literally so any `group-*/badge` variant a caller adds keeps working.
      className={cn('group/badge', ICON_SIZE_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
