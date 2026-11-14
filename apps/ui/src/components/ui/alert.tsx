import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

const styles = stylex.create({
  // `grid w-full relative gap-0.5 rounded-lg border px-2.5 py-2 text-left
  //  has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18
  //  has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2`
  alert: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
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

const remainingStyles = stylex.create({
  uncolored: { backgroundColor: 'transparent', color: 'inherit' },
  root: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    gridRow: { default: null, ':is(*)>svg': 'span 2 / span 2' },
    translate: { default: null, ':is(*)>svg': 'var(--alert-zero-translation, 0px) 0.125rem' },
    color: { default: null, ':is(*)>svg': 'currentColor' },
    width: { default: null, ':is(*)>svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*)>svg:not([class*="size-"])': '1rem' },
  },
  destructive: {
    color: {
      default: null,
      ':is(*)>[data-slot="alert-description"]':
        'color-mix(in oklab, var(--destructive) 90%, transparent)',
    },
  },
  links: {
    textDecorationLine: { default: null, ':is(*) a': 'underline' },
    textUnderlineOffset: { default: null, ':is(*) a': '3px' },
    color: { default: null, ':is(*) a:hover': colors.foreground },
  },
  description: { marginBottom: { default: null, ':is(*) p:not(:last-child)': '1rem' } },
})

function Alert({
  className,
  style,
  sx: sxProp,
  variant,
  ...props
}: React.ComponentProps<'div'> & { variant?: 'default' | 'destructive' | null; sx?: Sx }) {
  const sx = stylex.props(
    styles.alert,
    variant === 'destructive' ? styles.alertDestructive : styles.alertDefault,
    variant === null && remainingStyles.uncolored,
    sxProp
  )

  return (
    <div
      data-slot="alert"
      role="alert"
      className={[
        'group/alert',
        stylex.props(remainingStyles.root).className,
        variant === 'destructive' && stylex.props(remainingStyles.destructive).className,
        sx.className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.title, sxProp)

  return (
    <div
      data-slot="alert-title"
      className={[stylex.props(remainingStyles.links).className, sx.className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.description, remainingStyles.description, sxProp)

  return (
    <div
      data-slot="alert-description"
      className={[stylex.props(remainingStyles.links).className, sx.className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AlertAction({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.action, sxProp)

  return (
    <div
      data-slot="alert-action"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
