import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

/** Was `cva('text-sm text-muted-foreground')` (PR 03). */
const styles = stylex.create({
  base: {
    // `text-sm` -> font-size plus the line-height Tailwind pairs with it,
    // `calc(1.25 / 0.875)`, written as the length it resolves to. lightningcss folds a
    // ratio to five decimals, which no longer multiplies out to a whole pixel
    // (see conventions.md, "Paired line-heights").
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    // `text-muted-foreground`
    color: colors.mutedForeground,
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface MutedProps extends React.HTMLAttributes<HTMLParagraphElement> {
  sx?: Sx
  variant?: keyof typeof variantStyles | null | undefined
}

const Muted = React.forwardRef<HTMLParagraphElement, MutedProps>(
  ({ className, style, variant, sx: sxProp, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'], sxProp)
    return (
      <p
        ref={ref}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Muted.displayName = 'Muted'

export { Muted }
