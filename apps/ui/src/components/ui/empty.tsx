import * as stylex from '@stylexjs/stylex'

import { colors, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

const styles = stylex.create({
  // `flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4
  //  rounded-xl border-dashed p-6 text-center text-balance`
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: '0rem',
    flex: 1,
    gap: '1rem',
    padding: '1.5rem',
    borderRadius: radius.xl,
    // `border-dashed` with no border width: invisible today, kept as it is.
    borderStyle: 'dashed',
    textAlign: 'center',
    textWrap: 'balance',
  },

  // `gap-2 flex max-w-sm flex-col items-center`
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    // `max-w-sm` is `var(--container-sm)`
    maxWidth: '24rem',
  },

  // `mb-2 flex shrink-0 items-center justify-center`
  media: {
    pointerEvents: { default: null, ':is(*) svg': 'none' },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: { default: 0, ':is(*) svg': 0 },
    marginBottom: '0.5rem',
  },
  // `bg-transparent`
  mediaDefault: {
    backgroundColor: 'transparent',
  },
  // `bg-muted text-foreground flex size-8 shrink-0 items-center justify-center
  //  rounded-lg`
  mediaIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: { default: 0, ':is(*) svg': 0 },
    width: { default: '2rem', ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: '2rem', ':is(*) svg:not([class*="size-"])': '1rem' },
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    color: colors.foreground,
  },

  // `text-sm font-medium tracking-tight`
  title: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    // `tracking-tight`
    letterSpacing: '-0.025em',
  },

  // `text-sm/relaxed text-muted-foreground`
  description: {
    textDecorationLine: { default: null, ':is(*)>a': 'underline' },
    textUnderlineOffset: { default: null, ':is(*)>a': '4px' },
    color: { default: colors.mutedForeground, ':is(*)>a:hover': colors.primary },
    fontSize: '0.875rem',
    // A slash-modifier line height resolves to the named relaxed step, which
    // is a unitless ratio in Tailwind too — so it keeps inheriting as one.
    lineHeight: 1.625,
  },

  // `gap-2.5 flex w-full max-w-sm min-w-0 flex-col items-center text-balance`
  content: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '24rem',
    minWidth: '0rem',
    gap: '0.625rem',
    textWrap: 'balance',
  },
})

function Empty({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.empty, sxProp)

  return (
    <div
      data-slot="empty"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)

  return (
    <div
      data-slot="empty-header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyMedia({
  className,
  style,
  variant = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { variant?: 'default' | 'icon' | null; sx?: Sx }) {
  const sx = stylex.props(
    styles.media,
    variant === 'icon' ? styles.mediaIcon : styles.mediaDefault,
    sxProp
  )

  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.title, sxProp)

  return (
    <div
      data-slot="empty-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'p'> & { sx?: Sx }) {
  const sx = stylex.props(styles.description, sxProp)

  return (
    <div
      data-slot="empty-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.content, sxProp)

  return (
    <div
      data-slot="empty-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia }
