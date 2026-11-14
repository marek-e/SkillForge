import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Loader2Icon } from 'lucide-react'

import type { Sx } from '@/lib/sx'

/** Tailwind's `spin`: `@keyframes spin { to { transform: rotate(360deg) } }`. */
const spin = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
})

const styles = stylex.create({
  // `animate-spin`
  spinner: {
    width: '1rem',
    height: '1rem',
    animationName: spin,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
})

// This semantic marker preserves the icon-sizing selector contract.

function Spinner({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'svg'> & { sx?: Sx }) {
  const sx = stylex.props(styles.spinner, sxProp)

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={['size-explicit', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Spinner }
