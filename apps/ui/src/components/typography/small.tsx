import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { cn } from '@/lib/utils'

/**
 * Was `cva('text-sm font-medium leading-none')` (PR 03).
 *
 * `text-sm` reads its line-height through `var(--tw-leading, …)` and
 * `leading-none` sets `--tw-leading: 1`, so the two together resolve to a plain
 * `line-height: 1` regardless of which rule the cascade picks.
 */
const styles = stylex.create({
  base: {
    // `text-sm`
    fontSize: '0.875rem',
    // `font-medium`
    fontWeight: 500,
    // `leading-none`, which wins over the paired --text-sm--line-height
    lineHeight: 1,
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface SmallProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof variantStyles | null | undefined
}

const Small = React.forwardRef<HTMLElement, SmallProps>(
  ({ className, style, variant, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'])
    return (
      <small
        ref={ref}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Small.displayName = 'Small'

export { Small }
