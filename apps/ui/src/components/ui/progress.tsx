import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { colors, motion } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

const styles = stylex.create({
  // `bg-muted h-1 rounded-full relative flex w-full items-center overflow-x-hidden`
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '0.25rem',
    // `rounded-full`
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: colors.muted,
    overflowX: 'hidden',
  },

  // `bg-primary size-full flex-1 transition-all`
  indicator: {
    width: '100%',
    height: '100%',
    // `flex-1` compiles to the `flex: 1` shorthand in Tailwind v4, not to
    // `1 1 0%`; the computed longhands are the same either way.
    flex: 1,
    backgroundColor: colors.primary,
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },
})

function Progress({
  className,
  style,
  sx: sxProp,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { sx?: Sx }) {
  const sx = stylex.props(styles.root, sxProp)
  const indicator = stylex.props(styles.indicator)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={indicator.className}
        // The runtime transform stays an inline style, computed exactly as
        // before: StyleX never sees the value.
        style={{ ...indicator.style, transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
