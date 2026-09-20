import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

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
    // `bg-transparent`. The three background rules this variant used to sit
    // next to stay Tailwind classes; see `CONTESTED_CLASSES`.
    backgroundColor: 'transparent',
    // `text-base`, as the pair of lengths it resolves to. The `md:text-sm` half
    // stays a Tailwind class; see `CONTESTED_CLASSES`.
    fontSize: '1rem',
    lineHeight: '1.5rem',
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

/**
 * The nine classes that stay Tailwind, and why.
 *
 * A StyleX rule lives in a `priorityN` layer, below `utilities`, and layer order
 * beats specificity — so **any** utility a caller passes on this element now
 * wins, where `twMerge` used to delete only the base class with the *same*
 * variant key and leave a conditional one alone. These are the declarations a
 * current caller would shadow that way:
 *
 * - **background** — `sidebar.tsx`'s `SidebarInput` passes `bg-background`,
 *   which used to lose to `dark:bg-input/30` (0,2,0 against 0,1,0). As StyleX
 *   the dark background would disappear, visibly, in the `sidebar-parts`
 *   gallery section. The two `disabled:` rules are the same property and are
 *   kept with it.
 * - **the rings** — the same caller passes `shadow-none`, which used to lose to
 *   `focus-visible:ring-3`; as StyleX the sidebar's search input would stop
 *   painting a focus ring. Keeping the classes also keeps `--tw-ring-color`
 *   set on the element, which `InputGroupInput`'s `ring-0` composes its
 *   (zero-width) ring colour from.
 * - **`md:text-sm`** — `routes/skill-detail.tsx` passes `text-2xl` to the name
 *   input. A media query adds no specificity but is emitted later, so above
 *   48rem the component's own size still wins over the caller's; that is the
 *   quirk `quirk-input-caller-text-2xl` pins. As StyleX it would lose.
 *
 * `twMerge` still merges them for a caller on the same keys, exactly as before.
 * They go away with `sidebar.tsx` (PR 17) and with the routes that pass a text
 * size (PR 23, PR 28).
 */
const CONTESTED_CLASSES =
  'dark:bg-input/30 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:bg-input/50 dark:disabled:bg-input/80 focus-visible:ring-3 aria-invalid:ring-3 md:text-sm'

function Input({ className, style, type, ...props }: React.ComponentProps<'input'>) {
  const sx = stylex.props(styles.base)

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(CONTESTED_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Input }
