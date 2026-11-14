import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import type { Sx } from '@/lib/sx'

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
  sx?: Sx
  variant?: keyof typeof variantStyles | null | undefined
}

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, style, variant, sx: sxProp, ...props }, ref) => {
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'], sxProp)
    return (
      <blockquote
        ref={ref}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Blockquote.displayName = 'Blockquote'

export { Blockquote }
