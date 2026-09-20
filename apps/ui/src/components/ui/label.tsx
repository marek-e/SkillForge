import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Label as LabelPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import type { Sx } from '@/lib/sx'

const styles = stylex.create({
  base: {
    // `flex`
    display: 'flex',
    // `items-center`
    alignItems: 'center',
    // `gap-2`
    gap: '0.5rem',
    // `text-sm`. The line height stays a Tailwind class; see
    // `CONTESTED_CLASSES`.
    fontSize: '0.875rem',
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

/**
 * `leading-none`, kept as a Tailwind class.
 *
 * A `leading-*` utility does two things: it sets `line-height` **and** it sets
 * `--tw-leading`, which every `text-*` utility reads through
 * `line-height: var(--tw-leading, <paired value>)`. A caller that passes only a
 * font size therefore inherits this line height today —
 * `routes/settings.tsx` renders `<Label className="text-base font-semibold">`
 * three times and gets `line-height: 1`, not `text-base`'s `1.5`.
 *
 * StyleX cannot write `--tw-leading`, and a StyleX `lineHeight` would lose to
 * the caller's `text-base` anyway (layer order beats specificity), so the
 * class stays until those callers are StyleX (PR 31, plus PR 23/PR 24 for the
 * dialogs). `twMerge` still lets `FieldLabel`'s `leading-snug` replace it,
 * exactly as before.
 */
const CONTESTED_CLASSES = 'leading-none'

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
      className={cn(CONTESTED_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Label }
