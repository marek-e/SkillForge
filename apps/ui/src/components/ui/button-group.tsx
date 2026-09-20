import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

/**
 * Kept for the exported type only (PR 04). `ButtonGroup` no longer renders from
 * it; see `GROUP_CHILD_RULES` below for the classes that are still applied and
 * the StyleX styles for everything else. PR 32 removes it.
 */
const buttonGroupVariants = cva(
  "has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg flex w-fit items-stretch *:focus-visible:z-10 *:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

/**
 * The rules that shape the group's **children**, kept as Tailwind classes for
 * now (PR 04).
 *
 * Every one of them styles an element this component does not own: a `Button`,
 * an `Input`, a `SelectTrigger`, a `ButtonGroupText`. A StyleX rule written
 * here lands in a `priorityN` layer, and layer order beats specificity, so it
 * would **lose** to any utility class sitting on the child itself —
 * `Input`'s own `rounded-lg` and `border`, for instance, would keep their
 * corners and their left border inside a horizontal group. Today they win,
 * because both rules sit in `@layer utilities` and the group's selector is the
 * more specific one.
 *
 * They therefore stay Tailwind until the last child type is StyleX:
 * `separator` (PR 07), `input` (PR 05) and `select` (PR 15). The group's own
 * box — `display`, `width`, `align-items`, `flex-direction` and the nested-group
 * `gap` — is StyleX below, because those declarations land on this element.
 *
 * The `!` on the two last-child radius rules is load-bearing: it is what lets
 * the last `[data-slot]` child keep a rounded outer edge when it is *not* the
 * last child (see the `button-group-text-last` gallery case).
 */
const GROUP_CHILD_RULES =
  "has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg *:focus-visible:z-10 *:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1"

const ORIENTATION_CHILD_RULES = {
  horizontal:
    '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
  vertical:
    '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
} as const

/**
 * `ButtonGroupText`'s icon rules, kept as Tailwind classes for the same reason
 * as `GROUP_CHILD_RULES`: they style an icon the component does not own.
 */
const TEXT_ICON_RULES = "[&_svg:not([class*='size-'])]:size-4"

const styles = stylex.create({
  group: {
    // `flex`
    display: 'flex',
    // `w-fit`
    width: 'fit-content',
    // `items-stretch`
    alignItems: 'stretch',
    // `has-[>[data-slot=button-group]]:gap-2` — a rule on the group itself,
    // conditioned on its children, so StyleX can own it
    gap: {
      default: null,
      ':has(>[data-slot="button-group"])': '0.5rem',
    },
  },
  // the `horizontal` orientation adds no own-box declaration (`flex-row` is the
  // default), so it has no style object
  vertical: {
    // `flex-col`
    flexDirection: 'column',
  },

  text: {
    // `flex`
    display: 'flex',
    // `items-center`
    alignItems: 'center',
    // `gap-2`
    gap: '0.5rem',
    // `rounded-lg`
    borderRadius: radius.lg,
    // `border`
    borderWidth: '1px',
    borderStyle: 'solid',
    // `bg-muted`
    backgroundColor: colors.muted,
    // `px-2.5`
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
    // `text-sm`, the paired line-height as the length it resolves to
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    // `font-medium`
    fontWeight: 500,
    // `[&_svg]:pointer-events-none`
    pointerEvents: { default: null, ':is(*) svg': 'none' },
  },
})

function ButtonGroup({
  className,
  style,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  const sx = stylex.props(styles.group, orientation === 'vertical' && styles.vertical)

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        GROUP_CHILD_RULES,
        ORIENTATION_CHILD_RULES[orientation ?? 'horizontal'],
        sx.className,
        className
      )}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  style,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'div'
  const sx = stylex.props(styles.text)

  return (
    <Comp
      className={cn(TEXT_ICON_RULES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/**
 * Unchanged (PR 04). Every class here configures `Separator`, which is still a
 * Tailwind component: `bg-input` only reaches the element because `twMerge`
 * deletes `Separator`'s own `bg-border` from the merged string, and a StyleX
 * class would instead lose to it in the cascade. It migrates together with
 * `separator` in PR 07.
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'bg-input relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
