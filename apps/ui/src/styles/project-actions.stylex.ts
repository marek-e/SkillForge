import * as stylex from '@stylexjs/stylex'
import { colors, palette } from './tokens.stylex'

const spin = stylex.keyframes({ to: { transform: 'rotate(360deg)' } })

export const projectActions = stylex.create({
  icon: { width: '1rem', height: '1rem' },
  sortIcon: { width: '0.875rem', height: '0.875rem' },
  spinning: {
    animationName: spin,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  favorite: {
    color: {
      default: palette.yellow400,
      '@media (hover: hover)': { default: null, ':hover': palette.yellow400 },
    },
  },
  unfavorite: {
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': palette.yellow400 },
    },
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      '@media (hover: hover)': {
        default: null,
        ':hover': `color-mix(in oklab, ${palette.yellow400} 10%, transparent)`,
      },
      ':is(.dark *)': {
        default: null,
        '@media (hover: hover)': {
          default: null,
          ':hover': `color-mix(in oklab, ${palette.yellow400} 20%, transparent)`,
        },
      },
    },
  },
  star: {
    fill: {
      default: palette.yellow400,
      '@media (hover: hover)': {
        default: null,
        ':is(.group\\/button:hover *)': `color-mix(in oklab, ${palette.yellow400} 50%, transparent)`,
      },
    },
  },
  rename: {
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': palette.blue500 },
    },
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      '@media (hover: hover)': {
        default: null,
        ':hover': `color-mix(in oklab, ${palette.blue500} 10%, transparent)`,
      },
      ':is(.dark *)': {
        default: null,
        '@media (hover: hover)': {
          default: null,
          ':hover': `color-mix(in oklab, ${palette.blue500} 25%, transparent)`,
        },
      },
    },
  },
  refresh: {
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': palette.green500 },
    },
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      '@media (hover: hover)': {
        default: null,
        ':hover': `color-mix(in oklab, ${palette.green500} 10%, transparent)`,
      },
      ':is(.dark *)': {
        default: null,
        '@media (hover: hover)': {
          default: null,
          ':hover': `color-mix(in oklab, ${palette.green500} 20%, transparent)`,
        },
      },
    },
  },
})
