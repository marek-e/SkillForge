import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { colors, motion } from '@/styles/tokens.stylex'
import { CheckIcon } from 'lucide-react'

/**
 * `data-checked:`, spelled out.
 *
 * One of the custom variants `shadcn/tailwind.css` adds, so it matches either
 * Radix's `data-state="checked"` or a bare `data-checked` that is not
 * `"false"` — and, notably, **not** `data-state="indeterminate"`. Copied from
 * the built CSS.
 */
const CHECKED = ':is([data-state="checked"], [data-checked]:not([data-checked="false"]))'

/** `group-has-disabled/field:` — an ancestor `Field` that contains a disabled control. */
const IN_DISABLED_FIELD = ':is(.group\\/field:has(:disabled) *)'

/** `focus-visible:ring-3` with `focus-visible:ring-ring/50` (see `button.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** `aria-invalid:ring-3` with `aria-invalid:ring-destructive/20` */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** `dark:aria-invalid:ring-destructive/40` */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

const styles = stylex.create({
  root: {
    // `flex items-center justify-center`
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // `relative`
    position: 'relative',
    // `size-4`
    width: '1rem',
    height: '1rem',
    // `shrink-0`
    flexShrink: 0,
    // `rounded-[4px]`
    borderRadius: '4px',
    // `border`
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-input`, `data-checked:border-primary`,
    // `focus-visible:border-ring`, `aria-invalid:border-destructive`,
    // `aria-invalid:aria-checked:border-primary`,
    // `dark:aria-invalid:border-destructive/50`.
    //
    // Six rules, and Tailwind ranks them by specificity, not by order: the
    // custom `data-checked` variant compiles through `:where()`, so its rule is
    // (0,1,0) and loses to both `focus-visible:` and `aria-invalid:` (0,2,0);
    // `aria-invalid:aria-checked:` is (0,3,0) and wins over those; and the
    // `dark:aria-invalid:` rule, also (0,3,0), is emitted last and wins over
    // that. StyleX gives every single-condition key the *same* priority
    // (default + 40), so their relative order in the sheet depends on which
    // module first emitted an identical declaration — unpredictable. Every
    // combination is therefore written out, which is what raises its priority.
    borderColor: {
      default: colors.input,
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
      [CHECKED]: {
        default: colors.primary,
        // `focus-visible:border-ring` is (0,2,0) and beats the (0,1,0)
        // `data-checked:` rule.
        ':focus-visible': colors.ring,
        // `aria-invalid:aria-checked:border-primary` is (0,3,0) and beats both
        // `aria-invalid:border-destructive` and the focus ring.
        ':is([aria-invalid="true"])': {
          default: colors.primary,
          ':focus-visible': colors.primary,
        },
        ':is(.dark *)': {
          default: colors.primary,
          ':focus-visible': colors.ring,
          // `dark:aria-invalid:border-destructive/50` is emitted after the
          // `aria-checked` rule, and both are (0,3,0), so it wins.
          ':is([aria-invalid="true"])': {
            default: 'color-mix(in oklab, var(--destructive) 50%, transparent)',
            ':focus-visible': 'color-mix(in oklab, var(--destructive) 50%, transparent)',
          },
        },
      },
    },
    // `dark:bg-input/30`, `data-checked:bg-primary`, `dark:data-checked:bg-primary`.
    // The dark duplicate exists because `dark:bg-input/30` is (0,2,0) and would
    // otherwise beat the (0,1,0) `data-checked:` rule.
    backgroundColor: {
      default: null,
      [CHECKED]: colors.primary,
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
        [CHECKED]: colors.primary,
      },
    },
    // `data-checked:text-primary-foreground`
    color: {
      default: null,
      [CHECKED]: colors.primaryForeground,
    },
    // `focus-visible:ring-3` / `aria-invalid:ring-3` and their colours
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
    // `transition-colors`
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:cursor-not-allowed`
    cursor: {
      default: null,
      ':disabled': 'not-allowed',
    },
    // `disabled:opacity-50` and `group-has-disabled/field:opacity-50`
    opacity: {
      default: null,
      ':disabled': '50%',
      [IN_DISABLED_FIELD]: '50%',
    },
    // `after:absolute after:-inset-x-3 after:-inset-y-2` — the invisible box
    // that widens the pointer target beyond the 16px square. Tailwind's
    // `after:` variant also emits `content: var(--tw-content)`, whose
    // registered initial value is the empty string.
    '::after': {
      content: '""',
      position: 'absolute',
      insetInline: '-0.75rem',
      insetBlock: '-0.5rem',
    },
  },

  // `[&>svg]:size-3.5 grid place-content-center text-current transition-none`
  indicator: {
    display: 'grid',
    placeContent: 'center',
    color: 'currentColor',
    transitionProperty: 'none',
    // The icon is rendered by this file, so the child rule can be StyleX.
    width: { default: null, ':is(*)>svg': '0.875rem' },
    height: { default: null, ':is(*)>svg': '0.875rem' },
  },
})

function Checkbox({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const sx = stylex.props(styles.root)
  const indicator = stylex.props(styles.indicator)

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      // `peer` carries no styling of its own, but `Label`'s `peer-disabled:`
      // rules select through it (PR 05 keeps that rule as StyleX on `Label`,
      // which still needs this exact class name on the sibling).
      className={['peer', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={indicator.className}
        style={indicator.style}
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
