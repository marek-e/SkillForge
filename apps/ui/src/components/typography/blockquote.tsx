import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { cn } from '@/lib/utils'

/**
 * Was `cva('mt-6 border-l-2 pl-6 italic')` (PR 03).
 *
 * As with `H2`, only the left border's width and style move to StyleX: the
 * colour stays with the `* { border-color: var(--border) }` rule in
 * `@layer base`.
 */
const styles = stylex.create({
  base: {
    // `mt-6`
    marginTop: '1.5rem',
    // `border-l-2`
    borderLeftStyle: 'solid',
    borderLeftWidth: '2px',
    // `pl-6`
    paddingLeft: '1.5rem',
    // `italic`
    fontStyle: 'italic',
  },
})

/**
 * The `default` variant added no classes, so it maps to no style. Keeping the
 * lookup keeps the prop's contract (and its `null`) exactly as `cva` had it.
 */
const variantStyles = { default: null } as const

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  variant?: keyof typeof variantStyles | null | undefined
}

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, style, variant, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'])
    return (
      <blockquote
        ref={ref}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Blockquote.displayName = 'Blockquote'

export { Blockquote }
