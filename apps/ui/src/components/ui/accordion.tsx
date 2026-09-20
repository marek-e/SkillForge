import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { colors, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
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
    paddingTop: '0rem',
    paddingBottom: '0.625rem',
    height: 'var(--radix-accordion-content-height)',
  },
})

/**
 * The rules that style content the **caller** puts inside the body, kept as
 * Tailwind classes (PR 09).
 *
 * A StyleX rule lives in a `priorityN` layer, below `utilities`, so any utility
 * on the caller's own link or paragraph would outrank it — the opposite of
 * today, where these win on specificity. They go in PR 32.
 */
const CONTENT_BODY_CLASSES =
  '[&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4'

/**
 * `text-sm` on the trigger and on the body, also kept as Tailwind (PR 09).
 *
 * This is the paired-line-height trap: Tailwind passes the *ratio*
 * `calc(1.25 / 0.875)` down to a descendant that has a font size of its own and
 * no line height, while a StyleX `1.25rem` passes a *length*. Both elements are
 * sized by content the caller supplies, and the `accordion-inherited-leading`
 * case measures the difference — a trigger holding a ten-pixel span is 38px one
 * way and 42px the other. PR 32.
 */
const TEXT_SM_CLASS = 'text-sm'

function Accordion({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  const sx = stylex.props(styles.root)
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const sx = stylex.props(styles.item)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const headerSx = stylex.props(styles.header)
  const sx = stylex.props(styles.trigger)
  return (
    <AccordionPrimitive.Header className={headerSx.className}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(GROUP_ACCORDION_TRIGGER, TEXT_SM_CLASS, sx.className, className)}
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
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const sx = stylex.props(styles.content)
  const innerSx = stylex.props(styles.contentInner)
  // `style` is deliberately **not** destructured: it reached the Radix
  // `Content` element through the spread before this migration, and the inner
  // `<div>` only ever took `className`.
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(TEXT_SM_CLASS, sx.className)}
      {...props}
    >
      <div className={cn(CONTENT_BODY_CLASSES, innerSx.className, className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
