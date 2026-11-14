import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Slot } from 'radix-ui'

import { colors, motion, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

const iconStyles = stylex.create({
  separator: {
    width: { default: null, ':is(*)>svg': '0.875rem' },
    height: { default: null, ':is(*)>svg': '0.875rem' },
  },
  ellipsis: {
    width: { default: null, ':is(*)>svg': '1rem' },
    height: { default: null, ':is(*)>svg': '1rem' },
  },
})
const SEPARATOR_ICON_CLASS = stylex.props(iconStyles.separator).className
const ELLIPSIS_ICON_CLASS = stylex.props(iconStyles.ellipsis).className

const styles = stylex.create({
  // `text-muted-foreground gap-1.5 flex flex-wrap items-center wrap-break-word`
  list: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.375rem',
    color: colors.mutedForeground,
    overflowWrap: 'break-word',
  },

  // `gap-1 inline-flex items-center`
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  // `hover:text-foreground transition-colors`
  link: {
    // Tailwind wraps every `hover:` utility in `@media (hover: hover)`, so a
    // coarse pointer never gets the colour change.
    color: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },

  // `text-foreground font-normal`
  page: {
    color: colors.foreground,
    fontWeight: 400,
  },

  // `size-5 flex items-center justify-center`
  ellipsis: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
  },

  // `sr-only`, copied verbatim (`tailwind-values.md` §8)
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
})

function Breadcrumb({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'nav'> & { sx?: Sx }) {
  const sx = stylex.props(sxProp)
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbList({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'ol'> & { sx?: Sx }) {
  const sx = stylex.props(styles.list, sxProp)

  return (
    <ol
      data-slot="breadcrumb-list"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbItem({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'li'> & { sx?: Sx }) {
  const sx = stylex.props(styles.item, sxProp)

  return (
    <li
      data-slot="breadcrumb-item"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
} & { sx?: Sx }) {
  const Comp = asChild ? Slot.Root : 'a'
  const sx = stylex.props(styles.link, sxProp)

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbPage({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & { sx?: Sx }) {
  const sx = stylex.props(styles.page, sxProp)

  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'li'> & { sx?: Sx }) {
  const sx = stylex.props(sxProp)
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={[SEPARATOR_ICON_CLASS, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & { sx?: Sx }) {
  const sx = stylex.props(styles.ellipsis, sxProp)
  const srOnly = stylex.props(styles.srOnly)

  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={[ELLIPSIS_ICON_CLASS, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <MoreHorizontalIcon />
      <span {...srOnly}>More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
