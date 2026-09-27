import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Slot } from 'radix-ui'

import { colors, motion } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/**
 * `text-sm` on `BreadcrumbList`, kept as a Tailwind class.
 *
 * The paired-line-height exception in `conventions.md`: the list is a container
 * a caller fills, `lib/breadcrumbs.tsx` puts its own `<Link>` rows inside it,
 * and a descendant with a font size of its own and no line height of its own
 * would inherit a StyleX length instead of Tailwind's ratio. Removed in PR 32.
 */
const LIST_TEXT_CLASS = 'text-sm'

/**
 * The two icon rules, kept as Tailwind classes.
 *
 * Both style an `svg` the component does not own, and a StyleX rule in a
 * `priorityN` layer loses to any width utility on the icon itself. The
 * separator makes that concrete: it renders the default `ChevronRightIcon`
 * only when it is given no children, and a caller that passes its own icon
 * (the `navbits-breadcrumb-custom-separator` gallery case does) gets it sized
 * by this very rule. Removed in PR 32.
 */
const SEPARATOR_ICON_CLASS = '[&>svg]:size-3.5'
const ELLIPSIS_ICON_CLASS = '[&>svg]:size-4'

const styles = stylex.create({
  // `text-muted-foreground gap-1.5 flex flex-wrap items-center wrap-break-word`
  list: {
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

function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={cn(className)} {...props} />
}

function BreadcrumbList({ className, style, ...props }: React.ComponentProps<'ol'>) {
  const sx = stylex.props(styles.list)

  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(LIST_TEXT_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, style, ...props }: React.ComponentProps<'li'>) {
  const sx = stylex.props(styles.item)

  return (
    <li
      data-slot="breadcrumb-item"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  style,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'a'
  const sx = stylex.props(styles.link)

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.page)

  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(SEPARATOR_ICON_CLASS, className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.ellipsis)
  const srOnly = stylex.props(styles.srOnly)

  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(ELLIPSIS_ICON_CLASS, sx.className, className)}
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
