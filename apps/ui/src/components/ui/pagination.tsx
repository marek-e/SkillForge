import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

/**
 * `pl-1.5!` / `pr-1.5!` on `PaginationPrevious` / `PaginationNext`, kept as
 * Tailwind classes.
 *
 * They are not this component's own styling: they are a caller override handed
 * to `Button`, and the `!` exists to beat `Button`'s own
 * `has-data-[icon=inline-start]:pl-2` (and its `inline-end` twin), which both
 * elements trigger by rendering a `data-icon` chevron. An `!important` utility
 * is the one shape StyleX cannot express, and a `sx` override would instead
 * replace `Button`'s whole conditional padding declaration
 * (`stylex.props` merges a property as a whole). Removed in PR 32, when
 * `Button` stops carrying the Tailwind bridge at all.
 */
const PREVIOUS_PADDING_CLASS = 'pl-1.5!'
const NEXT_PADDING_CLASS = 'pr-1.5!'

/**
 * `[&_svg:not([class*='size-'])]:size-4` on `PaginationEllipsis`, kept as a
 * Tailwind class: it styles an `svg` the component does not own, and it matches
 * on the *literal text* of the child's `class` attribute, which no StyleX hash
 * can reproduce (`conventions.md`, "A class name can itself be the contract").
 * Removed in PR 32.
 */
const ELLIPSIS_ICON_CLASS = "[&_svg:not([class*='size-'])]:size-4"

const styles = stylex.create({
  // `mx-auto flex w-full justify-center`
  nav: {
    marginInline: 'auto',
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },

  // `gap-0.5 flex items-center`
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
  },

  // `hidden sm:block` on the previous/next labels
  label: {
    display: {
      default: 'none',
      '@media (width >= 40rem)': 'block',
    },
  },

  // `size-8 flex items-center justify-center`
  ellipsis: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
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

function Pagination({ className, style, ...props }: React.ComponentProps<'nav'>) {
  const sx = stylex.props(styles.nav)

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function PaginationContent({ className, style, ...props }: React.ComponentProps<'ul'>) {
  const sx = stylex.props(styles.content)

  return (
    <ul
      data-slot="pagination-content"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

/**
 * Unchanged by this row: the link has no styling of its own, it renders a
 * `Button` with `asChild`, and `Button` has been StyleX since PR 04.
 */
function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button asChild variant={isActive ? 'outline' : 'ghost'} size={size} className={cn(className)}>
      <a
        aria-current={isActive ? 'page' : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const label = stylex.props(styles.label)

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn(PREVIOUS_PADDING_CLASS, className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span {...label}>{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const label = stylex.props(styles.label)

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn(NEXT_PADDING_CLASS, className)}
      {...props}
    >
      <span {...label}>{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.ellipsis)
  const srOnly = stylex.props(styles.srOnly)

  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(ELLIPSIS_ICON_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <MoreHorizontalIcon />
      <span {...srOnly}>More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
