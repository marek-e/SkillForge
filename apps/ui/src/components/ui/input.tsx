import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'

/**
 * `transition-colors`, spelled out.
 *
 * The three `--tw-gradient-*` entries are part of the property *list* Tailwind
 * generates, not a `var()` reference to a Tailwind custom property, and the
 * computed `transition-property` string is snapshotted, so they are copied
 * verbatim (`tailwind-values.md` §8).
 */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

const styles = stylex.create({
  base: {
    // `w-full`
    width: '100%',
    // `min-w-0`
    minWidth: '0rem',
    // `h-8`
    height: '2rem',
    // `px-2.5`
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
    // `py-1`
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    // `rounded-lg`
    borderRadius: radius.lg,
    // `border` (1px, `--tw-border-style` defaults to solid)
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-input`, `focus-visible:border-ring`, `aria-invalid:border-destructive`,
    // `dark:aria-invalid:border-destructive/50`
    borderColor: {
      default: colors.input,
      ':focus-visible': colors.ring,
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones and
      // have the same specificity, so they win when a control is both. The
      // combination is written out rather than left to the order two StyleX
      // rules of equal priority happen to be emitted in.
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
    backgroundColor: {
      default: 'transparent',
      ':disabled': 'color-mix(in oklab, var(--input) 50%, transparent)',
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
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
    // `transition-colors`, with Tailwind's `--default-transition-*`
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:pointer-events-none`
    pointerEvents: {
      default: null,
      ':disabled': 'none',
    },
    // `disabled:cursor-not-allowed`
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
    // `file:inline-flex file:h-6 file:border-0 file:bg-transparent
    //  file:text-sm file:font-medium file:text-foreground`
    '::file-selector-button': {
      display: 'inline-flex',
      height: '1.5rem',
      borderWidth: '0px',
      borderStyle: 'solid',
      backgroundColor: 'transparent',
      color: colors.foreground,
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      fontWeight: 500,
    },
  },
})

function Input({
  className,
  style,
  type,
  sx: sxProp,
  ...props
}: React.ComponentProps<'input'> & { sx?: Sx }) {
  const sx = stylex.props(styles.base, sxProp)

  return (
    <input
      type={type}
      data-slot="input"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Input }
