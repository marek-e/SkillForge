import * as stylex from '@stylexjs/stylex'
import type { ToolStatus } from '@skillforge/core'
import { useNavigate } from '@tanstack/react-router'
import { DownloadIcon, EllipsisIcon } from 'lucide-react'
import { Card } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { colors, motion, radius } from '@/styles/tokens.stylex'
import { getToolConfig } from '@/lib/tool-config'

/**
 * `transition-colors`, written out (`tailwind-values.md` §8).
 *
 * The `--tw-gradient-*` entries belong to the utility's property list and are
 * kept so the computed `transition-property` string is unchanged; naming a
 * custom property that no longer exists is inert, so they survive Tailwind's
 * removal in PR 32. Same string as `display-view-switch.tsx` (PR 04).
 */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/**
 * The detected dot's `shadow-[0_0_6px_2px_rgba(16,185,129,0.4)]`, composed.
 *
 * Tailwind re-declares the whole five-slot `box-shadow` chain for every shadow
 * utility and fills the unused slots with `0 0 #0000` (`tailwind-values.md`
 * §6), so writing them out keeps the computed string identical. The colour is
 * the arbitrary value as authored.
 */
const DOT_GLOW = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 6px 2px rgba(16, 185, 129, 0.4)'

/**
 * `animate-pulse` — `@keyframes pulse { 50% { opacity: .5 } }`
 * (`tailwind-values.md` §8). StyleX hashes the name, so `animation-name` is the
 * one computed value that changes; the body is identical to `skeleton.tsx`'s,
 * so the two dedupe onto one generated rule.
 */
const pulse = stylex.keyframes({
  '50%': { opacity: 0.5 },
})

const styles = stylex.create({
  // `flex items-start justify-between px-4 pt-1`
  head: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // `px-4` is `padding-inline`, a logical property — keep Tailwind's own
    // choice so a physical `pl-*`/`pr-*` keeps resolving over it.
    paddingInline: '1rem',
    paddingTop: '0.25rem',
  },
  // `flex size-10 items-center justify-center rounded-lg`; the accent colour is
  // the class `lib/tool-config.ts` supplies, see below.
  logo: {
    display: 'flex',
    width: '2.5rem',
    height: '2.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  // `size-6`
  logoImage: {
    width: '1.5rem',
    height: '1.5rem',
  },
  // `dark:invert`. Tailwind's `invert` sets `--tw-invert: invert(100%)` inside
  // a `filter` chain whose other slots are empty, so the computed filter is
  // that one function (`tailwind-values.md` §8).
  logoImageInverted: {
    filter: { default: null, ':is(.dark *)': 'invert(100%)' },
  },
  // `flex items-center gap-2 pt-1`
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '0.25rem',
  },
  // `flex size-6 items-center justify-center rounded-md text-muted-foreground
  //  hover:bg-muted hover:text-foreground transition-colors`
  menuButton: {
    display: 'flex',
    width: '1.5rem',
    height: '1.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.muted },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
  },
  // `size-4`
  menuIcon: {
    width: '1rem',
    height: '1rem',
  },
  // `inline-block size-2.5 rounded-full`
  dot: {
    display: 'inline-block',
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: 'calc(infinity * 1px)',
  },
  // `bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)] animate-pulse`
  dotDetected: {
    backgroundColor: 'oklch(69.6% 0.17 162.48)',
    boxShadow: DOT_GLOW,
    animationName: pulse,
    animationDuration: '2s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationIterationCount: 'infinite',
  },
  // `bg-muted-foreground/40`. The `var()` stays inside the `color-mix()`: a
  // literal colour is folded at build time into a different computed string.
  dotUndetected: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
  },
  // `px-4 pb-1`
  body: {
    paddingInline: '1rem',
    paddingBottom: '0.25rem',
  },
  // `text-base font-semibold text-foreground`. `text-base`'s paired line height
  // is `calc(1.5 / 1)`, the one ratio that folds exactly, so it stays a ratio
  // and keeps inheriting as one.
  name: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 600,
    color: colors.foreground,
  },
  // `mt-1 text-xs text-muted-foreground`; the paired line height written as the
  // length it resolves to, and `mt-1` physical, the way Tailwind writes it.
  counts: {
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: colors.mutedForeground,
  },
})

interface ToolCardCompactProps {
  tool: ToolStatus
}

export function ToolCardCompact({ tool }: ToolCardCompactProps) {
  const config = getToolConfig(tool.name)
  const navigate = useNavigate()
  const detected = tool.detected

  function handleClick() {
    if (detected) {
      navigate({ to: '/tools/$name', params: { name: tool.name } })
    }
  }

  // `config.accent` (e.g. `bg-orange-500/15`) is a class name chosen in
  // `lib/tool-config.ts`, which this row does not touch, so it stays a utility
  // on the logo box alongside the StyleX class.
  const logoSx = stylex.props(styles.logo, config.accent)

  return (
    <Card
      size="sm"
      {...(detected && {
        role: 'link',
        tabIndex: 0,
        onClick: handleClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        },
      })}
      sx={[
        overrideStyles.CARD_CLASSES,
        detected ? overrideStyles.CARD_DETECTED_CLASSES : overrideStyles.CARD_UNDETECTED_CLASSES,
      ]}
    >
      <div {...stylex.props(styles.head)}>
        <div className={logoSx.className}>
          <img
            src={config.logo}
            alt={config.displayName}
            {...stylex.props(styles.logoImage, config.invert && styles.logoImageInverted)}
          />
        </div>
        <div {...stylex.props(styles.actions)}>
          {!detected && config.url && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" {...stylex.props(styles.menuButton)}>
                  <EllipsisIcon {...stylex.props(styles.menuIcon)} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => window.open(config.url, '_blank', 'noopener,noreferrer')}
                >
                  <DownloadIcon />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span
            {...stylex.props(styles.dot, detected ? styles.dotDetected : styles.dotUndetected)}
          />
        </div>
      </div>

      <div {...stylex.props(styles.body)}>
        <p {...stylex.props(styles.name)}>{config.displayName}</p>
        <p {...stylex.props(styles.counts)}>
          {detected ? (
            <>
              {tool.skillCount} skill{tool.skillCount !== 1 && 's'}
              {tool.commandCount > 0 && (
                <>
                  {' \u00B7 '}
                  {tool.commandCount} command{tool.commandCount !== 1 && 's'}
                </>
              )}
            </>
          ) : (
            'Not detected'
          )}
        </p>
      </div>
    </Card>
  )
}

const overrideStyles = stylex.create({
  CARD_CLASSES: {
    position: 'relative',
    width: '100%',
    userSelect: 'none',
    transitionProperty: 'all',
    transitionDuration: '200ms',
    transitionTimingFunction: motion.ease,
  },
  CARD_DETECTED_CLASSES: {
    cursor: 'pointer',
    translate: {
      default: null,
      '@media (hover: hover)': {
        default: null,
        ':hover': 'var(--card-zero-translation, 0px) -0.125rem',
      },
    },
    boxShadow: {
      default:
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 0 #0000',
      '@media (hover: hover)': {
        default: null,
        ':hover':
          '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 20%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  CARD_UNDETECTED_CLASSES: { opacity: '60%' },
})
