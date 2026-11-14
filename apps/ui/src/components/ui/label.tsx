import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Label as LabelPrimitive } from 'radix-ui'

import type { Sx } from '@/lib/sx'

const styles = stylex.create({
  base: {
    // `flex`
    display: 'flex',
    // `items-center`
    alignItems: 'center',
    // `gap-2`
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: 1,
    // `font-medium`
    fontWeight: 500,
    // `select-none`
    userSelect: 'none',
    // `group-data-[disabled=true]:opacity-50` and `peer-disabled:opacity-50`.
    // Both are conditions on *this* element (an ancestor with the `group`
    // class, or a preceding sibling with the `peer` class), so they are
    // ordinary StyleX conditions. The `peer` class itself is written by the
    // caller — `Input` carries it in `label-with-disabled-peer`.
    opacity: {
      default: null,
      ':is(.group[data-disabled="true"] *)': '50%',
      ':is(.peer:disabled ~ *)': '50%',
    },
    // `group-data-[disabled=true]:pointer-events-none`
    pointerEvents: {
      default: null,
      ':is(.group[data-disabled="true"] *)': 'none',
    },
    // `peer-disabled:cursor-not-allowed`
    cursor: {
      default: null,
      ':is(.peer:disabled ~ *)': 'not-allowed',
    },
  },
})

function Label({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  /** StyleX overrides from a StyleX caller — `FieldLabel` is the only one. */
  sx?: Sx
}) {
  const sx = stylex.props(styles.base, sxProp)

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Label }
