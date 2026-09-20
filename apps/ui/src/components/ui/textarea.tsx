import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

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
    // `text-base`, as the pair of lengths it resolves to. `md:text-sm` stays a
    // Tailwind class; see `CONTESTED_CLASSES`.
    fontSize: '1rem',
    lineHeight: '1.5rem',
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

/**
 * Six classes that stay Tailwind, for the reasons spelled out in `input.tsx`.
 *
 * - `md:text-sm` sits in a media query, which adds no specificity but is
 *   emitted later in `@layer utilities`, so above 48rem it still wins over a
 *   caller's own `text-*`. Three callers pass `text-xs`
 *   (`routes/skill-detail.tsx`, `skills/SkillDetailResourceFiles.tsx` and the
 *   `textarea-mono` gallery case) and all three render at 14px on desktop
 *   today; as a StyleX rule it would lose to them and they would render at
 *   12px. Removed with those callers (PR 22, PR 23, PR 28).
 * - The five ring classes keep `--tw-ring-color` on the element, which
 *   `InputGroupTextarea`'s `ring-0` composes its zero-width ring colour from,
 *   and they keep a caller's `shadow-none` from winning. Kept in step with
 *   `Input`'s (PR 17).
 */
const CONTESTED_CLASSES =
  'focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 focus-visible:ring-3 aria-invalid:ring-3 md:text-sm'

function Textarea({ className, style, ...props }: React.ComponentProps<'textarea'>) {
  const sx = stylex.props(styles.base)

  return (
    <textarea
      data-slot="textarea"
      className={cn(CONTESTED_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Textarea }
