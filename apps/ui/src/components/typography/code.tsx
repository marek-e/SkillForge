import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, fonts, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * Was
 * `cva('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', { block: 'block w-full overflow-x-auto rounded-lg border bg-muted p-4' })`
 * (PR 03).
 *
 * Two things `twMerge` used to do that the style objects now have to do
 * themselves:
 *
 * - `p-4` replaced `px-[0.3rem] py-[0.2rem]`. StyleX ranks a shorthand *below*
 *   a longhand, so a `padding` shorthand in `block` would lose to the base's
 *   `paddingLeft`/`paddingTop`. The four longhands are written out instead.
 * - `rounded-lg` replaced `rounded` and the second `bg-muted` was a no-op;
 *   `borderRadius` is the same property in both objects, so the later one wins,
 *   and the repeated background is simply not restated.
 */
const styles = stylex.create({
  base: {
    // `relative`
    position: 'relative',
    // `rounded` (the bare utility, Tailwind's built-in 0.25rem - not the
    // project's --radius scale, which only feeds the named steps)
    borderRadius: '0.25rem',
    // `bg-muted`
    backgroundColor: colors.muted,
    // `px-[0.3rem]`
    paddingLeft: '0.3rem',
    paddingRight: '0.3rem',
    // `py-[0.2rem]`
    paddingTop: '0.2rem',
    paddingBottom: '0.2rem',
    // `font-mono` -> Tailwind's default --font-mono stack, which the project
    // does not override
    fontFamily: fonts.mono,
    // `text-sm` -> font-size plus the line-height Tailwind pairs with it,
    // `calc(1.25 / 0.875)`, written as the length it resolves to. lightningcss folds a
    // ratio to five decimals, which no longer multiplies out to a whole pixel
    // (see conventions.md, "Paired line-heights").
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    // `font-semibold`
    fontWeight: 600,
  },
  block: {
    // `block`
    display: 'block',
    // `w-full`
    width: '100%',
    // `overflow-x-auto`
    overflowX: 'auto',
    // `rounded-lg` -> var(--radius)
    borderRadius: radius.lg,
    // `border`
    borderStyle: 'solid',
    borderWidth: '1px',
    // `p-4`, as longhands so it beats the base's own padding longhands
    paddingTop: '1rem',
    paddingRight: '1rem',
    paddingBottom: '1rem',
    paddingLeft: '1rem',
  },
})

const variantStyles = { default: null, block: styles.block } as const

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof variantStyles | null | undefined
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, style, variant, ...props }, ref) => {
    const Comp = variant === 'block' ? 'pre' : 'code'
    const sx = stylex.props(styles.base, variantStyles[variant ?? 'default'])
    return (
      <Comp
        ref={ref as any}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Code.displayName = 'Code'

export { Code }
