import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker'

import { colors, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { Button, getButtonStyles } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'

/**
 * The two custom properties the root declares and every cell reads. They are
 * the component's own, not Tailwind's, so StyleX may reference them — but the
 * *declarations* stay classes, because their values are `var(--radius-md)` and
 * `--spacing(7)`, both Tailwind theme variables (`ROOT_CLASSES`).
 */
const CELL_RADIUS = 'var(--cell-radius)'
const CELL_SIZE = 'var(--cell-size)'

/** `md:` — Tailwind's 48rem breakpoint, in the shape Tailwind v4 emits. */
const MD = '@media (width >= 48rem)'

const styles = stylex.create({
  navButton: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    padding: 0,
    paddingInline: 0,
    paddingBlock: 0,
    opacity: { default: null, ':is([aria-disabled="true"])': '50%' },
    userSelect: 'none',
  },
  captionIcons: {
    width: { default: null, ':is(*)>svg': '0.875rem' },
    height: { default: null, ':is(*)>svg': '0.875rem' },
    color: { default: null, ':is(*)>svg': colors.mutedForeground },
  },
  dayCell: {
    borderRadius: CELL_RADIUS,
    borderTopRightRadius: {
      default: null,
      ':is(*):last-child[data-selected="true"] button': CELL_RADIUS,
      '[data-range-middle="true"]': {
        default: null,
        ':is(*):last-child[data-selected="true"] button': CELL_RADIUS,
      },
    },
    borderBottomRightRadius: {
      default: null,
      ':is(*):last-child[data-selected="true"] button': CELL_RADIUS,
      '[data-range-middle="true"]': {
        default: null,
        ':is(*):last-child[data-selected="true"] button': CELL_RADIUS,
      },
    },
  },
  dayFirst: {
    borderTopLeftRadius: {
      default: null,
      ':is(*):first-child[data-selected="true"] button': CELL_RADIUS,
      '[data-range-middle="true"]': {
        default: null,
        ':is(*):first-child[data-selected="true"] button': CELL_RADIUS,
      },
    },
    borderBottomLeftRadius: {
      default: null,
      ':is(*):first-child[data-selected="true"] button': CELL_RADIUS,
      '[data-range-middle="true"]': {
        default: null,
        ':is(*):first-child[data-selected="true"] button': CELL_RADIUS,
      },
    },
  },
  daySecond: {
    borderTopLeftRadius: {
      default: null,
      ':is(*):nth-child(2)[data-selected="true"] button': CELL_RADIUS,
      '[data-range-middle="true"]': {
        default: null,
        ':is(*):nth-child(2)[data-selected="true"] button': CELL_RADIUS,
      },
    },
    borderBottomLeftRadius: {
      default: null,
      ':is(*):nth-child(2)[data-selected="true"] button': CELL_RADIUS,
      '[data-range-middle="true"]': {
        default: null,
        ':is(*):nth-child(2)[data-selected="true"] button': CELL_RADIUS,
      },
    },
  },
  rangeStartRadius: { borderTopLeftRadius: CELL_RADIUS, borderBottomLeftRadius: CELL_RADIUS },
  rangeEndRadius: { borderTopRightRadius: CELL_RADIUS, borderBottomRightRadius: CELL_RADIUS },
  rangeMiddleRadius: { borderRadius: { default: null, ':is(.rdp-range_middle)': 0 } },
  outside: {
    color: {
      default: colors.mutedForeground,
      ':is([aria-selected="true"])': colors.mutedForeground,
    },
  },
  icon: { width: '1rem', height: '1rem' },
  weekNumberCell: {
    display: 'flex',
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  // `p-2 bg-background in-data-[slot=card-content]:bg-transparent
  //  in-data-[slot=popover-content]:bg-transparent` on the root.
  root: {
    '--cell-radius': radius.md,
    '--cell-size': '1.75rem',
    rotate: {
      default: null,
      ':is(:dir(rtl)) .rdp-button_next>svg': '180deg',
      ':is(:dir(rtl)) .rdp-button_previous>svg': '180deg',
    },
    padding: '0.5rem',
    backgroundColor: {
      default: colors.background,
      ':is([data-slot="card-content"] *)': 'transparent',
      ':is([data-slot="popover-content"] *)': 'transparent',
    },
  },
  // `w-fit`, which `classNames.root` puts on the same element.
  rootWidth: { width: 'fit-content' },

  // `flex gap-4 flex-col md:flex-row relative`
  months: {
    position: 'relative',
    display: 'flex',
    flexDirection: { default: 'column', [MD]: 'row' },
    gap: '1rem',
  },

  // `flex flex-col w-full gap-4`
  month: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '1rem',
  },

  // `flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between`
  nav: {
    position: 'absolute',
    top: 0,
    insetInline: 0,
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.25rem',
  },

  // `flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)`
  monthCaption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: CELL_SIZE,
    width: '100%',
    paddingInline: CELL_SIZE,
  },

  // `w-full flex items-center text-sm font-medium justify-center
  //  h-(--cell-size) gap-1.5`
  dropdowns: {
    display: 'flex',
    width: '100%',
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
  },

  // `relative rounded-(--cell-radius)`
  dropdownRoot: {
    position: 'relative',
    borderRadius: CELL_RADIUS,
  },

  // `absolute bg-popover inset-0 opacity-0` on the native select
  dropdown: {
    position: 'absolute',
    inset: 0,
    opacity: '0%',
    backgroundColor: colors.popover,
  },

  // `select-none font-medium`
  captionLabel: {
    userSelect: 'none',
    fontWeight: 500,
  },
  // `text-sm`, the `label` caption layout
  captionLabelPlain: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  // `rounded-(--cell-radius) flex items-center gap-1 text-sm`, the dropdown
  // caption layouts. The two `[&>svg]` rules stay classes; see
  // `CAPTION_LABEL_ICON_CLASSES`.
  captionLabelDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    borderRadius: CELL_RADIUS,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `w-full border-collapse`
  //
  // The value is also the name of a Tailwind utility, so its literal text in
  // this file makes the scanner emit a `visibility: collapse` rule no element
  // renders — the one leak that cannot be reworded away (`conventions.md`).
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  // `flex`
  weekdays: { display: 'flex' },

  // `text-muted-foreground rounded-(--cell-radius) flex-1 font-normal
  //  text-[0.8rem] select-none`
  //
  // An *arbitrary* font-size utility compiles to `font-size` plus
  // `line-height: var(--tw-leading)`, and `--tw-leading` has no initial value,
  // so that second declaration is invalid at computed-value time and the
  // element inherits its line height (`conventions.md`, "Value traps").
  // Writing only the font size reproduces exactly that.
  weekday: {
    flex: '1 1 0%',
    borderRadius: CELL_RADIUS,
    fontSize: '0.8rem',
    fontWeight: 400,
    color: colors.mutedForeground,
    userSelect: 'none',
  },

  // `flex w-full mt-2`
  week: {
    display: 'flex',
    width: '100%',
    marginTop: '0.5rem',
  },

  // `select-none w-(--cell-size)`
  weekNumberHeader: {
    width: CELL_SIZE,
    userSelect: 'none',
  },

  // `text-[0.8rem] select-none text-muted-foreground` — same inherited line
  // height as `weekday` above.
  weekNumber: {
    fontSize: '0.8rem',
    color: colors.mutedForeground,
    userSelect: 'none',
  },

  // `relative w-full h-full p-0 text-center aspect-square select-none` on the
  // day cell. Its radius and its two descendant rules stay classes; see
  // `DAY_CELL_CLASSES`.
  day: {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: 0,
    textAlign: 'center',
    aspectRatio: '1 / 1',
    userSelect: 'none',
  },

  // `bg-muted relative after:bg-muted after:absolute after:inset-y-0
  //  after:w-4 after:right-0 z-0 isolate` on the first cell of a range. The
  // pseudo-element is written out per edge rather than shared, because
  // `stylex.props` would merge the whole `::after` block away.
  rangeStart: {
    position: 'relative',
    zIndex: 0,
    isolation: 'isolate',
    backgroundColor: colors.muted,
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      right: 0,
      width: '1rem',
      backgroundColor: colors.muted,
    },
  },
  // the same with `after:left-0`
  rangeEnd: {
    position: 'relative',
    zIndex: 0,
    isolation: 'isolate',
    backgroundColor: colors.muted,
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      left: 0,
      width: '1rem',
      backgroundColor: colors.muted,
    },
  },

  // `bg-muted` on today's cell; its colour and radius stay classes, see
  // `TODAY_CLASSES`.
  today: {
    backgroundColor: colors.muted,
    color: {
      default: colors.foreground,
      ':is(.rdp-outside,.rdp-disabled)': colors.mutedForeground,
    },
    borderRadius: { default: CELL_RADIUS, '[data-selected="true"]': 0 },
  },

  // `opacity-50` on a disabled cell; its colour stays a class, see
  // `DISABLED_CLASSES`.
  disabled: { opacity: '50%', color: colors.mutedForeground },

  // `invisible`
  hidden: { visibility: 'hidden' },

  // The day *button*, passed to `Button` through its `sx` prop so the two
  // style objects merge inside one `stylex.props` call instead of meeting as
  // two class lists (`conventions.md`, "A StyleX caller overriding a StyleX
  // component"):
  //
  // `relative isolate z-10 flex aspect-square size-auto w-full
  //  min-w-(--cell-size) flex-col gap-1 border-0 font-normal`, plus the four
  // `data-[…=true]:` state groups.
  //
  // Three properties have to be restated because `stylex.props` merges a
  // property whole: `borderRadius` would otherwise drop `Button`'s own
  // `rounded-lg`, and `backgroundColor` / `color` would drop the `ghost`
  // variant's `hover:` and `aria-expanded:` rules. The state keys are *bare*
  // attribute selectors, worth 5000 against a wrapped hover's 2330, which is
  // how a hovered selected day keeps its primary background — the order
  // Tailwind gets from specificity.
  //
  // `size-auto` and `w-full` both survive `twMerge` today and the later
  // `.w-full` wins the width, so the pair is a `100%` width and an `auto`
  // height.
  dayButton: {
    lineHeight: { default: 1, ':is(*)>span': typography.xsLineHeight },
    borderColor: {
      default: 'transparent',
      ':focus-visible': colors.ring,
      ':is(.group\\/day[data-focused="true"] *)': colors.ring,
    },
    boxShadow: {
      default: null,
      ':focus-visible':
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000',
      ':is(.group\\/day[data-focused="true"] *)':
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000',
    },
    fontSize: { default: '0.875rem', ':is(*)>span': '0.75rem' },
    opacity: { default: null, ':disabled': '50%', ':is(*)>span': '70%' },
    position: 'relative',
    isolation: 'isolate',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    aspectRatio: '1 / 1',
    width: '100%',
    height: 'auto',
    minWidth: CELL_SIZE,
    borderWidth: 0,
    fontWeight: 400,
    // `rounded-(--cell-radius)` and `rounded-l-`/`rounded-r-(--cell-radius)`
    // ask for the same length on the same corners, so the shorthand alone
    // computes to the identical radius.
    borderRadius: {
      default: radius.lg,
      '[data-range-start="true"]': CELL_RADIUS,
      '[data-range-end="true"]': CELL_RADIUS,
      '[data-range-middle="true"]': 0,
    },
    backgroundColor: {
      // `ghost`, restated
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
      // the day's own states
      '[data-selected-single="true"]': colors.primary,
      '[data-range-start="true"]': colors.primary,
      '[data-range-end="true"]': colors.primary,
      '[data-range-middle="true"]': colors.muted,
    },
    color: {
      // `ghost`, restated. `dark:hover:text-foreground` stays a class and
      // outranks every key below it, which is what it does today.
      default: colors.mutedForeground,
      ':is([aria-expanded="true"])': colors.foreground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
      '[data-selected-single="true"]': {
        default: colors.primaryForeground,
        ':is(.dark *)': {
          default: null,
          '@media (hover: hover)': { default: null, ':hover': colors.foreground },
        },
      },
      '[data-range-start="true"]': {
        default: colors.primaryForeground,
        ':is(.dark *)': {
          default: null,
          '@media (hover: hover)': { default: null, ':hover': colors.foreground },
        },
      },
      '[data-range-end="true"]': {
        default: colors.primaryForeground,
        ':is(.dark *)': {
          default: null,
          '@media (hover: hover)': { default: null, ':hover': colors.foreground },
        },
      },
      '[data-range-middle="true"]': colors.foreground,
    },
  },
})

function Calendar({
  className,
  sx: sxProp,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  sx?: Sx
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={['group/calendar', stylex.props(styles.root, sxProp).className, className]
        .filter(Boolean)
        .join(' ')}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: [stylex.props(styles.rootWidth).className, defaultClassNames.root]
          .filter(Boolean)
          .join(' '),
        months: [stylex.props(styles.months).className, defaultClassNames.months]
          .filter(Boolean)
          .join(' '),
        month: [stylex.props(styles.month).className, defaultClassNames.month]
          .filter(Boolean)
          .join(' '),
        nav: [stylex.props(styles.nav).className, defaultClassNames.nav].filter(Boolean).join(' '),
        button_previous: [
          stylex.props(getButtonStyles({ variant: buttonVariant }), styles.navButton).className,
          defaultClassNames.button_previous,
        ]
          .filter(Boolean)
          .join(' '),
        button_next: [
          stylex.props(getButtonStyles({ variant: buttonVariant }), styles.navButton).className,
          defaultClassNames.button_next,
        ]
          .filter(Boolean)
          .join(' '),
        month_caption: [
          stylex.props(styles.monthCaption).className,
          defaultClassNames.month_caption,
        ]
          .filter(Boolean)
          .join(' '),
        dropdowns: [stylex.props(styles.dropdowns).className, defaultClassNames.dropdowns]
          .filter(Boolean)
          .join(' '),
        dropdown_root: [
          stylex.props(styles.dropdownRoot).className,
          defaultClassNames.dropdown_root,
        ]
          .filter(Boolean)
          .join(' '),
        dropdown: [stylex.props(styles.dropdown).className, defaultClassNames.dropdown]
          .filter(Boolean)
          .join(' '),
        caption_label: [
          captionLayout === 'label' ? undefined : stylex.props(styles.captionIcons).className,
          stylex.props(
            styles.captionLabel,
            captionLayout === 'label' ? styles.captionLabelPlain : styles.captionLabelDropdown
          ).className,
          defaultClassNames.caption_label,
        ]
          .filter(Boolean)
          .join(' '),
        table: stylex.props(styles.table).className,
        weekdays: [stylex.props(styles.weekdays).className, defaultClassNames.weekdays]
          .filter(Boolean)
          .join(' '),
        weekday: [stylex.props(styles.weekday).className, defaultClassNames.weekday]
          .filter(Boolean)
          .join(' '),
        week: [stylex.props(styles.week).className, defaultClassNames.week]
          .filter(Boolean)
          .join(' '),
        week_number_header: [
          stylex.props(styles.weekNumberHeader).className,
          defaultClassNames.week_number_header,
        ]
          .filter(Boolean)
          .join(' '),
        week_number: [stylex.props(styles.weekNumber).className, defaultClassNames.week_number]
          .filter(Boolean)
          .join(' '),
        day: [
          'group/day',
          stylex.props(styles.dayCell).className,
          stylex.props(styles.day).className,
          stylex.props(props.showWeekNumber ? styles.daySecond : styles.dayFirst).className,
          defaultClassNames.day,
        ]
          .filter(Boolean)
          .join(' '),
        range_start: [
          stylex.props(styles.rangeStartRadius).className,
          stylex.props(styles.rangeStart).className,
          defaultClassNames.range_start,
        ]
          .filter(Boolean)
          .join(' '),
        range_middle: [
          stylex.props(styles.rangeMiddleRadius).className,
          defaultClassNames.range_middle,
        ]
          .filter(Boolean)
          .join(' '),
        range_end: [
          stylex.props(styles.rangeEndRadius).className,
          stylex.props(styles.rangeEnd).className,
          defaultClassNames.range_end,
        ]
          .filter(Boolean)
          .join(' '),
        today: [stylex.props(styles.today).className, defaultClassNames.today]
          .filter(Boolean)
          .join(' '),
        outside: [stylex.props(styles.outside).className, defaultClassNames.outside]
          .filter(Boolean)
          .join(' '),
        disabled: [stylex.props(styles.disabled).className, defaultClassNames.disabled]
          .filter(Boolean)
          .join(' '),
        hidden: [stylex.props(styles.hidden).className, defaultClassNames.hidden]
          .filter(Boolean)
          .join(' '),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={[className].filter(Boolean).join(' ')}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon
                className={['size-explicit', stylex.props(styles.icon).className, className]
                  .filter(Boolean)
                  .join(' ')}
                {...props}
              />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={['size-explicit', stylex.props(styles.icon).className, className]
                  .filter(Boolean)
                  .join(' ')}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon
              className={['size-explicit', stylex.props(styles.icon).className, className]
                .filter(Boolean)
                .join(' ')}
              {...props}
            />
          )
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div {...stylex.props(styles.weekNumberCell)}>{children}</div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  sx: sxProp,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale>; sx?: Sx }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      sx={[styles.dayButton, sxProp]}
      className={[defaultClassNames.day, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
