import { useState, useEffect } from 'react'
import type { ElectronWindow } from '@/lib/electron'
import { ArrowLeft, ArrowRight, SquareMinus, SquarePlus, SquareX } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'
import { colors, radius } from '@/styles/tokens.stylex'

const styles = stylex.create({
  titlebar: {
    WebkitAppRegion: 'drag',
    display: 'flex',
    height: '2.25rem',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sidebar,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderColor: colors.sidebarBorder,
  },
  row: { display: 'flex', alignItems: 'center' },
  controls: { WebkitAppRegion: 'no-drag', display: 'flex', alignItems: 'center' },
  trafficLights: { width: '5rem' },
  navigation: {
    display: 'inline-flex',
    borderRadius: radius.sm,
    width: '1.5rem',
    height: '1.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.border },
    },
    opacity: { default: null, ':disabled': '30%' },
    cursor: { default: null, ':disabled': 'not-allowed' },
  },
  icon: { width: '1rem', height: '1rem' },
  title: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 500,
    color: colors.mutedForeground,
    userSelect: 'none',
  },
  windowControl: {
    display: 'inline-flex',
    height: '2.25rem',
    width: '2.75rem',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.foreground,
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.border },
    },
  },
  close: {
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.destructive },
    },
    color: {
      default: colors.foreground,
      '@media (hover: hover)': { default: null, ':hover': '#fff' },
    },
  },
  spacer: { width: '1rem' },
})

const electronAPI = (window as ElectronWindow).electronAPI
const isMac = electronAPI?.platform === 'darwin'

interface WindowNavigation {
  readonly canGoBack: boolean
  readonly canGoForward: boolean
  addEventListener(type: string, listener: EventListener): void
  removeEventListener(type: string, listener: EventListener): void
}

function isEditableElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

function getNavigation(): WindowNavigation | undefined {
  return (window as Window & { navigation?: WindowNavigation }).navigation
}

export function ElectronTitlebar() {
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const titlebar = stylex.props(styles.titlebar)
  const controls = stylex.props(styles.controls)

  useEffect(() => {
    const nav = getNavigation()
    if (!nav) return

    const updateNavState = () => {
      setCanGoBack(nav.canGoBack)
      setCanGoForward(nav.canGoForward)
    }

    updateNavState()
    nav.addEventListener('navigatesuccess', updateNavState)
    return () => nav.removeEventListener('navigatesuccess', updateNavState)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey || isEditableElement(document.activeElement)) return
      if (e.key === 'ArrowLeft' && canGoBack) {
        e.preventDefault()
        window.history.back()
      } else if (e.key === 'ArrowRight' && canGoForward) {
        e.preventDefault()
        window.history.forward()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canGoBack, canGoForward])

  return (
    <div {...titlebar} className={`drag ${titlebar.className}`}>
      <div {...stylex.props(styles.row)}>
        {/* macOS: leave space for traffic lights */}
        <div {...stylex.props(isMac && styles.trafficLights)} />
        {/* Back/forward navigation */}
        <div {...controls} className={`no-drag ${controls.className}`}>
          <button
            onClick={() => window.history.back()}
            disabled={!canGoBack}
            {...stylex.props(styles.navigation)}
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft {...stylex.props(styles.icon)} />
          </button>
          <button
            onClick={() => window.history.forward()}
            disabled={!canGoForward}
            {...stylex.props(styles.navigation)}
            aria-label="Go forward"
            title="Go forward"
          >
            <ArrowRight {...stylex.props(styles.icon)} />
          </button>
        </div>
      </div>
      <span {...stylex.props(styles.title)}>SkillForge</span>
      {/* Windows/Linux: custom window controls; macOS uses native traffic lights */}
      {!isMac ? (
        <div {...controls} className={`no-drag ${controls.className}`}>
          <button
            onClick={() => electronAPI?.minimizeWindow()}
            {...stylex.props(styles.windowControl)}
            aria-label="Minimize"
            title="Minimize"
          >
            <SquareMinus {...stylex.props(styles.icon)} />
          </button>
          <button
            onClick={() => electronAPI?.maximizeWindow()}
            {...stylex.props(styles.windowControl)}
            aria-label="Maximize"
            title="Maximize"
          >
            <SquarePlus {...stylex.props(styles.icon)} />
          </button>
          <button
            onClick={() => electronAPI?.closeWindow()}
            {...stylex.props(styles.windowControl, styles.close)}
            aria-label="Close"
            title="Close"
          >
            <SquareX {...stylex.props(styles.icon)} />
          </button>
        </div>
      ) : (
        <div {...stylex.props(styles.spacer)} />
      )}
    </div>
  )
}
