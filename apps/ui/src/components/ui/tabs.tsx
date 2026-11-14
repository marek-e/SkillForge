import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import type { Sx } from '@/lib/sx'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { colors, motion, radius, typography } from '@/styles/tokens.stylex'

/**
 * Group markers kept as literal class names (PR 09).
 *
 * `TabsList` and `TabsTrigger` both style themselves from an ancestor's state:
 * the list reads the root's `data-orientation`, the trigger reads both that and
 * the list's `data-variant`. Tailwind expressed that with `group/tabs` and
 * `group/tabs-list`, and the StyleX conditions below select through exactly the
 * same class names, so the matched set of elements is unchanged.
 *
 * Both elements also carry the equivalent `data-slot`, so these could be
 * rewritten as `[data-slot="tabs"]` once nothing else depends on the class —
 * PR 32, together with `cn`.
 */
const GROUP_TABS = 'group/tabs'
const GROUP_TABS_LIST = 'group/tabs-list'

/** `group-data-horizontal/tabs:` — the root's `data-orientation`. */
const IN_HORIZONTAL_TABS = ':is(.group\\/tabs[data-orientation="horizontal"] *)'
/** `group-data-vertical/tabs:` */
const IN_VERTICAL_TABS = ':is(.group\\/tabs[data-orientation="vertical"] *)'
/** `group-data-[variant=default]/tabs-list:` — the list's `data-variant`. */
const IN_DEFAULT_LIST = ':is(.group\\/tabs-list[data-variant="default"] *)'
/** `group-data-[variant=line]/tabs-list:` */
const IN_LINE_LIST = ':is(.group\\/tabs-list[data-variant="line"] *)'

/**
 * `data-active:` is a `shadcn/tailwind.css` custom variant that matches
 * `[data-state="active"]` **or** a truthy `data-active` attribute. Radix only
 * ever writes `data-state`, so the second arm is unreachable here and the
 * condition is written as the first one alone
 * (`tailwind-values.md` §9, `conventions.md`).
 */
const ACTIVE = ':is([data-state="active"])'

/**
 * The composed `box-shadow` chains this file needs (`tailwind-values.md` §6).
 *
 * Tailwind never writes `box-shadow` directly: every shadow and ring utility
 * fills one slot of the five-layer chain
 * (`--tw-inset-shadow, --tw-inset-ring-shadow, --tw-ring-offset-shadow,
 * --tw-ring-shadow, --tw-shadow`) and re-declares the whole chain, leaving the
 * untouched slots at `0 0 #0000`.
 *
 * On a trigger the slots are written by **different rules that all apply at
 * once**: the focus ring fills the ring slot, and the list variant fills the
 * shadow slot. So the combinations are spelled out rather than resolved as if
 * one rule beat the other — which is why the focused active trigger of a
 * `default` list keeps both.
 */
const SHADOW_SM_LAYERS = '0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a'
const RING_FOCUS_LAYER = '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)'
const NO_LAYER = '0 0 #0000'

/** the focus ring alone */
const RING_FOCUS = `${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}, ${RING_FOCUS_LAYER}, ${NO_LAYER}`
/** the active shadow of a `default` list alone */
const SHADOW_SM = `${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}, ${SHADOW_SM_LAYERS}`
/** both of the above on the same element */
const RING_FOCUS_SHADOW_SM = `${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}, ${RING_FOCUS_LAYER}, ${SHADOW_SM_LAYERS}`
/** the shadow reset a `line` list applies to its active trigger */
const SHADOW_NONE = `${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}, ${NO_LAYER}`

const styles = stylex.create({
  // `gap-2 flex data-horizontal:flex-col`
  root: {
    gap: '0.5rem',
    display: 'flex',
    // `data-horizontal:` is the `shadcn/tailwind.css` custom variant
    // `&:where([data-orientation="horizontal"])`. A *horizontal* tab set is the
    // one that stacks, because the list sits above the panel.
    flexDirection: {
      default: null,
      ':is([data-orientation="horizontal"])': 'column',
    },
  },

  // `rounded-lg p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none
  //  text-muted-foreground inline-flex w-fit items-center justify-center
  //  group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col`
  list: {
    borderRadius: {
      default: radius.lg,
      // a plain attribute selector on the element itself, not the `data-*`
      // custom variant
      '[data-variant="line"]': '0px',
    },
    padding: '3px',
    height: {
      default: null,
      [IN_HORIZONTAL_TABS]: '2rem',
      [IN_VERTICAL_TABS]: 'fit-content',
    },
    color: colors.mutedForeground,
    display: 'inline-flex',
    width: 'fit-content',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: {
      default: null,
      [IN_VERTICAL_TABS]: 'column',
    },
  },

  // `bg-muted`
  listDefault: {
    backgroundColor: colors.muted,
  },

  // `gap-1 bg-transparent`
  listLine: {
    gap: '0.25rem',
    backgroundColor: 'transparent',
  },

  trigger: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    // `gap-1.5`
    gap: '0.375rem',
    // `rounded-md`
    borderRadius: radius.md,
    // `border` — 1px, `--tw-border-style` defaults to solid
    borderWidth: '1px',
    borderStyle: 'solid',
    // `border-transparent`, `focus-visible:border-ring`,
    // `dark:data-active:border-input`, and the line list's
    // `dark:…:data-active:border-transparent`.
    //
    // The dark active rule is emitted after the focus rule and has the same
    // specificity, so a focused **and** active trigger keeps the input border
    // in dark mode. The line-list rule is (0,3,0) and beats both, so it is
    // nested under the focus condition as well.
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is(.dark *)': {
        default: null,
        [ACTIVE]: {
          default: colors.input,
          ':focus-visible': colors.input,
        },
        [IN_LINE_LIST]: {
          default: null,
          [ACTIVE]: {
            default: 'transparent',
            ':focus-visible': 'transparent',
          },
        },
      },
    },
    // `px-1.5` / `py-0.5` — logical, as Tailwind writes them
    paddingInline: '0.375rem',
    paddingBlock: '0.125rem',
    // `font-medium`
    fontWeight: 500,
    // `data-active:bg-background`, `dark:data-active:bg-input/30`, the line
    // list's `bg-transparent` and its two active companions.
    //
    // The line-list rule is (0,2,0) while `data-active:bg-background` is only
    // (0,1,0) — `data-active:` wraps its own selector in `:where()` — so a
    // trigger inside a line list is transparent whether it is active or not, in
    // both themes. Each combination is written out rather than left to the
    // order two same-priority StyleX rules happen to be emitted in.
    backgroundColor: {
      default: null,
      [ACTIVE]: colors.background,
      ':is(.dark *)': {
        default: null,
        [ACTIVE]: 'color-mix(in oklab, var(--input) 30%, transparent)',
      },
      [IN_LINE_LIST]: {
        default: 'transparent',
        [ACTIVE]: 'transparent',
        ':is(.dark *)': {
          default: 'transparent',
          [ACTIVE]: 'transparent',
        },
      },
    },
    // `text-foreground/60 hover:text-foreground dark:text-muted-foreground
    //  dark:hover:text-foreground data-active:text-foreground
    //  dark:data-active:text-foreground`
    color: {
      default: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
      [ACTIVE]: colors.foreground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
      ':is(.dark *)': {
        default: colors.mutedForeground,
        [ACTIVE]: colors.foreground,
        '@media (hover: hover)': { default: null, ':hover': colors.foreground },
      },
    },
    // `focus-visible:outline-ring focus-visible:outline-1`; the trigger has no
    // `outline-none`, so the style comes from `--tw-outline-style`, whose
    // registered initial value is `solid`.
    outlineColor: { default: null, ':focus-visible': colors.ring },
    outlineStyle: { default: null, ':focus-visible': 'solid' },
    outlineWidth: { default: null, ':focus-visible': '1px' },
    // `relative`
    position: 'relative',
    // `inline-flex`
    display: 'inline-flex',
    // `h-[calc(100%-1px)]`
    height: 'calc(100% - 1px)',
    // `flex-1` — `flex: 1` in Tailwind v4, not `1 1 0%`
    flex: 1,
    // `items-center`
    alignItems: 'center',
    // `justify-center group-data-vertical/tabs:justify-start`
    justifyContent: {
      default: 'center',
      [IN_VERTICAL_TABS]: 'flex-start',
    },
    // `whitespace-nowrap`
    whiteSpace: 'nowrap',
    // `transition-all`, with Tailwind's `--default-transition-*`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `group-data-vertical/tabs:w-full`
    width: { default: null, [IN_VERTICAL_TABS]: '100%' },
    // The three rules that write the shadow chain; see the constants above.
    boxShadow: {
      default: null,
      ':focus-visible': RING_FOCUS,
      [IN_DEFAULT_LIST]: {
        default: null,
        [ACTIVE]: { default: SHADOW_SM, ':focus-visible': RING_FOCUS_SHADOW_SM },
      },
      [IN_LINE_LIST]: {
        default: null,
        [ACTIVE]: { default: SHADOW_NONE, ':focus-visible': RING_FOCUS },
      },
    },
    // `disabled:pointer-events-none`
    pointerEvents: { default: null, ':disabled': 'none' },
    // `disabled:opacity-50`
    opacity: { default: null, ':disabled': '50%' },

    // The line-variant indicator. Tailwind's `after:` variant also writes
    // `content: var(--tw-content)`, whose registered initial value is `""`, so
    // the pseudo-element is generated on every trigger and only the opacity
    // tells the active one apart.
    '::after': {
      content: '""',
      backgroundColor: colors.foreground,
      position: 'absolute',
      opacity: {
        default: 0,
        [IN_LINE_LIST]: { default: 0, [ACTIVE]: 1 },
      },
      transitionProperty: 'opacity',
      transitionTimingFunction: motion.ease,
      transitionDuration: motion.duration,
      // the horizontal indicator: full width, five pixels below the trigger
      insetInline: { default: null, [IN_HORIZONTAL_TABS]: '0px' },
      bottom: { default: null, [IN_HORIZONTAL_TABS]: '-5px' },
      height: { default: null, [IN_HORIZONTAL_TABS]: '0.125rem' },
      // the vertical one: full height, one step right of the trigger
      insetBlock: { default: null, [IN_VERTICAL_TABS]: '0px' },
      right: { default: null, [IN_VERTICAL_TABS]: '-0.25rem' },
      width: { default: null, [IN_VERTICAL_TABS]: '0.125rem' },
    },
  },

  // `flex-1 outline-none`
  content: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    flex: 1,
    outlineStyle: 'none',
  },
})

const listVariantStyles = {
  default: styles.listDefault,
  line: styles.listLine,
} as const

const iconStyles = stylex.create({
  trigger: {
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    pointerEvents: { default: null, ':is(*) svg': 'none' },
    flexShrink: { default: null, ':is(*) svg': 0 },
  },
})
const TRIGGER_CLASSES = stylex.props(iconStyles.trigger).className

function Tabs({
  className,
  style,
  orientation = 'horizontal',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { sx?: Sx }) {
  const sx = stylex.props(styles.root, sxProp)
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={[GROUP_TABS, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TabsList({
  className,
  style,
  variant = 'default',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: 'default' | 'line' | null } & {
  sx?: Sx
}) {
  const sx = stylex.props(
    styles.list,
    variant !== null && listVariantStyles[variant ?? 'default'],
    sxProp
  )
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={[GROUP_TABS_LIST, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { sx?: Sx }) {
  const sx = stylex.props(styles.trigger, sxProp)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={[TRIGGER_CLASSES, sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function TabsContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & { sx?: Sx }) {
  const sx = stylex.props(styles.content, sxProp)
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
