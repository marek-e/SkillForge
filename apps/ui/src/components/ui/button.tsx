import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import type { Sx } from '@/lib/sx'

/**
 * Kept **unchanged** for `components/ui/calendar.tsx`, which still calls
 * `buttonVariants({ variant })` to style day cells that are not `Button`s
 * (PR 16 migrates it). `Button` itself no longer uses it; the equivalent
 * StyleX styles are below and every class in this string has a comment there.
 *
 * Removing it is PR 32's job, together with `cva`, `cn` and `tailwind-merge`.
 */
const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
        destructive:
          'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/**
 * The composed `box-shadow` a three-pixel ring utility produces (PR 04).
 *
 * Tailwind never writes a ring directly: it sets `--tw-ring-shadow` and then
 * re-declares the five-layer `box-shadow` chain
 * (`--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow`,
 * `--tw-ring-shadow`, `--tw-shadow`), where every layer a utility did not set
 * defaults to `0 0 #0000`. The four no-op layers are written out here rather
 * than flattened to one shadow, so the *computed* `box-shadow` string is
 * identical too and no computed-style snapshot needs an exception
 * (`tailwind-values.md` §5, §6).
 *
 * The named and the arbitrary three-pixel ring both resolve to
 * `calc(3px + var(--tw-ring-offset-width))` with an offset width of `0px`.
 */

/** the focus ring: `focus-visible:ring-3` with `focus-visible:ring-ring/50` */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'
/** the destructive ring at 20% — every `aria-invalid:` ring, and the destructive variant's focus ring */
const RING_DESTRUCTIVE_20 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent), 0 0 #0000'
/** the destructive ring at 40%, used by every `dark:` ring rule */
const RING_DESTRUCTIVE_40 =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent), 0 0 #0000'

/**
 * Every hover *variant* below is nested in `@media (hover: hover)`, because
 * that is the shape Tailwind v4 emits for one (`&:hover { @media … { … } }`).
 * PR 04 wrote them bare; the wrapper was added by PR 09's correction commit.
 * A `:hover` inside an arbitrary *selector* is the one shape that stays bare,
 * and this file has none. See `conventions.md`.
 *
 * The wrapper also raises the rule's StyleX priority, so a nested combination
 * that has to keep beating a plain hover (the `secondary` expanded background,
 * every `dark:` hover below) carries the wrapper at its own level too.
 */
const styles = stylex.create({
  base: {
    // `inline-flex`
    display: 'inline-flex',
    // `items-center`
    alignItems: 'center',
    // `justify-center`
    justifyContent: 'center',
    // `whitespace-nowrap`
    whiteSpace: 'nowrap',
    // `shrink-0` and `[&_svg]:shrink-0`
    flexShrink: {
      default: 0,
      ':is(*) svg': 0,
    },
    // `select-none`
    userSelect: 'none',
    // `rounded-lg`; the sizes that carry their own radius override it
    borderRadius: radius.lg,
    // `border` (1px, --tw-border-style defaults to solid). The colour is a
    // variant's business, because `focus-visible:` and `aria-invalid:` also
    // write it and a StyleX property is merged whole.
    borderWidth: '1px',
    borderStyle: 'solid',
    // `bg-clip-padding`
    backgroundClip: 'padding-box',
    // `text-sm`; the paired line-height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    // `font-medium`
    fontWeight: 500,
    // `transition-all`, with Tailwind's `--default-transition-*`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:pointer-events-none` and `[&_svg]:pointer-events-none`
    pointerEvents: {
      default: null,
      ':disabled': 'none',
      ':is(*) svg': 'none',
    },
    // `disabled:opacity-50`
    opacity: {
      default: null,
      ':disabled': '50%',
    },
  },

  // --- variants -------------------------------------------------------------
  // Each variant restates the `focus-visible:` / `aria-invalid:` border colour
  // and ring from the base string. They cannot stay in `base`: `stylex.props`
  // merges one property as a whole, so a variant's `borderColor` would drop
  // the base's conditions for it.

  // `bg-primary text-primary-foreground hover:bg-primary/80`
  default: {
    backgroundColor: {
      default: colors.primary,
      '@media (hover: hover)': {
        default: null,
        ':hover': 'color-mix(in oklab, var(--primary) 80%, transparent)',
      },
    },
    color: colors.primaryForeground,
    // `border-transparent`, `focus-visible:border-ring`,
    // `aria-invalid:border-destructive`, `dark:aria-invalid:border-destructive/50`
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
      // they win when a button is both. Nesting states that instead of relying
      // on the order two same-priority StyleX rules happen to be emitted in.
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
    // `focus-visible:ring-3 focus-visible:ring-ring/50`,
    // `aria-invalid:ring-3 aria-invalid:ring-destructive/20`,
    // `dark:aria-invalid:ring-destructive/40`
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
  },

  // `border-border bg-background hover:bg-muted hover:text-foreground
  //  dark:bg-input/30 dark:border-input dark:hover:bg-input/50
  //  aria-expanded:bg-muted aria-expanded:text-foreground`
  outline: {
    backgroundColor: {
      default: colors.background,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      // `aria-expanded:bg-muted` and `hover:bg-muted` set the same value, so
      // the light mode combination needs no nesting — and must not have any,
      // because a `[aria-expanded]:hover` rule would also outrank
      // `dark:hover:bg-input/50`, which Tailwind lets win in dark mode.
      ':is([aria-expanded="true"])': colors.muted,
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--input) 30%, transparent)',
        // `dark:bg-input/30` is emitted after `aria-expanded:bg-muted` and has
        // the same specificity, so in dark mode an expanded outline button
        // keeps the input background instead of turning muted.
        ':is([aria-expanded="true"])': 'color-mix(in oklab, var(--input) 30%, transparent)',
        // `dark:hover:bg-input/50` is (0,3,0) and outranks both of the above.
        '@media (hover: hover)': {
          default: null,
          ':hover': 'color-mix(in oklab, var(--input) 50%, transparent)',
        },
      },
    },
    color: {
      default: null,
      ':is([aria-expanded="true"])': colors.foreground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    borderColor: {
      default: colors.border,
      ':focus-visible': colors.ring,
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
      // they win when a button is both. Nesting states that instead of relying
      // on the order two same-priority StyleX rules happen to be emitted in.
      ':is([aria-invalid="true"])': {
        default: colors.destructive,
        ':focus-visible': colors.destructive,
      },
      ':is(.dark *)': {
        default: colors.input,
        // `dark:border-input` is emitted after `focus-visible:border-ring` and
        // has the same specificity, so in dark mode a focused outline button
        // keeps the input border rather than the ring colour.
        ':focus-visible': colors.input,
        ':is([aria-invalid="true"])': {
          default: 'color-mix(in oklab, var(--destructive) 50%, transparent)',
          ':focus-visible': 'color-mix(in oklab, var(--destructive) 50%, transparent)',
        },
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
  },

  // `bg-secondary text-secondary-foreground hover:bg-secondary/80
  //  aria-expanded:bg-secondary aria-expanded:text-secondary-foreground`
  secondary: {
    backgroundColor: {
      default: colors.secondary,
      '@media (hover: hover)': {
        default: null,
        ':hover': 'color-mix(in oklab, var(--secondary) 80%, transparent)',
      },
      // `aria-expanded:bg-secondary` is emitted after `hover:bg-secondary/80`,
      // so an expanded button keeps the solid colour while hovered. This is the
      // only variant where the two rules disagree (`outline` and `ghost` set the
      // same value in both), so only this one has to say it.
      ':is([aria-expanded="true"])': {
        default: colors.secondary,
        '@media (hover: hover)': { default: null, ':hover': colors.secondary },
      },
    },
    color: {
      default: colors.secondaryForeground,
      ':is([aria-expanded="true"])': colors.secondaryForeground,
    },
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
      // they win when a button is both. Nesting states that instead of relying
      // on the order two same-priority StyleX rules happen to be emitted in.
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
  },

  // `text-muted-foreground hover:bg-muted hover:text-foreground
  //  aria-expanded:bg-muted aria-expanded:text-foreground`
  ghost: {
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
    },
    color: {
      default: colors.mutedForeground,
      ':is([aria-expanded="true"])': colors.foreground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
      // they win when a button is both. Nesting states that instead of relying
      // on the order two same-priority StyleX rules happen to be emitted in.
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
  },

  // `bg-destructive/10 hover:bg-destructive/20 dark:bg-destructive/20
  //  dark:hover:bg-destructive/30 text-destructive
  //  focus-visible:border-destructive/40 focus-visible:ring-destructive/20
  //  dark:focus-visible:ring-destructive/40`
  destructive: {
    backgroundColor: {
      default: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
      '@media (hover: hover)': {
        default: null,
        ':hover': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
      },
      ':is(.dark *)': {
        default: 'color-mix(in oklab, var(--destructive) 20%, transparent)',
        '@media (hover: hover)': {
          default: null,
          ':hover': 'color-mix(in oklab, var(--destructive) 30%, transparent)',
        },
      },
    },
    color: colors.destructive,
    // The variant's own `focus-visible:border-destructive/40` replaces the
    // base's `focus-visible:border-ring` (`twMerge` deduplicated them on the
    // same `focus-visible:border-color` key, keeping the later one).
    borderColor: {
      default: 'transparent',
      ':focus-visible': 'color-mix(in oklab, var(--destructive) 40%, transparent)',
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
      // they win when a button is both. Nesting states that instead of relying
      // on the order two same-priority StyleX rules happen to be emitted in.
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
    boxShadow: {
      default: null,
      ':focus-visible': RING_DESTRUCTIVE_20,
      ':is([aria-invalid="true"])': {
        default: RING_DESTRUCTIVE_20,
        ':focus-visible': RING_DESTRUCTIVE_20,
      },
      ':is(.dark *)': {
        default: null,
        ':focus-visible': RING_DESTRUCTIVE_40,
        ':is([aria-invalid="true"])': {
          default: RING_DESTRUCTIVE_40,
          ':focus-visible': RING_DESTRUCTIVE_40,
        },
      },
    },
  },

  // `text-primary underline-offset-4 hover:underline`
  link: {
    color: colors.primary,
    textUnderlineOffset: '4px',
    textDecorationLine: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': 'underline' },
    },
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      // `aria-invalid:` utilities are emitted after `focus-visible:` ones, so
      // they win when a button is both. Nesting states that instead of relying
      // on the order two same-priority StyleX rules happen to be emitted in.
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
  },

  // --- sizes ----------------------------------------------------------------
  // The icon sizing that used to ride along here stayed a Tailwind class; see
  // `SIZE_ICON_CLASS` below.

  // `h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2`
  sizeDefault: {
    height: '2rem',
    gap: '0.375rem',
    paddingLeft: { default: '0.625rem', ':has([data-icon="inline-start"])': '0.5rem' },
    paddingRight: { default: '0.625rem', ':has([data-icon="inline-end"])': '0.5rem' },
  },

  // `h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs
  //  in-data-[slot=button-group]:rounded-lg has-data-[icon=…]:p{l,r}-1.5
  //  [&_svg:not([class*='size-'])]:size-3`
  sizeXs: {
    height: '1.5rem',
    gap: '0.25rem',
    // `--radius-md` expanded to the project's own `calc()` (never reference a
    // Tailwind-generated custom property from StyleX)
    borderRadius: {
      default: 'min(calc(var(--radius) - 2px), 10px)',
      ':is([data-slot="button-group"] *)': radius.lg,
    },
    paddingLeft: { default: '0.5rem', ':has([data-icon="inline-start"])': '0.375rem' },
    paddingRight: { default: '0.5rem', ':has([data-icon="inline-end"])': '0.375rem' },
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem]
  //  in-data-[slot=button-group]:rounded-lg has-data-[icon=…]:p{l,r}-1.5
  //  [&_svg:not([class*='size-'])]:size-3.5`
  sizeSm: {
    height: '1.75rem',
    gap: '0.25rem',
    borderRadius: {
      default: 'min(calc(var(--radius) - 2px), 12px)',
      ':is([data-slot="button-group"] *)': radius.lg,
    },
    paddingLeft: { default: '0.625rem', ':has([data-icon="inline-start"])': '0.375rem' },
    paddingRight: { default: '0.625rem', ':has([data-icon="inline-end"])': '0.375rem' },
    fontSize: '0.8rem',
    // An arbitrary `text-[0.8rem]` has no paired line-height: Tailwind emits
    // `line-height: var(--tw-leading)`, and `--tw-leading` is registered with
    // no initial value, so the declaration is invalid at computed-value time
    // and the property falls back to `inherit` — which is what the size has
    // always computed to (19.2px under the gallery's 1.5 line-height).
    lineHeight: 'inherit',
  },

  // `h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3`
  sizeLg: {
    height: '2.25rem',
    gap: '0.375rem',
    paddingLeft: { default: '0.625rem', ':has([data-icon="inline-start"])': '0.75rem' },
    paddingRight: { default: '0.625rem', ':has([data-icon="inline-end"])': '0.75rem' },
  },

  // `size-8`
  sizeIcon: {
    width: '2rem',
    height: '2rem',
  },

  // `size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg
  //  [&_svg:not([class*='size-'])]:size-3`
  sizeIconXs: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: {
      default: 'min(calc(var(--radius) - 2px), 10px)',
      ':is([data-slot="button-group"] *)': radius.lg,
    },
  },

  // `size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg`
  sizeIconSm: {
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: {
      default: 'min(calc(var(--radius) - 2px), 12px)',
      ':is([data-slot="button-group"] *)': radius.lg,
    },
  },

  // `size-9`
  sizeIconLg: {
    width: '2.25rem',
    height: '2.25rem',
  },
})

const variantStyles = {
  default: styles.default,
  outline: styles.outline,
  secondary: styles.secondary,
  ghost: styles.ghost,
  destructive: styles.destructive,
  link: styles.link,
} as const

const sizeStyles = {
  default: styles.sizeDefault,
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
  'icon-xs': styles.sizeIconXs,
  'icon-sm': styles.sizeIconSm,
  'icon-lg': styles.sizeIconLg,
} as const

/**
 * `[&_svg:not([class*='size-'])]:size-N`, kept as a Tailwind class (PR 04).
 *
 * This rule styles an element the button does not own — a `lucide` icon whose
 * class comes from the call site. As a StyleX rule it would sit in a
 * `priorityN` layer, and layer order beats specificity, so it would lose to any
 * width/height utility on the icon itself. `mode-toggle.tsx` renders exactly
 * that: `<Sun className="h-[1.2rem] w-[1.2rem]" />`, which today loses to the
 * button's `(0,2,1)` descendant selector and renders at 16px, not 19.2px.
 *
 * It therefore stays Tailwind until the components that pass those icon classes
 * are StyleX (PR 20 for `mode-toggle`). `twMerge` still lets a caller override
 * it, exactly as before, because it is merged on the same key.
 */
const SIZE_ICON_CLASS = {
  default: "[&_svg:not([class*='size-'])]:size-4",
  xs: "[&_svg:not([class*='size-'])]:size-3",
  sm: "[&_svg:not([class*='size-'])]:size-3.5",
  lg: "[&_svg:not([class*='size-'])]:size-4",
  icon: "[&_svg:not([class*='size-'])]:size-4",
  'icon-xs': "[&_svg:not([class*='size-'])]:size-3",
  'icon-sm': "[&_svg:not([class*='size-'])]:size-4",
  'icon-lg': "[&_svg:not([class*='size-'])]:size-4",
} as const

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
      /**
       * StyleX overrides from a StyleX caller, applied last so they win.
       *
       * `InputGroupButton` (PR 05) is the first one: its `shadow-none` used to
       * be a utility class, which — once the ring moved to StyleX — beat the
       * focus ring instead of losing to it. Passing the reset through here puts
       * both declarations back in the same cascade layer.
       */
      sx?: Sx
    }
>(
  (
    {
      className,
      style,
      variant = 'default',
      size = 'default',
      asChild = false,
      sx: sxProp,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot.Root : 'button'
    const sx = stylex.props(
      styles.base,
      variantStyles[variant ?? 'default'],
      sizeStyles[size ?? 'default'],
      sxProp
    )

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        // `group/button` stays a literal class: it carries no styling of its
        // own, but `ProjectsTable` and `routes/project-detail` still style a
        // descendant icon with `group-hover/button:fill-yellow-400/50`, which
        // needs this exact class name on the ancestor until those files migrate.
        className={cn('group/button', SIZE_ICON_CLASS[size ?? 'default'], sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
