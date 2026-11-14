import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import type { Sx } from '@/lib/sx'

/**
 * Was `cva('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0')`
 * (PR 03).
 *
 * `border-b` sets only the bottom width and style; the colour keeps coming from
 * the `* { border-color: var(--border) }` rule in `@layer base`, which StyleX
 * deliberately does not contest.
 */
const styles = stylex.create({
  base: {
    // `scroll-m-20` -> calc(var(--spacing) * 20), with --spacing: 0.25rem
    scrollMargin: '5rem',
    // `border-b` -> border-bottom-width: 1px, border-bottom-style: solid
    //  (Tailwind writes the style through --tw-border-style, which defaults to solid)
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    // `pb-2`
    paddingBottom: '0.5rem',
    // `text-3xl` -> font-size plus the line-height Tailwind pairs with it,
    // `calc(2.25 / 1.875)`, written as the length it resolves to. lightningcss folds a
    // ratio to five decimals, which no longer multiplies out to a whole pixel
    // (see conventions.md, "Paired line-heights").
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
    // `font-semibold`
    fontWeight: 600,
    // `tracking-tight`
    letterSpacing: '-0.025em',
    // `first:mt-0` -> the zero step of the spacing scale. Nothing else sets a
    // top margin here, so it only bites when a caller adds one.
    // (Spelling the utility out would be enough for Tailwind's scanner to start
    // emitting a rule for it; see conventions.md.)
    marginTop: {
      default: null,
      ':first-child': '0rem',
    },
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  sx?: Sx
  variant?: keyof typeof variantStyles | null | undefined
}

const H2 = React.forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, style, variant, sx: sxProp, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'], sxProp)
    return (
      <h2
        ref={ref}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
H2.displayName = 'H2'

export { H2 }
