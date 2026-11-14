import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

const styles = stylex.create({
  base: {
    // `flex`
    display: 'flex',
    // `w-full`
    width: '100%',
    // `min-h-16`
    minHeight: '4rem',
    // `field-sizing-content`
    fieldSizing: 'content',
    // `px-2.5`
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
    // `py-2`
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    // `rounded-lg`
    borderRadius: radius.lg,
    // `border`
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-input`, `focus-visible:border-ring`, `aria-invalid:border-destructive`,
    // `dark:aria-invalid:border-destructive/50`
    borderColor: {
      default: colors.input,
      ':focus-visible': colors.ring,
      // `aria-invalid:` is emitted after `focus-visible:` at the same
      // specificity, so it wins when a control is both.
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
    // `bg-transparent`, `dark:bg-input/30`, `disabled:bg-input/50`,
    // `dark:disabled:bg-input/80`. Unlike `Input`, no caller passes a
    // background utility to a `Textarea`, so these can all be StyleX.
    backgroundColor: {
      default: 'transparent',
      ':disabled': 'color-mix(in oklab, var(--input) 50%, transparent)',
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
        // `dark:disabled:bg-input/80` is (0,3,0) and beats both single rules.
        ':disabled': 'color-mix(in oklab, var(--input) 80%, transparent)',
      },
    },
    fontSize: { default: '1rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: { default: '1.5rem', '@media (width >= 48rem)': '1.25rem' },
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000',
      ':is([aria-invalid="true"])': {
        default:
          '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000',
        ':focus-visible':
          '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000',
      },
      ':is(.dark *)': {
        default: null,
        ':is([aria-invalid="true"])': {
          default:
            '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000',
          ':focus-visible':
            '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000',
        },
      },
    },
    // `transition-colors`
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:cursor-not-allowed` (a textarea has no `pointer-events` rule)
    cursor: {
      default: null,
      ':disabled': 'not-allowed',
    },
    // `disabled:opacity-50`
    opacity: {
      default: null,
      ':disabled': '50%',
    },
    // `placeholder:text-muted-foreground`
    '::placeholder': {
      color: colors.mutedForeground,
    },
  },
})

function Textarea({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'textarea'> & { sx?: Sx }) {
  const sx = stylex.props(styles.base, sxProp)

  return (
    <textarea
      data-slot="textarea"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Textarea }
