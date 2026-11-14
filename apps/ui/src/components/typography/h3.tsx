import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import type { Sx } from '@/lib/sx'

/** Was `cva('scroll-m-20 text-2xl font-semibold tracking-tight')` (PR 03). */
const styles = stylex.create({
  base: {
    // `scroll-m-20` -> calc(var(--spacing) * 20), with --spacing: 0.25rem
    scrollMargin: '5rem',
    // `text-2xl` -> font-size plus the line-height Tailwind pairs with it,
    // `calc(2 / 1.5)`, written as the length it resolves to. lightningcss folds a
    // ratio to five decimals, which no longer multiplies out to a whole pixel
    // (see conventions.md, "Paired line-heights").
    fontSize: '1.5rem',
    lineHeight: '2rem',
    // `font-semibold`
    fontWeight: 600,
    // `tracking-tight`
    letterSpacing: '-0.025em',
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface H3Props extends React.HTMLAttributes<HTMLHeadingElement> {
  sx?: Sx
  variant?: keyof typeof variantStyles | null | undefined
}

const H3 = React.forwardRef<HTMLHeadingElement, H3Props>(
  ({ className, style, variant, sx: sxProp, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'], sxProp)
    return (
      <h3
        ref={ref}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
H3.displayName = 'H3'

export { H3 }
