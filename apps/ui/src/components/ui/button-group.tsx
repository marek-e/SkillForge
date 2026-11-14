import * as stylex from '@stylexjs/stylex'
import { Slot } from 'radix-ui'
import { colors, radius } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { Separator } from '@/components/ui/separator'
/**
 * `data-horizontal:` / `data-vertical:`, the `shadcn/tailwind.css` custom
 * variants (see `separator.tsx`).
 */
const HORIZONTAL = ':is([data-orientation="horizontal"])'
const VERTICAL = ':is([data-orientation="vertical"])'
const styles = stylex.create({
  group: {
    // `flex`
    display: 'flex',
    // `w-fit`
    width: {
      default: 'fit-content',
    },
    // `items-stretch`
    alignItems: 'stretch',
    // `has-[>[data-slot=button-group]]:gap-2` — a rule on the group itself,
    // conditioned on its children, so StyleX can own it
    gap: {
      default: null,
      ':has(>[data-slot="button-group"])': '0.5rem',
    },
  },
  groupChildren: {
    // `w-fit`
    width: {
      default: null,
      ':is(*)>[data-slot="select-trigger"]:not([class*="w-"])': 'fit-content',
    },
    zIndex: { default: null, ':is(*)>*:focus-visible': 10 },
    position: { default: null, ':is(*)>*:focus-visible': 'relative' },
    borderTopRightRadius: {
      default: null,
      ':has(select[aria-hidden="true"]:last-child)>[data-slot="select-trigger"]:last-of-type':
        radius.lg,
    },
    borderBottomRightRadius: {
      default: null,
      ':has(select[aria-hidden="true"]:last-child)>[data-slot="select-trigger"]:last-of-type':
        radius.lg,
    },
    flex: { default: null, ':is(*)>input': '1' },
  },
  horizontal: {},
  horizontalChildren: {
    borderTopRightRadius: {
      default: null,
      ':has(select[aria-hidden="true"]:last-child)>[data-slot="select-trigger"]:last-of-type':
        radius.lg,
      ':is(*)>*:not(:last-child)': '0',
      ':is(*)>[data-slot]:not(:has(~[data-slot]))': 'var(--radius) !important',
    },
    borderBottomRightRadius: {
      default: null,
      ':has(select[aria-hidden="true"]:last-child)>[data-slot="select-trigger"]:last-of-type':
        radius.lg,
      ':is(*)>*:not(:last-child)': '0',
      ':is(*)>[data-slot]:not(:has(~[data-slot]))': 'var(--radius) !important',
    },
    borderTopLeftRadius: { default: null, ':is(*)>*:not(:first-child)': '0' },
    borderBottomLeftRadius: { default: null, ':is(*)>*:not(:first-child)': '0' },
    borderLeftWidth: { default: null, ':is(*)>*:not(:first-child)': '0px' },
  },
  vertical: {
    flexDirection: 'column',
  },
  verticalChildren: {
    borderBottomLeftRadius: {
      default: null,
      ':is(*)>*:not(:last-child)': '0',
      ':is(*)>[data-slot]:not(:has(~[data-slot]))': 'var(--radius) !important',
    },
    borderBottomRightRadius: {
      default: null,
      ':has(select[aria-hidden="true"]:last-child)>[data-slot="select-trigger"]:last-of-type':
        radius.lg,
      ':is(*)>*:not(:last-child)': '0',
      ':is(*)>[data-slot]:not(:has(~[data-slot]))': 'var(--radius) !important',
    },
    borderTopLeftRadius: { default: null, ':is(*)>*:not(:first-child)': '0' },
    borderTopRightRadius: {
      default: null,
      ':is(*)>*:not(:first-child)': '0',
      ':has(select[aria-hidden="true"]:last-child)>[data-slot="select-trigger"]:last-of-type':
        radius.lg,
    },
    borderTopWidth: { default: null, ':is(*)>*:not(:first-child)': '0px' },
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
  },
  textChildren: {
    // `[&_svg]:pointer-events-none`
    pointerEvents: { default: null, ':is(*) svg': 'none' },
    width: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
    height: { default: null, ':is(*) svg:not([class*="size-"])': '1rem' },
  },
  /**
   * `bg-input relative self-stretch data-horizontal:mx-px data-horizontal:w-auto
   *  data-vertical:my-px data-vertical:h-auto`, passed to `Separator` as `sx`
   *  now that it is StyleX too (PR 07).
   *
   * `width` and `height` restate the orientation `Separator` declares and this
   * one does not override, because `stylex.props` merges a property **as a
   * whole**: declaring only `data-horizontal:w-auto` here would drop
   * `Separator`'s `data-vertical:w-px` and leave a vertical separator with no
   * width at all. `align-self` is unconditional, exactly as `self-stretch` was.
   */
  separator: {
    position: 'relative',
    alignSelf: 'stretch',
    // `bg-input` — it used to reach the element only because `twMerge` deleted
    // `Separator`'s `bg-border` from the merged string.
    backgroundColor: colors.input,
    marginInline: { default: null, [HORIZONTAL]: '1px' },
    marginBlock: { default: null, [VERTICAL]: '1px' },
    width: { default: null, [HORIZONTAL]: 'auto', [VERTICAL]: '1px' },
    height: { default: null, [HORIZONTAL]: '1px', [VERTICAL]: 'auto' },
  },
})
function ButtonGroup({
  className,
  style,
  orientation,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical' | null
  sx?: Sx
}) {
  const sx = stylex.props(
    styles.group,
    orientation === null ? null : orientation === 'vertical' ? styles.vertical : styles.horizontal,
    sxProp
  )
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={[
        sx.className,
        stylex.props(styles.groupChildren).className,
        stylex.props(
          orientation === null
            ? null
            : orientation === 'vertical'
              ? styles.verticalChildren
              : styles.horizontalChildren
        ).className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function ButtonGroupText({
  className,
  style,
  asChild = false,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
  sx?: Sx
}) {
  const Comp = asChild ? Slot.Root : 'div'
  const sx = stylex.props(styles.text, sxProp)
  return (
    <Comp
      className={[sx.className, stylex.props(styles.textChildren).className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
/**
 * The six classes PR 04 had to leave here are gone (PR 07): `Separator` is
 * StyleX now and takes an `sx` prop, so this configuration lands in the same
 * cascade layer as the styles it overrides instead of relying on `twMerge`
 * deleting them from the merged string.
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      sx={[styles.separator, sxProp]}
      className={className}
      {...props}
    />
  )
}
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
