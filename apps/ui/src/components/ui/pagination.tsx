import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'

import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

const styles = stylex.create({
  previous: { paddingLeft: '0.375rem' },
  next: { paddingRight: '0.375rem' },
  ellipsisIcon: {
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
  },
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

function Pagination({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'nav'> & { sx?: Sx }) {
  const sx = stylex.props(styles.nav, sxProp)

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'ul'> & { sx?: Sx }) {
  const sx = stylex.props(styles.content, sxProp)

  return (
    <ul
      data-slot="pagination-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
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
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'sx'> &
  React.ComponentProps<'a'>

/**
 * Unchanged by this row: the link has no styling of its own, it renders a
 * `Button` with `asChild`, and `Button` has been StyleX since PR 04.
 */
function PaginationLink({
  className,
  isActive,
  size = 'icon',
  sx: sxProp,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      sx={sxProp}
      className={[className].filter(Boolean).join(' ')}
    >
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
  sx: sxProp,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const label = stylex.props(styles.label)

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={className}
      sx={[sxProp, styles.previous]}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span {...label}>{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  sx: sxProp,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const label = stylex.props(styles.label)

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={className}
      sx={[sxProp, styles.next]}
      {...props}
    >
      <span {...label}>{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & { sx?: Sx }) {
  const sx = stylex.props(styles.ellipsis, sxProp)
  const srOnly = stylex.props(styles.srOnly)

  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={[stylex.props(styles.ellipsisIcon).className, sx.className, className]
        .filter(Boolean)
        .join(' ')}
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
