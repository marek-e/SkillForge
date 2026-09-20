import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * Tailwind's `pulse`, character for character
 * (`@keyframes pulse { 50% { opacity: .5 } }`, `tailwind-values.md` §8).
 *
 * The generated name differs from Tailwind's `pulse` — StyleX hashes it — so
 * `animation-name` is the one computed value this migration cannot keep. The
 * duration, the timing function, the iteration count and the frames are all
 * identical, and `animations.spec.ts` captures the element at 0 ms, 500 ms and
 * 1000 ms to prove the curve is the same.
 */
const pulse = stylex.keyframes({
  '50%': { opacity: 0.5 },
})

const styles = stylex.create({
  // `bg-muted rounded-md animate-pulse`
  skeleton: {
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    animationName: pulse,
    animationDuration: '2s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationIterationCount: 'infinite',
  },
})

function Skeleton({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.skeleton)

  return (
    <div
      data-slot="skeleton"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Skeleton }
