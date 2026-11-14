import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

/**
 * `group-data-[size=sm]/card:` — a compact card's paddings and title size.
 *
 * The group class is matched through `[data-slot="card"]` instead of
 * `.group\/card`, which is the same set of elements: only a `Card` carries that
 * slot, and only a `Card` carries the group class. The group marker stays in
 * the markup as a semantic hook. Header padding still recognizes the original
 * border marker, whose border styling now comes from StyleX.
 */
const IN_SM_CARD = ':is([data-slot="card"][data-size="sm"] *)'

const styles = stylex.create({
  // `group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card
  //  text-card-foreground py-4 has-data-[slot=card-footer]:pb-0
  //  has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3
  //  data-[size=sm]:has-data-[slot=card-footer]:pb-0`
  card: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    boxShadow:
      '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 0 #0000',
    borderTopLeftRadius: { default: radius.xl, ':is(*)>img:first-child': radius.xl },
    borderTopRightRadius: { default: radius.xl, ':is(*)>img:first-child': radius.xl },
    borderBottomLeftRadius: { default: radius.xl, ':is(*)>img:last-child': radius.xl },
    borderBottomRightRadius: { default: radius.xl, ':is(*)>img:last-child': radius.xl },
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    color: colors.cardForeground,
    // `py-4` is `padding-block`, a **logical** property, while `pt-0` and
    // `pb-0` are physical longhands — and Blink resolves a physical longhand
    // over the logical property that maps to it whatever the source order, so
    // the two `:has()` rules win at either size even though `data-[size=sm]:py-3`
    // is emitted after them. Keeping Tailwind's own choice of property keeps
    // that resolution, which is why the size variant only restates
    // `padding-block`.
    paddingBlock: '1rem',
    paddingTop: { default: null, ':has(>img:first-child)': '0rem' },
    paddingBottom: { default: null, ':has([data-slot="card-footer"])': '0rem' },
  },
  // `data-[size=sm]:gap-3 data-[size=sm]:py-3`. The third size rule,
  // `data-[size=sm]:has-data-[slot=card-footer]:pb-0`, is redundant: the
  // unconditional `pb-0` above already wins at this size for the reason there.
  cardSm: {
    gap: '0.75rem',
    paddingBlock: '0.75rem',
  },

  // `grid auto-rows-min items-start gap-1 px-4 rounded-t-xl
  //  @container/card-header group-data-[size=sm]/card:px-3
  //  has-data-[slot=card-action]:grid-cols-[1fr_auto]
  //  has-data-[slot=card-description]:grid-rows-[auto_auto]`
  header: {
    paddingBottom: {
      default: null,
      ':is(.border-b)': { default: '1rem', [IN_SM_CARD]: '0.75rem' },
    },
    display: 'grid',
    gridAutoRows: 'min-content',
    alignItems: 'flex-start',
    gap: '0.25rem',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    containerType: 'inline-size',
    containerName: 'card-header',
    // `px-4` / `group-data-[size=sm]/card:px-3` — `padding-inline`, as Tailwind
    // writes it, so a physical `pl-*`/`pr-*` keeps resolving over it.
    paddingInline: { default: '1rem', [IN_SM_CARD]: '0.75rem' },
    gridTemplateColumns: { default: null, ':has([data-slot="card-action"])': '1fr auto' },
    gridTemplateRows: { default: null, ':has([data-slot="card-description"])': 'auto auto' },
  },

  // `text-base leading-snug font-medium group-data-[size=sm]/card:text-sm`
  title: {
    fontSize: { default: '1rem', [IN_SM_CARD]: '0.875rem' },
    // `leading-snug` overrides both paired line heights, so this is the whole
    // story at either size — and it is a standalone `leading-*`, which is a
    // ratio in Tailwind too, so it keeps inheriting as one.
    lineHeight: 1.375,
    fontWeight: 500,
  },

  // `text-muted-foreground text-sm`
  description: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `col-start-2 row-span-2 row-start-1 self-start justify-self-end`
  action: {
    gridColumnStart: 2,
    // `row-span-2` writes `grid-row: span 2 / span 2` and `row-start-1` is
    // emitted after it, so the start resolves to 1 and only the end keeps the
    // span. Written as the two longhands that leaves.
    gridRowStart: 1,
    gridRowEnd: 'span 2',
    alignSelf: 'flex-start',
    justifySelf: 'flex-end',
  },

  // `px-4 group-data-[size=sm]/card:px-3`
  content: {
    paddingInline: { default: '1rem', [IN_SM_CARD]: '0.75rem' },
  },

  // `flex items-center bg-muted/50 rounded-b-xl border-t p-4
  //  group-data-[size=sm]/card:p-3`
  footer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    borderBottomRightRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    // `border-t`: the width and the style only. The colour keeps coming from
    // preflight's `border-color: var(--default-border-color, currentcolor)`.
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    padding: { default: '1rem', [IN_SM_CARD]: '0.75rem' },
  },
})

// The border marker is preserved for CardHeader's existing conditional padding.

function Card({
  className,
  style,
  sx: sxProp,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm'; sx?: Sx }) {
  const sx = stylex.props(styles.card, size === 'sm' && styles.cardSm, sxProp)

  return (
    <div
      data-slot="card"
      data-size={size}
      className={['group/card', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)

  return (
    <div
      data-slot="card-header"
      className={['group/card-header', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.title, sxProp)

  return (
    <div
      data-slot="card-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.description, sxProp)

  return (
    <div
      data-slot="card-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardAction({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.action, sxProp)

  return (
    <div
      data-slot="card-action"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.content, sxProp)

  return (
    <div
      data-slot="card-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardFooter({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.footer, sxProp)

  return (
    <div
      data-slot="card-footer"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
