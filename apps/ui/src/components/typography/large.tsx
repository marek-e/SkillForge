import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { cn } from '@/lib/utils'

/** Was `cva('text-lg font-semibold')` (PR 03). */
const styles = stylex.create({
  base: {
    // `text-lg` -> font-size plus the line-height Tailwind pairs with it,
    // `calc(1.75 / 1.125)`, written as the length it resolves to. lightningcss folds a
    // ratio to five decimals, which no longer multiplies out to a whole pixel
    // (see conventions.md, "Paired line-heights").
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    // `font-semibold`
    fontWeight: 600,
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface LargeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles | null | undefined
}

const Large = React.forwardRef<HTMLDivElement, LargeProps>(
  ({ className, style, variant, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'])
    return (
      <div
        ref={ref}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Large.displayName = 'Large'

export { Large }
