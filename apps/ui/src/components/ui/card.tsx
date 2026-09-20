import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * `group-data-[size=sm]/card:` — a compact card's paddings and title size.
 *
 * The group class is matched through `[data-slot="card"]` instead of
 * `.group\/card`, which is the same set of elements: only a `Card` carries that
 * slot, and only a `Card` carries the group class. The class itself stays in
 * the markup because the two `[.border-b]` rules below are still Tailwind and
 * still select through it.
 */
const IN_SM_CARD = ':is([data-slot="card"][data-size="sm"] *)'

const styles = stylex.create({
  // `group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card
  //  text-card-foreground py-4 has-data-[slot=card-footer]:pb-0
  //  has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3
  //  data-[size=sm]:has-data-[slot=card-footer]:pb-0`
  card: {
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

/**
 * The classes that stay Tailwind on `Card`, and why.
 *
 * A StyleX rule sits in a `priorityN` layer, below `utilities`, and layer order
 * beats specificity, so any utility on the same element — or on a child this
 * component reaches into — now wins where `twMerge` used to delete only the
 * base class with the *same* variant key.
 *
 * - **the ring** — `ToolCardCompact` passes `hover:ring-foreground/20
 *   hover:shadow-md` and `SkillCard` passes `hover:ring-foreground/20`. Those
 *   utilities do not paint a ring by themselves: they set `--tw-ring-color`
 *   and `--tw-shadow`, which the `box-shadow` chain *this* class writes reads.
 *   A StyleX `box-shadow` writes the property, never the variables, so both
 *   callers would silently stop changing on hover. They go with PR 22 and
 *   PR 23.
 * - **`text-sm`** — a paired `text-*` on a container. Tailwind passes the
 *   unitless `calc(1.25 / 0.875)` down to every descendant that has a font
 *   size but no line height of its own, and `Button`'s `sm` size is exactly
 *   that (`text-[0.8rem]` has no paired line height, so it computes to
 *   `inherit`). A StyleX `line-height: 1.25rem` would pass 20px down instead
 *   of 18.29px. It goes when the utility layer does (PR 32).
 * - **the two image radii** — `*:[img:first-child]:rounded-t-xl` and
 *   `*:[img:last-child]:rounded-b-xl` style an `<img>` the *caller* supplies,
 *   so any radius utility on that image would outrank a StyleX rule (PR 32).
 *
 * `group/card` carries no styling itself; `CardHeader`'s two `[.border-b]`
 * rules still select through it.
 */
const CARD_CLASSES =
  'group/card ring-1 ring-foreground/10 text-sm *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl'

/**
 * `[.border-b]:pb-4` and `group-data-[size=sm]/card:[.border-b]:pb-3` — the
 * header pads itself differently when the **caller** gives it a `border-b`
 * class. The selector matches a Tailwind utility by name, so it can only stay a
 * Tailwind rule; it goes with the utility layer in PR 32. `group/card-header`
 * has no selector of its own any more but stays part of the markup.
 */
const HEADER_CLASSES =
  'group/card-header [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3'

function Card({
  className,
  style,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  const sx = stylex.props(styles.card, size === 'sm' && styles.cardSm)

  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(CARD_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardHeader({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.header)

  return (
    <div
      data-slot="card-header"
      className={cn(HEADER_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardTitle({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.title)

  return (
    <div
      data-slot="card-title"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardDescription({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.description)

  return (
    <div
      data-slot="card-description"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardAction({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.action)

  return (
    <div
      data-slot="card-action"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardContent({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.content)

  return (
    <div
      data-slot="card-content"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function CardFooter({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.footer)

  return (
    <div
      data-slot="card-footer"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
