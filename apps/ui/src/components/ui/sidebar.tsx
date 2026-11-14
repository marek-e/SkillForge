import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { colors, motion, radius, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { Slot } from 'radix-ui'

import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PanelLeftIcon } from 'lucide-react'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '11rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const ICON = ':is([data-slot="sidebar"][data-collapsible="icon"] *)'
const OFFCANVAS = ':is([data-slot="sidebar"][data-collapsible="offcanvas"] *)'
const FLOATING = ':is([data-slot="sidebar"][data-variant="floating"] *)'
const ELECTRON = ':is(.electron-app *)'
const ACTIVE =
  ':is(:where([data-state="active"]), :where([data-active]:not([data-active="false"])))'
const FOCUS_RING = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 2px var(--sidebar-ring), 0 0 #0000'
const SMALL_SHADOW =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'

const styles = stylex.create({
  provider: {
    backgroundColor: { default: null, ':has([data-variant="inset"])': colors.sidebar },
    display: 'flex',
    minHeight: { default: '100svh', [ELECTRON]: 'calc(100svh - 2.25rem)' },
    width: '100%',
  },
  nonCollapsible: {
    backgroundColor: colors.sidebar,
    color: colors.sidebarForeground,
    display: 'flex',
    height: '100%',
    width: 'var(--sidebar-width)',
    flexDirection: 'column',
  },
  mobileContent: {
    backgroundColor: colors.sidebar,
    color: colors.sidebarForeground,
    width: '75%',
    padding: '0rem',
    ':is(*)>button': { display: 'none' },

    display: { default: 'flex', ':is(*)>button': 'none' },
  },
  mobileInner: { display: 'flex', height: '100%', width: '100%', flexDirection: 'column' },
  screenReader: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: null,
    whiteSpace: 'nowrap',
    borderWidth: 0,
    clipPath: 'inset(50%)',
  },
  desktop: {
    color: colors.sidebarForeground,
    display: { default: 'none', '@media (width >= 48rem)': 'block' },
  },
  gap: {
    transitionProperty: 'width',
    transitionDuration: '200ms',
    transitionTimingFunction: 'linear',
    position: 'relative',
    width: {
      default: 'var(--sidebar-width)',
      [OFFCANVAS]: '0rem',
      [ICON]: 'var(--sidebar-width-icon)',
    },
    backgroundColor: 'transparent',
    rotate: { default: null, ':is([data-slot="sidebar"][data-side="right"] *)': '180deg' },
  },
  floatingGap: {
    width: {
      default: 'var(--sidebar-width)',
      [OFFCANVAS]: '0rem',
      [ICON]: 'calc(var(--sidebar-width-icon) + 1rem)',
    },
  },
  container: {
    position: 'fixed',
    top: { default: '0rem', [ELECTRON]: '2.25rem' },
    bottom: '0rem',
    zIndex: 10,
    display: { default: 'none', '@media (width >= 48rem)': 'flex' },
    height: { default: '100svh', [ELECTRON]: 'calc(100svh - 2.25rem)' },
    width: { default: 'var(--sidebar-width)', [ICON]: 'var(--sidebar-width-icon)' },
    transitionProperty: 'left, right, width',
    transitionDuration: '200ms',
    transitionTimingFunction: 'linear',
    left: {
      default: null,
      ':is([data-side="left"])': {
        default: '0rem',
        [OFFCANVAS]: 'calc(var(--sidebar-width) * -1)',
      },
    },
    right: {
      default: null,
      ':is([data-side="right"])': {
        default: '0rem',
        [OFFCANVAS]: 'calc(var(--sidebar-width) * -1)',
      },
    },
  },
  containerBorder: {
    borderRightWidth: { default: null, ':is([data-slot="sidebar"][data-side="left"] *)': '1px' },
    borderLeftWidth: { default: null, ':is([data-slot="sidebar"][data-side="right"] *)': '1px' },
    borderStyle: 'solid',
  },
  floatingContainer: {
    padding: '0.5rem',
    width: {
      default: 'var(--sidebar-width)',
      [ICON]: 'calc(var(--sidebar-width-icon) + 1rem + 2px)',
    },
  },
  inner: {
    backgroundColor: colors.sidebar,
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    borderRadius: { default: null, [FLOATING]: radius.xl },
    boxShadow: {
      default: null,
      [FLOATING]:
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px var(--sidebar-border), 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
  },
  rail: {
    position: 'absolute',
    top: { default: '0rem', [ELECTRON]: '1.125rem' },
    bottom: '0rem',
    height: { default: null, [ELECTRON]: 'calc(100% - 2.25rem)' },
    zIndex: 20,
    display: { default: 'none', '@media (width >= 40rem)': 'flex' },
    width: '1rem',
    transitionProperty: 'all',
    transitionTimingFunction: 'linear',
    transitionDuration: motion.duration,
    right: {
      default: null,
      ':is([data-slot="sidebar"][data-side="left"] *)': {
        default: '-1rem',
        [OFFCANVAS]: '-0.5rem',
      },
    },
    left: {
      default: null,
      ':is([data-slot="sidebar"][data-side="right"] *)': {
        default: '0rem',
        [OFFCANVAS]: '-0.5rem',
      },
    },
    translate: {
      default: null,
      ':dir(ltr)': '-50% 0',
      ':dir(rtl)': '-50% 0',
      [OFFCANVAS]: '0rem 0',
    },
    cursor: {
      default: null,
      ':is([data-side="left"] *)': 'w-resize',
      ':is([data-side="right"] *)': 'e-resize',
      ':is([data-side="left"][data-state="collapsed"] *)': 'e-resize',
      ':is([data-side="right"][data-state="collapsed"] *)': 'w-resize',
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': {
        default: null,
        ':hover': { default: null, [OFFCANVAS]: colors.sidebar },
      },
    },
    '::after': {
      content: '""',
      position: 'absolute',
      top: '0rem',
      bottom: '0rem',
      insetInlineStart: '50%',
      width: '2px',
      left: { default: null, [OFFCANVAS]: '100%' },
      backgroundColor: {
        default: null,
        '@media (hover: hover)': { default: null, ':hover': colors.sidebarBorder },
      },
    },
  },
  inset: {
    backgroundColor: colors.background,
    position: 'relative',
    display: 'flex',
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    margin: {
      default: null,
      '@media (width >= 48rem)': {
        default: null,
        ':is([data-slot="sidebar"][data-variant="inset"]~*)': '0.5rem',
      },
    },
    marginLeft: {
      default: null,
      '@media (width >= 48rem)': {
        default: null,
        ':is([data-slot="sidebar"][data-variant="inset"]~*)': {
          default: '0rem',
          ':is([data-slot="sidebar"][data-state="collapsed"]~*)': '0.5rem',
        },
      },
    },
    borderRadius: {
      default: null,
      '@media (width >= 48rem)': {
        default: null,
        ':is([data-slot="sidebar"][data-variant="inset"]~*)': radius.xl,
      },
    },
    boxShadow: {
      default: null,
      '@media (width >= 48rem)': {
        default: null,
        ':is([data-slot="sidebar"][data-variant="inset"]~*)': SMALL_SHADOW,
      },
    },
  },
  header: { gap: '0.5rem', padding: '0.5rem', display: 'flex', flexDirection: 'column' },
  footer: { gap: '0.5rem', padding: '0.5rem', display: 'flex', flexDirection: 'column' },
  separator: {
    backgroundColor: colors.sidebarBorder,
    paddingInline: '0.5rem',
    width: {
      default: 'auto',
      ':is([data-orientation="horizontal"])': '100%',
      ':is([data-orientation="vertical"])': '1px',
    },
  },
  content: {
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
    gap: '0rem',
    display: 'flex',
    minHeight: '0rem',
    flex: 1,
    flexDirection: 'column',
    overflow: { default: 'auto', [ICON]: 'hidden' },
  },
  group: {
    padding: '0.5rem',
    position: 'relative',
    display: 'flex',
    width: '100%',
    minWidth: '0rem',
    flexDirection: 'column',
  },
  label: {
    color: 'color-mix(in oklab, var(--sidebar-foreground) 70%, transparent)',
    height: { default: '2rem', ':is(*)>svg': '1rem' },
    borderRadius: radius.md,
    paddingInline: '0.5rem',
    fontWeight: 500,
    transitionProperty: 'margin, opacity',
    transitionDuration: '200ms',
    transitionTimingFunction: 'linear',
    marginTop: { default: null, [ICON]: '-2rem' },
    opacity: { default: null, [ICON]: 0 },
    display: 'flex',
    flexShrink: { default: 0, ':is(*)>svg': 0 },
    alignItems: 'center',
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    boxShadow: { default: null, ':focus-visible': FOCUS_RING },
    fontSize: '0.75rem',
    lineHeight: typography.xsLineHeight,
    width: { default: null, ':is(*)>svg': '1rem' },
  },
  groupAction: {
    color: {
      default: colors.sidebarForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccentForeground },
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccent },
    },
    position: 'absolute',
    top: '0.875rem',
    right: '0.75rem',
    width: { default: '1.25rem', ':is(*)>svg': '1rem' },
    borderRadius: radius.md,
    padding: '0rem',
    display: { default: 'flex', [ICON]: 'none' },
    aspectRatio: '1 / 1',
    alignItems: 'center',
    justifyContent: 'center',
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    boxShadow: { default: null, ':focus-visible': FOCUS_RING },
    transitionProperty: 'transform, translate, scale, rotate',
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    height: { default: null, ':is(*)>svg': '1rem' },
    flexShrink: { default: null, ':is(*)>svg': 0 },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: '-0.5rem',
      display: { default: null, '@media (width >= 48rem)': 'none' },
    },
  },
  groupContent: { width: '100%', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  menu: { gap: '0rem', display: 'flex', width: '100%', minWidth: '0rem', flexDirection: 'column' },
  menuItem: { position: 'relative' },
  menuButton: {
    position: 'relative',
    gap: '0.5rem',
    borderRadius: radius.md,
    padding: { default: '0.5rem', [ICON]: '0.5rem !important' },
    textAlign: 'left',
    transitionProperty: 'width, height, padding',
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
    paddingRight: {
      default: null,
      ':is([data-slot="sidebar-menu-item"]:has([data-sidebar="menu-action"]) *)': '2rem',
    },
    fontWeight: { default: null, [ACTIVE]: 500 },
    display: 'flex',
    width: { default: '100%', [ICON]: '2rem !important', ':is(*) svg': '1rem' },
    height: { default: null, [ICON]: '2rem !important', ':is(*) svg': '1rem' },
    alignItems: 'center',
    overflow: { default: 'hidden', ':is(*)>span:last-child': 'hidden' },
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    pointerEvents: { default: null, ':disabled': 'none', ':is([aria-disabled="true"])': 'none' },
    opacity: { default: null, ':disabled': '50%', ':is([aria-disabled="true"])': '50%' },
    boxShadow: { default: null, ':focus-visible': FOCUS_RING },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccent },
      ':active': colors.sidebarAccent,
      [ACTIVE]: colors.sidebarAccent,
    },
    color: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccentForeground },
      ':active': colors.sidebarAccentForeground,
      [ACTIVE]: colors.sidebarAccentForeground,
    },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    flexShrink: { default: null, ':is(*) svg': 0 },
    textOverflow: { default: null, ':is(*)>span:last-child': 'ellipsis' },
    whiteSpace: { default: null, ':is(*)>span:last-child': 'nowrap' },
    '::before': {
      content: '""',
      position: 'absolute',
      left: '0.1875rem',
      top: '0.5rem',
      height: '1rem',
      width: '0.125rem',
      borderRadius: 'calc(infinity * 1px)',
      opacity: { default: 0, [ACTIVE]: 1 },
      transitionProperty: 'opacity',
      transitionDuration: motion.duration,
      transitionTimingFunction: motion.ease,
      backgroundColor: {
        default: null,
        [ACTIVE]: 'color-mix(in oklab, var(--sidebar-primary) 80%, transparent)',
      },
    },
  },
  menuButtonOutline: {
    backgroundColor: {
      default: colors.background,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccent },
      ':active': colors.sidebarAccent,
      [ACTIVE]: colors.sidebarAccent,
    },
    boxShadow: {
      default: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px hsl(var(--sidebar-border))',
      ':focus-visible':
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 2px var(--sidebar-ring), 0 0 0 1px hsl(var(--sidebar-border))',
      '@media (hover: hover)': {
        default: null,
        ':hover':
          '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px hsl(var(--sidebar-accent))',
      },
    },
  },
  menuButtonDefault: {
    height: { default: '2rem', [ICON]: '2rem !important', ':is(*) svg': '1rem' },
  },
  menuButtonSmall: {
    height: { default: '1.75rem', [ICON]: '2rem !important', ':is(*) svg': '1rem' },
    fontSize: '0.75rem',
    lineHeight: typography.xsLineHeight,
  },
  menuButtonLarge: {
    height: { default: '3rem', [ICON]: '2rem !important', ':is(*) svg': '1rem' },
    padding: { default: '0.5rem', [ICON]: '0rem !important' },
  },
  menuAction: {
    color: {
      default: colors.sidebarForeground,
      '@media (hover: hover)': {
        default: null,
        ':hover': colors.sidebarAccentForeground,
        ':is([data-slot="sidebar-menu-button"]:hover~*)': colors.sidebarAccentForeground,
      },
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccent },
    },
    position: 'absolute',
    top: {
      default: '0.375rem',
      ':is([data-slot="sidebar-menu-button"][data-size="default"]~*)': '0.375rem',
      ':is([data-slot="sidebar-menu-button"][data-size="lg"]~*)': '0.625rem',
      ':is([data-slot="sidebar-menu-button"][data-size="sm"]~*)': '0.25rem',
    },
    right: '0.25rem',
    aspectRatio: '1 / 1',
    width: { default: '1.25rem', ':is(*)>svg': '1rem' },
    borderRadius: radius.md,
    padding: '0rem',
    display: { default: 'flex', [ICON]: 'none' },
    alignItems: 'center',
    justifyContent: 'center',
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    boxShadow: { default: null, ':focus-visible': FOCUS_RING },
    transitionProperty: 'transform, translate, scale, rotate',
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    height: { default: null, ':is(*)>svg': '1rem' },
    flexShrink: { default: null, ':is(*)>svg': 0 },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: '-0.5rem',
      display: { default: null, '@media (width >= 48rem)': 'none' },
    },
  },
  menuActionHover: {
    color: {
      default: colors.sidebarForeground,
      '@media (hover: hover)': {
        default: null,
        ':hover': colors.sidebarAccentForeground,
        ':is([data-slot="sidebar-menu-button"]:hover~*)': colors.sidebarAccentForeground,
      },
      ':is([data-slot="sidebar-menu-button"]:is(:where([data-state="active"]), :where([data-active]:not([data-active="false"])))~*)':
        colors.sidebarAccentForeground,
    },
    opacity: {
      default: null,
      '@media (width >= 48rem)': {
        default: 0,
        ':is([data-slot="sidebar-menu-item"]:focus-within *)': 1,
        ':is([aria-expanded="true"])': 1,
        '@media (hover: hover)': {
          default: null,
          ':is([data-slot="sidebar-menu-item"]:hover *)': 1,
        },
      },
    },
  },
  menuBadge: {
    color: {
      default: colors.sidebarForeground,
      '@media (hover: hover)': {
        default: null,
        ':is([data-slot="sidebar-menu-button"]:hover~*)': colors.sidebarAccentForeground,
      },
      ':is([data-slot="sidebar-menu-button"]:is(:where([data-state="active"]), :where([data-active]:not([data-active="false"])))~*)':
        colors.sidebarAccentForeground,
    },
    pointerEvents: 'none',
    position: 'absolute',
    right: '0.25rem',
    height: '1.25rem',
    minWidth: '1.25rem',
    borderRadius: radius.md,
    paddingInline: '0.25rem',
    fontWeight: 500,
    top: {
      default: null,
      ':is([data-slot="sidebar-menu-button"][data-size="default"]~*)': '0.375rem',
      ':is([data-slot="sidebar-menu-button"][data-size="lg"]~*)': '0.625rem',
      ':is([data-slot="sidebar-menu-button"][data-size="sm"]~*)': '0.25rem',
    },
    display: { default: 'flex', [ICON]: 'none' },
    alignItems: 'center',
    justifyContent: 'center',
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none',
    fontSize: '0.75rem',
    lineHeight: typography.xsLineHeight,
  },
  skeleton: {
    height: '2rem',
    gap: '0.5rem',
    borderRadius: radius.md,
    paddingInline: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  sub: {
    borderColor: colors.sidebarBorder,
    marginInline: '0.875rem',
    translate: '1px 0',
    gap: '0.25rem',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    paddingInline: '0.625rem',
    paddingBlock: '0.125rem',
    display: { default: 'flex', [ICON]: 'none' },
    minWidth: '0rem',
    flexDirection: 'column',
  },
  subItem: { position: 'relative' },
  subButton: {
    color: {
      default: colors.sidebarForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccentForeground },
      ':active': colors.sidebarAccentForeground,
      [ACTIVE]: colors.sidebarAccentForeground,
      ':is(*)>svg': colors.sidebarAccentForeground,
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccent },
      ':active': colors.sidebarAccent,
      [ACTIVE]: colors.sidebarAccent,
    },
    height: { default: '1.75rem', ':is(*)>svg': '1rem' },
    gap: '0.5rem',
    borderRadius: radius.md,
    paddingInline: '0.5rem',
    boxShadow: { default: null, ':focus-visible': FOCUS_RING },
    display: { default: 'flex', [ICON]: 'none' },
    minWidth: '0rem',
    translate: '-1px 0',
    alignItems: 'center',
    overflow: { default: 'hidden', ':is(*)>span:last-child': 'hidden' },
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    pointerEvents: { default: null, ':disabled': 'none', ':is([aria-disabled="true"])': 'none' },
    opacity: { default: null, ':disabled': '50%', ':is([aria-disabled="true"])': '50%' },
    outlineWidth: { default: null, '@media (forced-colors: active)': '2px' },
    outlineColor: { default: null, '@media (forced-colors: active)': 'transparent' },
    outlineOffset: { default: null, '@media (forced-colors: active)': '2px' },
    fontSize: {
      default: null,
      ':is([data-size="md"])': '0.875rem',
      ':is([data-size="sm"])': '0.75rem',
    },
    lineHeight: {
      default: null,
      ':is([data-size="md"])': typography.smLineHeight,
      ':is([data-size="sm"])': typography.xsLineHeight,
    },
    width: { default: null, ':is(*)>svg': '1rem' },
    flexShrink: { default: null, ':is(*)>svg': 0 },
    textOverflow: { default: null, ':is(*)>span:last-child': 'ellipsis' },
    whiteSpace: { default: null, ':is(*)>span:last-child': 'nowrap' },
  },
  mobileHeader: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '1rem',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  input: {
    backgroundColor: {
      default: colors.background,
      ':is(.dark *)': 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
    height: '2rem',
    width: '100%',
    boxShadow: {
      default: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000',
      ':focus-visible':
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000',
    },
  },
  skeletonIcon: { width: '1rem', height: '1rem', borderRadius: radius.md },
  skeletonText: { height: '1rem', maxWidth: 'var(--skeleton-width)', flex: 1 },
})

type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  sx: sxProp,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  sx?: Sx
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // The state drives the collapsed sidebar styles.
  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  const sx = stylex.props(styles.provider, sxProp)

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...sx.style,
            ...style,
          } as React.CSSProperties
        }
        className={[sx.className, 'group/sidebar-wrapper', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  dir,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  sx?: Sx
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    const sx = stylex.props(styles.nonCollapsible, sxProp)
    return (
      <div
        data-slot="sidebar"
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          sx={styles.mobileContent}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader sx={styles.mobileHeader}>
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div {...stylex.props(styles.mobileInner)}>{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  const sx = stylex.props(
    styles.container,
    variant === 'floating' || variant === 'inset'
      ? styles.floatingContainer
      : styles.containerBorder,
    sxProp
  )

  return (
    <div
      className={[stylex.props(styles.desktop).className, 'group peer'].filter(Boolean).join(' ')}
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        {...stylex.props(
          styles.gap,
          (variant === 'floating' || variant === 'inset') && styles.floatingGap
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={[sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        <div data-sidebar="sidebar" data-slot="sidebar-inner" {...stylex.props(styles.inner)}>
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span {...stylex.props(styles.screenReader)}>Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'button'> & { sx?: Sx }) {
  const { toggleSidebar } = useSidebar()

  const sx = stylex.props(styles.rail, sxProp)

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarInset({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'main'> & { sx?: Sx }) {
  const sx = stylex.props(styles.inset, sxProp)

  return (
    <main
      data-slot="sidebar-inset"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarInput({ className, sx: sxProp, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={className}
      sx={[styles.input, sxProp]}
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.header, sxProp)

  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.footer, sxProp)

  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof Separator> & { sx?: Sx }) {
  const sx = stylex.props(styles.separator, sxProp)

  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={className}
      sx={[styles.separator, sxProp]}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.content, sxProp)

  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.group, sxProp)

  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  style,
  sx: sxProp,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean } & { sx?: Sx }) {
  const Comp = asChild ? Slot.Root : 'div'

  const sx = stylex.props(styles.label, sxProp)

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  style,
  sx: sxProp,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean } & { sx?: Sx }) {
  const Comp = asChild ? Slot.Root : 'button'

  const sx = stylex.props(styles.groupAction, sxProp)

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.groupContent, sxProp)

  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenu({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'ul'> & { sx?: Sx }) {
  const sx = stylex.props(styles.menu, sxProp)

  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenuItem({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'li'> & { sx?: Sx }) {
  const sx = stylex.props(styles.menuItem, sxProp)

  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={[sx.className, 'group/menu-item', className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
  variant?: 'default' | 'outline' | null
  size?: 'default' | 'sm' | 'lg' | null
  sx?: Sx
}) {
  const Comp = asChild ? Slot.Root : 'button'
  const { isMobile, state } = useSidebar()

  const sx = stylex.props(
    styles.menuButton,
    variant === 'outline' && styles.menuButtonOutline,
    size === 'sm'
      ? styles.menuButtonSmall
      : size === 'lg'
        ? styles.menuButtonLarge
        : size === 'default'
          ? styles.menuButtonDefault
          : null,
    sxProp
  )

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={[sx.className, 'peer/menu-button group/menu-button', className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  style,
  sx: sxProp,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  showOnHover?: boolean
} & { sx?: Sx }) {
  const Comp = asChild ? Slot.Root : 'button'

  const sx = stylex.props(styles.menuAction, showOnHover && styles.menuActionHover, sxProp)

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & { sx?: Sx }) {
  const sx = stylex.props(styles.menuBadge, sxProp)

  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  style,
  sx: sxProp,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean
} & { sx?: Sx }) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  const sx = stylex.props(styles.skeleton, sxProp)

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {showIcon && <Skeleton sx={styles.skeletonIcon} data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        sx={styles.skeletonText}
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'ul'> & { sx?: Sx }) {
  const sx = stylex.props(styles.sub, sxProp)

  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'li'> & { sx?: Sx }) {
  const sx = stylex.props(styles.subItem, sxProp)

  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={[sx.className, 'group/menu-sub-item', className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
  size?: 'sm' | 'md'
  isActive?: boolean
} & { sx?: Sx }) {
  const Comp = asChild ? Slot.Root : 'a'

  const sx = stylex.props(styles.subButton, sxProp)

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
