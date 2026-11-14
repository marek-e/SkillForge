import * as stylex from '@stylexjs/stylex'
import * as ResizablePrimitive from 'react-resizable-panels'

import { colors, radius } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

/**
 * `aria-[orientation=…]:` is Tailwind's arbitrary-variant form and compiles to
 * an attribute selector on the element itself. `react-resizable-panels` writes
 * `aria-orientation` on the separator, and the *opposite* of the group's
 * direction: a horizontal group gets a vertical handle.
 */
const ARIA_HORIZONTAL = ':is([aria-orientation="horizontal"])'
const ARIA_VERTICAL = ':is([aria-orientation="vertical"])'

/**
 * The one-pixel focus ring, written as the whole five-layer chain Tailwind
 * composes (`tailwind-values.md` §5, §6). The ring-offset slot stays at its
 * no-op value: the offset *colour* class only sets a Tailwind variable, and
 * nothing in this file sets an offset *width*, so that layer never paints. See
 * the note on `RING_OFFSET_COLOR_CLASS`.
 */
const RING_FOCUS = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px var(--ring), 0 0 #0000'

const styles = stylex.create({
  // `flex h-full w-full aria-[orientation=vertical]:flex-col`
  //
  // Every declaration here is shadowed by the inline `style` that
  // `react-resizable-panels` puts on the same element, which is also why a
  // caller's height class does not change the group (see the PR 09 notes).
  // Kept as found.
  group: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: { default: null, [ARIA_VERTICAL]: 'column' },
  },

  handle: {
    // `bg-border`
    backgroundColor: colors.border,
    // `relative`
    position: 'relative',
    // `flex items-center justify-center`
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // `w-px`, and the horizontal handle's `h-px w-full`
    width: { default: '1px', [ARIA_HORIZONTAL]: '100%' },
    height: { default: null, [ARIA_HORIZONTAL]: '1px' },
    // `focus-visible:ring-1 focus-visible:ring-ring`
    boxShadow: { default: null, ':focus-visible': RING_FOCUS },
    // `focus-visible:outline-hidden`: no outline, except under forced colours,
    // where Tailwind restores a transparent one so the ring survives.
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

    // The hit area: a four-pixel band centred on the one-pixel handle, and its
    // horizontal mirror.
    //
    // Tailwind's `after:` variant also writes `content: var(--tw-content)`,
    // whose registered initial value is `""`, so the pseudo-element is always
    // generated. The half-step offset goes through the `translate` property
    // rather than `transform`, and the unset axis has a registered initial
    // value of `0`.
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: '0px',
      left: { default: '50%', [ARIA_HORIZONTAL]: '0px' },
      width: { default: '0.25rem', [ARIA_HORIZONTAL]: '100%' },
      height: { default: null, [ARIA_HORIZONTAL]: '0.25rem' },
      translate: { default: '-50% 0', [ARIA_HORIZONTAL]: '0 -50%' },
    },

    // The grip below, turned a quarter turn by the handle's own orientation.
    // Kept as a descendant key on the handle rather than moved onto the grip,
    // because that is the selector Tailwind emits; the `<div>` it reaches is
    // rendered by this file, so no caller utility can outrank it from the
    // `utilities` layer.
    rotate: { default: null, ':is([aria-orientation="horizontal"])>div': '90deg' },
  },

  // `bg-border h-6 w-1 rounded-lg z-10 flex shrink-0`
  grip: {
    backgroundColor: colors.border,
    height: '1.5rem',
    width: '0.25rem',
    borderRadius: radius.lg,
    zIndex: 10,
    display: 'flex',
    flexShrink: 0,
  },
})

function ResizablePanelGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: ResizablePrimitive.GroupProps & { sx?: Sx }) {
  const sx = stylex.props(styles.group, sxProp)
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  style,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  const sx = stylex.props(styles.handle)
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {withHandle && <div {...stylex.props(styles.grip)} />}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
