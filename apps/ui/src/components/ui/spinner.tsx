import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Tailwind's `spin`: `@keyframes spin { to { transform: rotate(360deg) } }`. */
const spin = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
})

const styles = stylex.create({
  // `animate-spin`
  spinner: {
    animationName: spin,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
})

/**
 * `size-4` stays a Tailwind class, and not because a caller contests it.
 *
 * `Button` and `EmptyMedia` size the icons inside them with
 * `[&_svg:not([class*='size-'])]:size-4` (or `size-3.5`), a rule that looks at
 * the **literal text of the child's `class` attribute**. A spinner whose only
 * classes were StyleX hashes stops matching `[class*='size-']` and is resized
 * by its container instead. Measured with the size moved into `stylex.create`
 * and the class dropped: `spinner-in-button` fell from 16px to 14px, while
 * every other spinner case stayed at 16px.
 *
 * So the class is part of the contract, not decoration. It goes when those
 * `[class*='size-']` rules do, in PR 32.
 */
const SIZE_CLASS = 'size-4'

function Spinner({ className, style, ...props }: React.ComponentProps<'svg'>) {
  const sx = stylex.props(styles.spinner)

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(SIZE_CLASS, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Spinner }
