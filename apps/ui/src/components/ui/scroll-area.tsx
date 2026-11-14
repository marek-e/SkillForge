import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'

import { colors, motion } from '@/styles/tokens.stylex'

/**
 * The three-pixel focus ring, written as the whole five-layer chain Tailwind
 * composes (`tailwind-values.md` §5, §6).
 */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'

/** `transition-colors` — the property list Tailwind writes for it. */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/**
 * `data-horizontal:` / `data-vertical:` are `shadcn/tailwind.css` custom
 * variants (`&:where([data-orientation="…"])`), not Tailwind's generic
 * arbitrary-attribute syntax (`tailwind-values.md` §9).
 */
const HORIZONTAL = ':is([data-orientation="horizontal"])'
const VERTICAL = ':is([data-orientation="vertical"])'

const styles = stylex.create({
  // `relative`
  root: {
    position: 'relative',
  },

  // `size-full rounded-[inherit] transition-[color,box-shadow] outline-none`
  // plus the focus ring and the one-pixel outline width.
  viewport: {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    transitionProperty: 'color, box-shadow',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none` also sets `--tw-outline-style: none`, and the focus rule
    // writes `outline-style: var(--tw-outline-style)` — so the focus rule
    // resolves back to `none` and the viewport never grows an outline, in
    // either state. Only the width it also sets is observable, and only to a
    // computed-style dump.
    outlineStyle: 'none',
    outlineWidth: { default: null, ':focus-visible': '1px' },
    boxShadow: { default: null, ':focus-visible': RING_FOCUS },
  },

  // `flex touch-none p-px transition-colors select-none`, plus the
  // per-orientation box the two custom variants give it.
  scrollbar: {
    display: 'flex',
    touchAction: 'none',
    padding: '1px',
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    userSelect: 'none',
    height: {
      default: null,
      [HORIZONTAL]: '0.625rem',
      [VERTICAL]: '100%',
    },
    width: {
      default: null,
      [VERTICAL]: '0.625rem',
    },
    flexDirection: {
      default: null,
      [HORIZONTAL]: 'column',
    },
    borderTopWidth: { default: null, [HORIZONTAL]: '1px' },
    borderTopStyle: { default: null, [HORIZONTAL]: 'solid' },
    borderTopColor: { default: null, [HORIZONTAL]: 'transparent' },
    borderLeftWidth: { default: null, [VERTICAL]: '1px' },
    borderLeftStyle: { default: null, [VERTICAL]: 'solid' },
    borderLeftColor: { default: null, [VERTICAL]: 'transparent' },
  },

  // `rounded-full bg-border relative flex-1`
  thumb: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: colors.border,
    position: 'relative',
    flex: 1,
  },
})

function ScrollArea({
  className,
  style,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & { sx?: Sx }) {
  const sx = stylex.props(styles.root, sxProp)
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        {...stylex.props(styles.viewport)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  style,
  orientation = 'vertical',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & { sx?: Sx }) {
  const sx = stylex.props(styles.scrollbar, sxProp)
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        {...stylex.props(styles.thumb)}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
