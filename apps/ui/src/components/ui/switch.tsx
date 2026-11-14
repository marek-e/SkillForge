import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { colors, motion } from '@/styles/tokens.stylex'

/** `data-checked:` / `data-unchecked:` / `data-disabled:`, the `shadcn/tailwind.css` custom variants. */
const CHECKED = ':is([data-state="checked"], [data-checked]:not([data-checked="false"]))'
const UNCHECKED = ':is([data-state="unchecked"], [data-unchecked]:not([data-unchecked="false"]))'
const DISABLED = ':is([data-state="disabled"], [data-disabled]:not([data-disabled="false"]))'

/** `focus-visible:ring-3` with `focus-visible:ring-ring/50` (see `button.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** `aria-invalid:ring-3` with `aria-invalid:ring-destructive/20` */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** `dark:aria-invalid:ring-destructive/40` */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

/**
 * `ring-0` on the thumb: a zero-width ring whose colour falls back to
 * `currentcolor`, composed into the same five-layer chain as every other ring.
 */
const RING_ZERO = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 0 currentcolor, 0 0 #0000'

const styles = stylex.create({
  // `peer group/switch relative inline-flex items-center shrink-0
  //  rounded-full border border-transparent transition-all outline-none`
  root: {
    display: 'inline-flex',
    position: 'relative',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 'calc(infinity * 1px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-transparent`, `focus-visible:border-ring`,
    // `aria-invalid:border-destructive`, `dark:aria-invalid:border-destructive/50`
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is([aria-invalid="true"])': {
        default: colors.destructive,
        ':focus-visible': colors.destructive,
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default: 'color-mix(in oklab, var(--destructive) 50%, transparent)',
          ':focus-visible': 'color-mix(in oklab, var(--destructive) 50%, transparent)',
        },
      },
    },
    // `data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80`
    backgroundColor: {
      default: null,
      [CHECKED]: colors.primary,
      [UNCHECKED]: colors.input,
      ':is(.dark *)': {
        default: null,
        [UNCHECKED]: 'color-mix(in oklab, var(--input) 80%, transparent)',
      },
    },
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      ':is([aria-invalid="true"])': {
        default: RING_DESTRUCTIVE_20,
        ':focus-visible': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default: RING_DESTRUCTIVE_40,
          ':focus-visible': RING_DESTRUCTIVE_40,
        },
      },
    },
    // `transition-all`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `data-disabled:cursor-not-allowed`
    cursor: {
      default: null,
      [DISABLED]: 'not-allowed',
    },
    // `data-disabled:opacity-50`
    opacity: {
      default: null,
      [DISABLED]: '50%',
    },
    // `after:absolute after:-inset-x-3 after:-inset-y-2`, the pointer target
    '::after': {
      content: '""',
      position: 'absolute',
      insetInline: '-0.75rem',
      insetBlock: '-0.5rem',
    },
  },
  // `data-[size=default]:h-[18.4px] data-[size=default]:w-[32px]`
  rootDefault: {
    height: '18.4px',
    width: '32px',
  },
  // `data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]`
  rootSm: {
    height: '14px',
    width: '24px',
  },

  // `bg-background dark:data-unchecked:bg-foreground
  //  dark:data-checked:bg-primary-foreground rounded-full pointer-events-none
  //  block ring-0 transition-transform`
  thumb: {
    display: 'block',
    pointerEvents: 'none',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: {
      default: colors.background,
      ':is(.dark *)': {
        default: null,
        [UNCHECKED]: colors.foreground,
        [CHECKED]: colors.primaryForeground,
      },
    },
    boxShadow: RING_ZERO,
    // `transition-transform`
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },
  // `group-data-[size=default]/switch:size-4` plus the two translate rules.
  // The size no longer has to be read off an ancestor: this component renders
  // the thumb itself, so the size variant picks the style directly and only
  // the thumb's own `data-state` stays a condition.
  thumbDefault: {
    width: '1rem',
    height: '1rem',
    translate: {
      default: null,
      [CHECKED]: 'calc(100% - 2px)',
      [UNCHECKED]: '0',
    },
  },
  // `group-data-[size=sm]/switch:size-3` plus the same two translate rules
  thumbSm: {
    width: '0.75rem',
    height: '0.75rem',
    translate: {
      default: null,
      [CHECKED]: 'calc(100% - 2px)',
      [UNCHECKED]: '0',
    },
  },
})

function Switch({
  className,
  style,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  const sx = stylex.props(styles.root, size === 'sm' ? styles.rootSm : styles.rootDefault)
  const thumb = stylex.props(styles.thumb, size === 'sm' ? styles.thumbSm : styles.thumbDefault)

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      // `peer` is what `Label`'s `peer-disabled:` rules select through;
      // `group/switch` carries no styling of its own now that the thumb takes
      // its size directly, but it stays part of the rendered markup.
      className={['peer group/switch', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={thumb.className}
        style={thumb.style}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
