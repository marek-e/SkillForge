import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, motion } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * `transition-colors`, spelled out (see `input.tsx`; the three
 * `--tw-gradient-*` entries are part of the property *list* Tailwind writes,
 * and the computed string is snapshotted).
 */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/**
 * `bg-muted/50`, used by the footer and by a hovered row.
 */
const MUTED_50 = 'color-mix(in oklab, var(--muted) 50%, transparent)'

const styles = stylex.create({
  // `relative w-full overflow-x-auto`
  container: {
    position: 'relative',
    width: '100%',
    overflowX: 'auto',
  },

  // `w-full caption-bottom`
  table: {
    width: '100%',
    captionSide: 'bottom',
  },

  // `[&_tr]:border-b` — an arbitrary *descendant* rule, kept on the section
  // rather than moved onto `TableRow`: a `tr` is the caller's element, and a
  // raw `<tr>` (one that is not a `TableRow`) has to keep getting the border
  // exactly as it does today.
  header: {
    borderBottomWidth: { default: null, ':is(*) tr': '1px' },
    borderBottomStyle: { default: null, ':is(*) tr': 'solid' },
  },

  // `[&_tr:last-child]:border-0` — all four widths, because that is what
  // `border-0` writes. Written as longhands so they contest `TableRow`'s own
  // `border-b`: a StyleX shorthand has a lower property priority than a
  // longhand and would lose to it whatever the selector.
  body: {
    borderTopWidth: { default: null, ':is(*) tr:last-child': '0px' },
    borderRightWidth: { default: null, ':is(*) tr:last-child': '0px' },
    borderBottomWidth: { default: null, ':is(*) tr:last-child': '0px' },
    borderLeftWidth: { default: null, ':is(*) tr:last-child': '0px' },
    borderTopStyle: { default: null, ':is(*) tr:last-child': 'solid' },
    borderRightStyle: { default: null, ':is(*) tr:last-child': 'solid' },
    borderBottomStyle: { default: null, ':is(*) tr:last-child': 'solid' },
    borderLeftStyle: { default: null, ':is(*) tr:last-child': 'solid' },
  },

  // `bg-muted/50 border-t font-medium [&>tr]:last:border-b-0`
  footer: {
    backgroundColor: MUTED_50,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    fontWeight: 500,
    borderBottomWidth: { default: null, ':is(*)>tr:last-child': '0px' },
    borderBottomStyle: { default: null, ':is(*)>tr:last-child': 'solid' },
  },

  // `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted`
  row: {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': MUTED_50 },
      // `data-[state=selected]:bg-muted` and `hover:bg-muted/50` are both
      // (0,2,0) and Tailwind emits the selected rule **later**, so a selected
      // row keeps its solid background while hovered. StyleX ranks a plain
      // `:is()` below a hover in a media query, so the combination is written
      // out rather than left to that ranking.
      ':is([data-state="selected"])': {
        default: colors.muted,
        '@media (hover: hover)': { default: colors.muted, ':hover': colors.muted },
      },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },

  // `text-foreground h-10 px-2 text-left align-middle font-medium
  //  whitespace-nowrap [&:has([role=checkbox])]:pr-0`
  head: {
    color: colors.foreground,
    height: '2.5rem',
    // `px-2` is `padding-inline`, and the checkbox rule below writes the
    // physical longhand, which Blink resolves over the logical property
    // whatever the source order (see `card.tsx`). Keeping Tailwind's own
    // choice of property keeps that resolution.
    paddingInline: '0.5rem',
    paddingRight: { default: null, ':has([role="checkbox"])': '0rem' },
    textAlign: 'left',
    verticalAlign: 'middle',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  // `p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0`
  cell: {
    padding: '0.5rem',
    paddingRight: { default: null, ':has([role="checkbox"])': '0rem' },
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },

  // `text-muted-foreground mt-4 text-sm`
  caption: {
    color: colors.mutedForeground,
    marginTop: '1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

/**
 * `text-sm` stays a Tailwind class on the `<table>`.
 *
 * It is a paired `text-*` on a container: Tailwind passes the unitless
 * `calc(1.25 / 0.875)` down to every descendant that has a font size but no
 * line height of its own, and `ProjectsTable` puts a `Button size="sm"` in two
 * of its `TableHead`s — a size whose `text-[0.8rem]` has no paired line height
 * and therefore computes to `inherit`. A StyleX `line-height: 1.25rem` would
 * pass 20px down instead of 18.29px and grow both sort buttons. The class goes
 * when the utility layer does (PR 32).
 */
const TABLE_CLASSES = 'text-sm'

function Table({ className, style, ...props }: React.ComponentProps<'table'>) {
  const container = stylex.props(styles.container)
  const sx = stylex.props(styles.table)

  return (
    <div data-slot="table-container" className={container.className} style={container.style}>
      <table
        data-slot="table"
        className={cn(TABLE_CLASSES, sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, style, ...props }: React.ComponentProps<'thead'>) {
  const sx = stylex.props(styles.header)

  return (
    <thead
      data-slot="table-header"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TableBody({ className, style, ...props }: React.ComponentProps<'tbody'>) {
  const sx = stylex.props(styles.body)

  return (
    <tbody
      data-slot="table-body"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TableFooter({ className, style, ...props }: React.ComponentProps<'tfoot'>) {
  const sx = stylex.props(styles.footer)

  return (
    <tfoot
      data-slot="table-footer"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TableRow({ className, style, ...props }: React.ComponentProps<'tr'>) {
  const sx = stylex.props(styles.row)

  return (
    <tr
      data-slot="table-row"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TableHead({ className, style, ...props }: React.ComponentProps<'th'>) {
  const sx = stylex.props(styles.head)

  return (
    <th
      data-slot="table-head"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TableCell({ className, style, ...props }: React.ComponentProps<'td'>) {
  const sx = stylex.props(styles.cell)

  return (
    <td
      data-slot="table-cell"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TableCaption({ className, style, ...props }: React.ComponentProps<'caption'>) {
  const sx = stylex.props(styles.caption)

  return (
    <caption
      data-slot="table-caption"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
