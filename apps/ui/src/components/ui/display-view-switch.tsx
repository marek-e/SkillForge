import * as stylex from '@stylexjs/stylex'
import { LayoutGridIcon, LayoutListIcon } from 'lucide-react'
import { colors, motion, radius } from '@/styles/tokens.stylex'
import type { SkillViewMode } from '@/lib/skill-view'

/**
 * The two `transition-*` utilities this component uses, written out (PR 04).
 *
 * `transition-colors` and `transition-transform` expand to a fixed property
 * list (`tailwind-values.md` §8). The `--tw-gradient-*` entries are part of
 * `transition-colors`' list and are kept so the computed `transition-property`
 * string is unchanged; naming a custom property that no longer exists is inert,
 * so they survive Tailwind's removal in PR 32.
 */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'
const TRANSITION_TRANSFORM = 'transform, translate, scale, rotate'

/**
 * `shadow-sm`, composed. Tailwind re-declares the whole five-slot `box-shadow`
 * chain for every shadow utility and fills the unused slots with `0 0 #0000`;
 * `--tw-shadow` itself is two layers here (`tailwind-values.md` §6).
 */
const SHADOW_SM =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'

const styles = stylex.create({
  // `relative inline-flex items-center bg-muted rounded-lg p-[3px]`
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    paddingTop: '3px',
    paddingRight: '3px',
    paddingBottom: '3px',
    paddingLeft: '3px',
  },
  // `absolute top-[3px] bottom-[3px] left-[3px] w-7 rounded-md bg-background
  //  shadow-sm transition-transform duration-200 ease-in-out`
  pill: {
    position: 'absolute',
    top: '3px',
    bottom: '3px',
    left: '3px',
    width: '1.75rem',
    borderRadius: radius.md,
    backgroundColor: colors.background,
    boxShadow: SHADOW_SM,
    transitionProperty: TRANSITION_TRANSFORM,
    transitionDuration: '200ms',
    // `ease-in-out` resolves to Tailwind's `--ease-in-out`, the same
    // `cubic-bezier(0.4, 0, 0.2, 1)` as the default transition easing
    transitionTimingFunction: motion.ease,
  },
  // `translate-x-full`; Tailwind writes both axes through
  // `--tw-translate-x`/`--tw-translate-y`, the second defaulting to `0px`
  pillEnd: {
    translate: '100% 0px',
  },
  // `relative z-10 inline-flex size-7 items-center justify-center rounded-md
  //  transition-colors duration-200`
  button: {
    position: 'relative',
    zIndex: 10,
    display: 'inline-flex',
    width: '1.75rem',
    height: '1.75rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    transitionProperty: TRANSITION_COLORS,
    transitionDuration: '200ms',
    transitionTimingFunction: motion.ease,
  },
  // `text-foreground`
  buttonActive: {
    color: colors.foreground,
  },
  // `text-muted-foreground hover:text-foreground`
  buttonInactive: {
    color: {
      default: colors.mutedForeground,
      ':hover': colors.foreground,
    },
  },
  // `size-3.5`
  icon: {
    width: '0.875rem',
    height: '0.875rem',
  },
})

interface DisplayViewSwitchProps {
  value: SkillViewMode
  onChange: (mode: SkillViewMode) => void
}

export function DisplayViewSwitch({ value, onChange }: DisplayViewSwitchProps) {
  return (
    <div role="group" {...stylex.props(styles.root)}>
      {/* sliding pill */}
      <div aria-hidden {...stylex.props(styles.pill, value === 'grid' && styles.pillEnd)} />
      <button
        type="button"
        aria-pressed={value === 'list'}
        aria-label="List view"
        onClick={() => onChange('list')}
        {...stylex.props(
          styles.button,
          value === 'list' ? styles.buttonActive : styles.buttonInactive
        )}
        title="List"
      >
        <LayoutListIcon {...stylex.props(styles.icon)} />
      </button>
      <button
        type="button"
        aria-pressed={value === 'grid'}
        aria-label="Grid view"
        onClick={() => onChange('grid')}
        {...stylex.props(
          styles.button,
          value === 'grid' ? styles.buttonActive : styles.buttonInactive
        )}
        title="Grid"
      >
        <LayoutGridIcon {...stylex.props(styles.icon)} />
      </button>
    </div>
  )
}
