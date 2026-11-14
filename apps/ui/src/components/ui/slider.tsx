import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Slider as SliderPrimitive } from 'radix-ui'

import { colors, motion } from '@/styles/tokens.stylex'

/** `data-horizontal:` / `data-vertical:` / `data-disabled:`, custom variants of `shadcn/tailwind.css`. */
const HORIZONTAL = ':is([data-orientation="horizontal"])'
const VERTICAL = ':is([data-orientation="vertical"])'
const DISABLED = ':is([data-state="disabled"], [data-disabled]:not([data-disabled="false"]))'

/**
 * The three-pixel ring of the thumb, in the thumb's own `ring-ring/50` colour,
 * composed into the five-layer chain (see `button.tsx`). Hover, focus-visible
 * and active all ask for the same ring, so they all resolve to this one value
 * whatever their order.
 */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'

const styles = stylex.create({
  // `relative flex w-full touch-none items-center select-none
  //  data-vertical:min-h-40 data-vertical:h-full data-vertical:w-auto
  //  data-vertical:flex-col data-disabled:opacity-50`
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    touchAction: 'none',
    userSelect: 'none',
    width: {
      default: '100%',
      [VERTICAL]: 'auto',
    },
    height: {
      default: null,
      [VERTICAL]: '100%',
    },
    minHeight: {
      default: null,
      [VERTICAL]: '10rem',
    },
    flexDirection: {
      default: null,
      [VERTICAL]: 'column',
    },
    opacity: {
      default: null,
      [DISABLED]: '50%',
    },
  },

  // `bg-muted rounded-full data-horizontal:h-1 data-vertical:w-1 relative grow
  //  overflow-hidden data-horizontal:w-full data-vertical:h-full`
  track: {
    position: 'relative',
    flexGrow: 1,
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: colors.muted,
    width: {
      default: null,
      [HORIZONTAL]: '100%',
      [VERTICAL]: '0.25rem',
    },
    height: {
      default: null,
      [HORIZONTAL]: '0.25rem',
      [VERTICAL]: '100%',
    },
  },

  // `bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full`
  range: {
    position: 'absolute',
    userSelect: 'none',
    backgroundColor: colors.primary,
    width: {
      default: null,
      [VERTICAL]: '100%',
    },
    height: {
      default: null,
      [HORIZONTAL]: '100%',
    },
  },

  // `border-ring ring-ring/50 relative size-3 rounded-full border bg-white
  //  transition-[color,box-shadow] block shrink-0 select-none
  //  hover:ring-3 focus-visible:ring-3 active:ring-3 focus-visible:outline-hidden
  //  disabled:pointer-events-none disabled:opacity-50`
  thumb: {
    display: 'block',
    position: 'relative',
    width: '0.75rem',
    height: '0.75rem',
    flexShrink: 0,
    userSelect: 'none',
    borderRadius: 'calc(infinity * 1px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.ring,
    // `bg-white`
    backgroundColor: '#fff',
    // A plain `hover:` utility **is** wrapped in `@media (hover: hover)` — see
    // `conventions.md`. All three states ask for the same ring, so their order
    // does not matter.
    boxShadow: {
      default: null,
      '@media (hover: hover)': {
        default: null,
        ':hover': RING_FOCUS,
      },
      ':focus-visible': RING_FOCUS,
      ':active': RING_FOCUS,
    },
    // `focus-visible:outline-hidden`: no outline, except under forced colours,
    // where Tailwind restores a transparent one so the focus ring survives.
    outlineStyle: {
      default: null,
      ':focus-visible': {
        default: 'none',
        '@media (forced-colors: active)': 'solid',
      },
    },
    outlineWidth: {
      default: null,
      ':focus-visible': {
        default: null,
        '@media (forced-colors: active)': '2px',
      },
    },
    outlineColor: {
      default: null,
      ':focus-visible': {
        default: null,
        '@media (forced-colors: active)': 'transparent',
      },
    },
    outlineOffset: {
      default: null,
      ':focus-visible': {
        default: null,
        '@media (forced-colors: active)': '2px',
      },
    },
    // `transition-[color,box-shadow]`
    transitionProperty: 'color, box-shadow',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `disabled:pointer-events-none disabled:opacity-50`. Radix renders the
    // thumb as a `span`, so `:disabled` can never match it; kept as it is.
    pointerEvents: {
      default: null,
      ':disabled': 'none',
    },
    opacity: {
      default: null,
      ':disabled': '50%',
    },
    // `after:absolute after:-inset-2`, the pointer target
    '::after': {
      content: '""',
      position: 'absolute',
      inset: '-0.5rem',
    },
  },
})

function Slider({
  className,
  style,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  )

  const sx = stylex.props(styles.root)
  const track = stylex.props(styles.track)
  const range = stylex.props(styles.range)
  const thumb = stylex.props(styles.thumb)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={track.className}
        style={track.style}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={range.className}
          style={range.style}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={thumb.className}
          style={thumb.style}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
