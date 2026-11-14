import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Separator as SeparatorPrimitive } from 'radix-ui'

import { colors } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

/**
 * `data-horizontal:` / `data-vertical:`, the `shadcn/tailwind.css` custom
 * variants — `&:where([data-orientation="horizontal"])` and its vertical twin,
 * written as `:is()` the way every other migrated file does.
 */
const HORIZONTAL = ':is([data-orientation="horizontal"])'
const VERTICAL = ':is([data-orientation="vertical"])'

const styles = stylex.create({
  // `bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full
  //  data-vertical:w-px data-vertical:self-stretch`
  separator: {
    backgroundColor: colors.border,
    flexShrink: 0,
    height: { default: null, [HORIZONTAL]: '1px' },
    width: { default: null, [HORIZONTAL]: '100%', [VERTICAL]: '1px' },
    alignSelf: { default: null, [VERTICAL]: 'stretch' },
  },
})

function Separator({
  className,
  style,
  orientation = 'horizontal',
  decorative = true,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  /**
   * StyleX overrides from a StyleX caller, applied last so they win.
   *
   * `ButtonGroupSeparator` and `FieldSeparator` are the two today. Both used to
   * send Tailwind classes, which worked only because `twMerge` deleted the
   * class they contested; a StyleX rule is merely overridden instead, and
   * `stylex.props` merges a property **as a whole**, so an override of `width`
   * or `height` has to restate every orientation this component declares.
   */
  sx?: Sx
}) {
  const sx = stylex.props(styles.separator, sxProp)

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Separator }
