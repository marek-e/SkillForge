import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
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
  // `p-2 bg-background in-data-[slot=card-content]:bg-transparent
  //  in-data-[slot=popover-content]:bg-transparent` on the root.
  root: {
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
  today: { backgroundColor: colors.muted },

  // `opacity-50` on a disabled cell; its colour stays a class, see
  // `DISABLED_CLASSES`.
  disabled: { opacity: '50%' },

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
      '[data-selected-single="true"]': colors.primaryForeground,
      '[data-range-start="true"]': colors.primaryForeground,
      '[data-range-end="true"]': colors.primaryForeground,
      '[data-range-middle="true"]': colors.foreground,
    },
  },
})

/**
 * The root classes that cannot move (PR 16).
 *
 * `[--cell-radius:var(--radius-md)]` and `[--cell-size:--spacing(7)]` resolve
 * two Tailwind *theme* variables, which StyleX may never reference
 * (`conventions.md`, "Toolchain"); `group/calendar` is a hook a caller can
 * select through, so removing it would change the DOM; and the two `rtl:`
 * rules reach into `react-day-picker`'s own `.rdp-button_*` elements. PR 32.
 */
const ROOT_CLASSES = 'group/calendar [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]'

/**
 * The previous/next month buttons, kept exactly as they were (PR 16).
 *
 * `buttonVariants` still returns Tailwind utilities, so the four classes beside
 * it have to stay utilities too: as StyleX they would sit in a `priorityN`
 * layer and lose to `buttonVariants`' own `h-8` and `px-2.5`. The whole string
 * moves in PR 32, with `buttonVariants` itself.
 */
const NAV_BUTTON_CLASSES = 'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'

/**
 * The caption label's icon rules, kept as Tailwind classes (PR 16).
 *
 * `[&>svg]:size-3.5` has to beat the `size-4` the `Chevron` component puts on
 * the icon itself, which it does today on specificity — (0,1,1) against
 * (0,1,0). Both live in `utilities`, so the pair only keeps working while this
 * one does. PR 32.
 */
const CAPTION_LABEL_ICON_CLASSES = '[&>svg]:text-muted-foreground [&>svg]:size-3.5'

/**
 * The day cell's radius and its two descendant rules, kept as Tailwind classes
 * (PR 16).
 *
 * `rounded-(--cell-radius)` is contested on the same element by
 * `range_middle`'s `rounded-none` and by `range_start`/`range_end`'s
 * `rounded-l-`/`rounded-r-`, and `react-day-picker` adds those modifier classes
 * from a *different* entry of the `classNames` map — so the two declarations
 * can never reach one `stylex.props` call, and a StyleX tie is not settled by
 * the order the keys were written in (`conventions.md`, "Utility source order
 * decides a same-specificity tie"). Tailwind settles it by emission order:
 * `.rounded-none` and the two side longhands are emitted after
 * `.rounded-(--cell-radius)`, so they win. Keeping all of them as utilities
 * keeps that outcome.
 *
 * `[&:…[data-selected=true]_button]:rounded-*` reaches into the `Button` the
 * cell contains, whose own radius is already StyleX, so it has to stay in
 * `utilities` to keep outranking it. `group/day` is the hook the day button's
 * `group-data-[focused=true]/day:` rules select through. PR 32.
 */
const DAY_CELL_CLASSES =
  'rounded-(--cell-radius) [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) group/day'

/** `text-foreground rounded-(--cell-radius) data-[selected=true]:rounded-none` — see `DAY_CELL_CLASSES` for the radius, and `OUTSIDE_CLASSES` for the colour. */
const TODAY_CLASSES = 'text-foreground rounded-(--cell-radius) data-[selected=true]:rounded-none'

/**
 * `text-muted-foreground` on an outside or a disabled cell, kept as Tailwind
 * classes (PR 16).
 *
 * A cell can be both "today" and outside, or both today and disabled, and then
 * `text-foreground` and `text-muted-foreground` contest one property from two
 * entries of the `classNames` map — the same unmergeable pair as the radius
 * above. Tailwind emits `.text-muted-foreground` after `.text-foreground`, so
 * the muted colour wins; keeping both as utilities keeps that. PR 32.
 */
const OUTSIDE_CLASSES = 'text-muted-foreground aria-selected:text-muted-foreground'
const DISABLED_CLASSES = 'text-muted-foreground'

/**
 * The day button's rules that stay Tailwind classes (PR 16).
 *
 * - `group-data-[focused=true]/day:*` reaches the button from the *cell*, and
 *   the ring and border colour it writes have to keep beating `Button`'s own
 *   `:focus-visible` declarations, which are StyleX. Restating them through
 *   `sx` would also mean restating the four `aria-invalid:` rings a day button
 *   can never show;
 * - `dark:hover:text-foreground` is (0,3,0) today and therefore outranks the
 *   `data-[…=true]:text-*` rules in dark mode. Leaving it in `utilities` keeps
 *   it above the StyleX keys that replaced them;
 * - `leading-none` publishes `--tw-leading`, which the `[&>span]:text-xs`
 *   below resolves its own line height through (`conventions.md`);
 * - `[&>span]:*` styles content `react-day-picker` puts inside the button.
 *
 * PR 32.
 */
const DAY_BUTTON_CLASSES =
  'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-foreground leading-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        ROOT_CLASSES,
        stylex.props(styles.root).className,
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn(stylex.props(styles.rootWidth).className, defaultClassNames.root),
        months: cn(stylex.props(styles.months).className, defaultClassNames.months),
        month: cn(stylex.props(styles.month).className, defaultClassNames.month),
        nav: cn(stylex.props(styles.nav).className, defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          NAV_BUTTON_CLASSES,
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          NAV_BUTTON_CLASSES,
          defaultClassNames.button_next
        ),
        month_caption: cn(
          stylex.props(styles.monthCaption).className,
          defaultClassNames.month_caption
        ),
        dropdowns: cn(stylex.props(styles.dropdowns).className, defaultClassNames.dropdowns),
        dropdown_root: cn(
          stylex.props(styles.dropdownRoot).className,
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(stylex.props(styles.dropdown).className, defaultClassNames.dropdown),
        caption_label: cn(
          captionLayout === 'label' ? undefined : CAPTION_LABEL_ICON_CLASSES,
          stylex.props(
            styles.captionLabel,
            captionLayout === 'label' ? styles.captionLabelPlain : styles.captionLabelDropdown
          ).className,
          defaultClassNames.caption_label
        ),
        table: stylex.props(styles.table).className,
        weekdays: cn(stylex.props(styles.weekdays).className, defaultClassNames.weekdays),
        weekday: cn(stylex.props(styles.weekday).className, defaultClassNames.weekday),
        week: cn(stylex.props(styles.week).className, defaultClassNames.week),
        week_number_header: cn(
          stylex.props(styles.weekNumberHeader).className,
          defaultClassNames.week_number_header
        ),
        week_number: cn(stylex.props(styles.weekNumber).className, defaultClassNames.week_number),
        day: cn(
          DAY_CELL_CLASSES,
          stylex.props(styles.day).className,
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)'
            : '[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)',
          defaultClassNames.day
        ),
        range_start: cn(
          'rounded-l-(--cell-radius)',
          stylex.props(styles.rangeStart).className,
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn(
          'rounded-r-(--cell-radius)',
          stylex.props(styles.rangeEnd).className,
          defaultClassNames.range_end
        ),
        today: cn(TODAY_CLASSES, stylex.props(styles.today).className, defaultClassNames.today),
        outside: cn(OUTSIDE_CLASSES, defaultClassNames.outside),
        disabled: cn(
          DISABLED_CLASSES,
          stylex.props(styles.disabled).className,
          defaultClassNames.disabled
        ),
        hidden: cn(stylex.props(styles.hidden).className, defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
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
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
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
      sx={styles.dayButton}
      className={cn(DAY_BUTTON_CLASSES, defaultClassNames.day, className)}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
