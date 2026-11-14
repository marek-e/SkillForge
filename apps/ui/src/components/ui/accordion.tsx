import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { colors, motion, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

/**
 * The group marker the two chevrons select through, kept as a literal class
 * name (PR 09). It carries no styling of its own; `IN_EXPANDED_TRIGGER` below
 * is the only selector that uses it, and it could become
 * `[data-slot="accordion-trigger"]` in PR 32.
 */
const GROUP_ACCORDION_TRIGGER = 'group/accordion-trigger'

/** `group-aria-expanded/accordion-trigger:` */
const IN_EXPANDED_TRIGGER = ':is(.group\\/accordion-trigger[aria-expanded="true"] *)'

/**
 * The three-pixel focus ring, written as the whole five-layer chain Tailwind
 * composes (`tailwind-values.md` §5, §6).
 */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'

/**
 * The two accordion height animations.
 *
 * Both `tw-animate-css` and `shadcn/tailwind.css` define keyframes with these
 * names, and shadcn's are imported later, so **shadcn's win** in the shipped
 * CSS (`tailwind-values.md` §10). The height expression below is what the built
 * asset actually contains, fallback chain included; the duration (`0.2s`), the
 * timing function, the delay, the iteration count, the direction and the fill
 * mode are the rest of the `animation` shorthand the utility expands to.
 *
 * `stylex.keyframes` hashes the name, so `animation-name` is the one computed
 * value this pair cannot keep — the computed-style dumps leave it out and
 * `animations.spec.ts` pins the curve at 0 ms, 100 ms and 200 ms instead
 * (`conventions.md`).
 */
const ACCORDION_HEIGHT =
  'var(--radix-accordion-content-height, var(--accordion-panel-height, auto))'

const accordionDown = stylex.keyframes({
  '0%': { height: 0 },
  '100%': { height: ACCORDION_HEIGHT },
})

const accordionUp = stylex.keyframes({
  '0%': { height: ACCORDION_HEIGHT },
  '100%': { height: 0 },
})

const styles = stylex.create({
  // `flex w-full flex-col`
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
  },

  // `not-last:border-b` -> `&:not(:last-child)`
  item: {
    borderBottomWidth: { default: null, ':not(:last-child)': '1px' },
    borderBottomStyle: { default: null, ':not(:last-child)': 'solid' },
  },

  // `flex` — the header takes no `className`, so this is its whole styling
  header: {
    display: 'flex',
  },

  trigger: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    // `rounded-lg`
    borderRadius: radius.lg,
    // `py-2.5` — logical, as Tailwind writes it
    paddingBlock: '0.625rem',
    // `text-left`
    textAlign: 'left',
    // `font-medium`
    fontWeight: 500,
    // `hover:underline`
    textDecorationLine: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': 'underline' },
    },
    // `relative`
    position: 'relative',
    // `flex flex-1 items-start justify-between`
    display: 'flex',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // `border border-transparent` with `focus-visible:border-ring`
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: { default: 'transparent', ':focus-visible': colors.ring },
    // `focus-visible:ring-3 focus-visible:ring-ring/50`
    boxShadow: { default: null, ':focus-visible': RING_FOCUS },
    // `transition-all`, with Tailwind's `--default-transition-*`
    transitionProperty: 'all',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
    // `outline-none`
    outlineStyle: 'none',
    // `disabled:pointer-events-none`
    pointerEvents: { default: null, ':disabled': 'none' },
    // `disabled:opacity-50`
    opacity: { default: null, ':disabled': '50%' },

    // The trigger's one pseudo-element rule gives `::after` a border colour
    // while the trigger is focus-visible. Tailwind's `after:` variant also
    // writes `content: var(--tw-content)`, and it writes it **inside** that
    // focus rule, so the pseudo-element is generated only while the trigger is
    // focused — at which point it joins the flex row as a zero-width item. The
    // colour itself never paints, because nothing gives the pseudo-element a
    // border width. Both halves are reproduced as found.
    '::after': {
      content: { default: null, ':focus-visible': '""' },
      borderColor: { default: null, ':focus-visible': colors.ring },
    },
  },

  // The two chevrons. Tailwind styled them from the trigger with a descendant
  // selector reaching an element **this file renders**, so the declarations
  // move onto the icons themselves: same computed result in every state, and no
  // rule that a caller's utility could outrank from a lower cascade layer
  // (`conventions.md`).
  icon: {
    color: colors.mutedForeground,
    marginLeft: 'auto',
    width: '1rem',
    height: '1rem',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  // hidden once the trigger is expanded
  iconCollapse: {
    display: { default: null, [IN_EXPANDED_TRIGGER]: 'none' },
  },
  // hidden until the trigger is expanded
  iconExpand: {
    display: { default: 'none', [IN_EXPANDED_TRIGGER]: 'inline' },
  },

  // `data-open:animate-accordion-down data-closed:animate-accordion-up
  //  overflow-hidden`
  content: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    animationName: {
      default: null,
      ':is([data-state="open"])': accordionDown,
      ':is([data-state="closed"])': accordionUp,
    },
    // The rest of the `animation` shorthand, under the same two conditions as
    // the name. A shorthand also resets what it does not name, and both sides
    // agree only because every value below is the initial one.
    animationDuration: {
      default: null,
      ':is([data-state="open"])': '0.2s',
      ':is([data-state="closed"])': '0.2s',
    },
    animationTimingFunction: {
      default: null,
      ':is([data-state="open"])': 'ease-out',
      ':is([data-state="closed"])': 'ease-out',
    },
    animationDelay: {
      default: null,
      ':is([data-state="open"])': '0s',
      ':is([data-state="closed"])': '0s',
    },
    animationIterationCount: {
      default: null,
      ':is([data-state="open"])': '1',
      ':is([data-state="closed"])': '1',
    },
    animationDirection: {
      default: null,
      ':is([data-state="open"])': 'normal',
      ':is([data-state="closed"])': 'normal',
    },
    animationFillMode: {
      default: null,
      ':is([data-state="open"])': 'none',
      ':is([data-state="closed"])': 'none',
    },
    overflow: 'hidden',
  },

  // `pt-0 pb-2.5 h-(--radix-accordion-content-height)`
  contentInner: {
    textDecorationLine: { default: null, ':is(*) a': 'underline' },
    textUnderlineOffset: { default: null, ':is(*) a': '3px' },
    color: {
      default: null,
      '@media (hover: hover)': { default: null, ':is(*) a:hover': colors.foreground },
    },
    marginBottom: { default: null, ':is(*) p:not(:last-child)': '1rem' },
    paddingTop: '0rem',
    paddingBottom: '0.625rem',
    height: 'var(--radix-accordion-content-height)',
  },
})

function Accordion({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & { sx?: Sx }) {
  const sx = stylex.props(styles.root, sxProp)
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & { sx?: Sx }) {
  const sx = stylex.props(styles.item, sxProp)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  style,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { sx?: Sx }) {
  const headerSx = stylex.props(styles.header)
  const sx = stylex.props(styles.trigger, sxProp)
  return (
    <AccordionPrimitive.Header className={headerSx.className}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={[GROUP_ACCORDION_TRIGGER, sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          {...stylex.props(styles.icon, styles.iconCollapse)}
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          {...stylex.props(styles.icon, styles.iconExpand)}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & { sx?: Sx }) {
  const sx = stylex.props(styles.content)
  const innerSx = stylex.props(styles.contentInner, sxProp)
  // `style` is deliberately **not** destructured: it reached the Radix
  // `Content` element through the spread before this migration, and the inner
  // `<div>` only ever took `className`.
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={[sx.className].filter(Boolean).join(' ')}
      {...props}
    >
      <div className={[innerSx.className, className].filter(Boolean).join(' ')}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
