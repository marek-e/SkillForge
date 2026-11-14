import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import type { Sx } from '@/lib/sx'

/** Was `cva('leading-7 [&:not(:first-child)]:mt-6')` (PR 03). */
const styles = stylex.create({
  base: {
    // `leading-7` -> calc(var(--spacing) * 7)
    lineHeight: '1.75rem',
    // `[&:not(:first-child)]:mt-6` -> the arbitrary variant's own selector
    marginTop: {
      default: null,
      ':not(:first-child)': '1.5rem',
    },
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {
  sx?: Sx
  variant?: keyof typeof variantStyles | null | undefined
}

const P = React.forwardRef<HTMLParagraphElement, PProps>(
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
P.displayName = 'P'

export { P }
