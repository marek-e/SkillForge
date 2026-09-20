import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { cn } from '@/lib/utils'

/** Was `cva('scroll-m-20 text-base font-semibold tracking-tight')` (PR 03). */
const styles = stylex.create({
  base: {
    // `scroll-m-20` -> calc(var(--spacing) * 20), with --spacing: 0.25rem
    scrollMargin: '5rem',
    // `text-base` -> font-size plus the line-height Tailwind pairs with it,
    // `calc(1.5 / 1)`, written as the length it resolves to. lightningcss folds a
    // ratio to five decimals, which no longer multiplies out to a whole pixel
    // (see conventions.md, "Paired line-heights").
    fontSize: '1rem',
    lineHeight: '1.5rem',
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

export interface H6Props extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: keyof typeof variantStyles | null | undefined
}

const H6 = React.forwardRef<HTMLHeadingElement, H6Props>(
  ({ className, style, variant, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'])
    return (
      <h6
        ref={ref}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
H6.displayName = 'H6'

export { H6 }
