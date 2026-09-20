import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    flexShrink: 0,
    width: '2rem',
    height: '2rem',
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
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    // A slash-modifier line height resolves to the named relaxed step, which
    // is a unitless ratio in Tailwind too — so it keeps inheriting as one.
    lineHeight: 1.625,
  },

  // `gap-2.5 flex w-full max-w-sm min-w-0 flex-col items-center text-balance`
  content: {
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

/**
 * The classes that stay Tailwind, and why.
 *
 * Every one of them styles an element this file does not own — the `<svg>` a
 * caller puts inside `EmptyMedia`, an `<a>` a caller puts inside
 * `EmptyDescription` — and a StyleX rule in a `priorityN` layer loses to any
 * utility on that child, where the component's selector used to win on
 * specificity. They go with the utility layer in PR 32.
 *
 * `text-sm` on `EmptyContent` is the other kind: a paired `text-*` on a
 * container. Tailwind passes `calc(1.25 / 0.875)` down to a descendant with a
 * font size and no line height of its own, and `Button`'s `sm` size is exactly
 * that (`empty-icon-media` and `empty-with-actions` both hold one). A StyleX
 * `line-height: 1.25rem` would pass 20px down instead of 18.29px.
 */
const MEDIA_CHILD_CLASSES = '[&_svg]:pointer-events-none [&_svg]:shrink-0'
const MEDIA_ICON_CHILD_CLASSES = "[&_svg:not([class*='size-'])]:size-4"
const DESCRIPTION_CHILD_CLASSES =
  '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4'
const CONTENT_TEXT_CLASS = 'text-sm'

/**
 * Kept for the exported prop type only (PR 08), the way `buttonGroupVariants`
 * is in `button-group.tsx`. `EmptyMedia` no longer renders from it — the styles
 * above and the two class constants do — but `VariantProps<typeof …>` is what
 * types its `variant`, down to accepting `null`. PR 32 removes it.
 */
const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Empty({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.empty)

  return (
    <div
      data-slot="empty"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyHeader({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.header)

  return (
    <div
      data-slot="empty-header"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyMedia({
  className,
  style,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  const sx = stylex.props(styles.media, variant === 'icon' ? styles.mediaIcon : styles.mediaDefault)

  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(
        MEDIA_CHILD_CLASSES,
        variant === 'icon' && MEDIA_ICON_CHILD_CLASSES,
        sx.className,
        className
      )}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyTitle({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.title)

  return (
    <div
      data-slot="empty-title"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyDescription({ className, style, ...props }: React.ComponentProps<'p'>) {
  const sx = stylex.props(styles.description)

  return (
    <div
      data-slot="empty-description"
      className={cn(DESCRIPTION_CHILD_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function EmptyContent({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.content)

  return (
    <div
      data-slot="empty-content"
      className={cn(CONTENT_TEXT_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia }
