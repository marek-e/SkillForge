import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

const styles = stylex.create({
  // `grid w-full relative gap-0.5 rounded-lg border px-2.5 py-2 text-left
  //  has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18
  //  has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2`
  alert: {
    display: 'grid',
    // `relative` is unconditional here; `has-data-[slot=alert-action]:relative`
    // says the same thing a second time.
    position: 'relative',
    width: '100%',
    gap: '0.125rem',
    // `has-[>svg]:gap-x-2` — a longhand against the `gap` shorthand, which
    // StyleX ranks below it, the same way Tailwind's (0,2,0) beats (0,1,0).
    columnGap: { default: null, ':has(>svg)': '0.5rem' },
    gridTemplateColumns: { default: null, ':has(>svg)': 'auto 1fr' },
    borderRadius: radius.lg,
    // `border`: width and style only; the colour keeps coming from preflight.
    borderWidth: '1px',
    borderStyle: 'solid',
    // `px-2.5` is `padding-inline` and the action rule below writes the
    // physical longhand, which Blink resolves over the logical property
    // whatever the source order (see `card.tsx`).
    paddingInline: '0.625rem',
    paddingBlock: '0.5rem',
    paddingRight: { default: null, ':has([data-slot="alert-action"])': '4.5rem' },
    textAlign: 'left',
  },
  // `bg-card text-card-foreground`
  alertDefault: {
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
  // `text-destructive bg-card`
  alertDestructive: {
    backgroundColor: colors.card,
    color: colors.destructive,
  },

  // `font-medium group-has-[>svg]/alert:col-start-2`
  title: {
    fontWeight: 500,
    gridColumnStart: { default: null, ':is(.group\\/alert:has(>svg) *)': 2 },
  },

  // `text-muted-foreground text-sm text-balance md:text-pretty`
  description: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textWrap: { default: 'balance', '@media (width >= 48rem)': 'pretty' },
  },

  // `absolute top-2 right-2`
  action: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
  },
})

/**
 * The classes that stay Tailwind, and why.
 *
 * - **the four `*:[svg]:` rules** — they style the `<svg>` the *caller* puts
 *   inside the alert. A StyleX rule sits in a `priorityN` layer and would lose
 *   to any utility on that icon, where the component's selector wins today.
 *   (`*:[svg]:text-current` is written twice in the original, once in the base
 *   and once in `destructive`; both are kept.)
 * - **`*:data-[slot=alert-description]:text-destructive/90`** — it styles a
 *   child this file *does* own, but the condition it depends on lives on the
 *   parent as a **class**, not as an attribute: `Alert` has no `data-variant`,
 *   and adding one would be a DOM change. So the rule stays where it is.
 * - **`text-sm`** — a paired `text-*` on a container. `AlertTitle` has no font
 *   size of its own and an `AlertAction` holds a `Button`, whose `sm` size
 *   computes `line-height: inherit`; a StyleX `1.25rem` would pass 20px down
 *   instead of the ratio.
 * - **`group/alert`** — the title's `:has(>svg)` rule still selects through it.
 * - **the `[&_a]` rules** — a caller's link, same story as the svg.
 *
 * All of them go with the utility layer in PR 32.
 */
const ALERT_CLASSES =
  "group/alert text-sm *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4"
const ALERT_DESTRUCTIVE_CLASSES =
  '*:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current'
const LINK_CLASSES = '[&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3'
const DESCRIPTION_PARAGRAPH_CLASS = '[&_p:not(:last-child)]:mb-4'

/**
 * Kept for the prop type only (PR 08), the way `buttonGroupVariants` is in
 * `button-group.tsx`: `VariantProps<typeof alertVariants>` is what types
 * `variant`, down to accepting `null`. PR 32 removes it.
 */
const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Alert({
  className,
  style,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  const sx = stylex.props(
    styles.alert,
    variant === 'destructive' ? styles.alertDestructive : styles.alertDefault
  )

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        ALERT_CLASSES,
        variant === 'destructive' && ALERT_DESTRUCTIVE_CLASSES,
        sx.className,
        className
      )}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertTitle({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.title)

  return (
    <div
      data-slot="alert-title"
      className={cn(LINK_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDescription({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.description)

  return (
    <div
      data-slot="alert-description"
      className={cn(DESCRIPTION_PARAGRAPH_CLASS, LINK_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertAction({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.action)

  return (
    <div
      data-slot="alert-action"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
