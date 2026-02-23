import { useState, useEffect } from 'react'
import type { ElectronWindow } from '@/lib/electron'
import { ArrowLeft, ArrowRight, SquareMinus, SquarePlus, SquareX } from 'lucide-react'

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
    <div className="drag flex h-9 shrink-0 items-center justify-between bg-sidebar border-b border-sidebar-border">
      <div className="flex items-center">
        {/* macOS: leave space for traffic lights */}
        <div className={isMac ? 'w-20' : ''} />
        {/* Back/forward navigation */}
        <div className="no-drag flex items-center">
          <button
            onClick={() => window.history.back()}
            disabled={!canGoBack}
            className="inline-flex rounded-sm size-6 items-center justify-center text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            disabled={!canGoForward}
            className="inline-flex size-6 rounded-sm items-center justify-center text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Go forward"
            title="Go forward"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground select-none">SkillForge</span>
      {/* Windows/Linux: custom window controls; macOS uses native traffic lights */}
      {!isMac ? (
        <div className="no-drag flex items-center">
          <button
            onClick={() => electronAPI?.minimizeWindow()}
            className="inline-flex h-9 w-11 items-center justify-center text-foreground hover:bg-border"
            aria-label="Minimize"
            title="Minimize"
          >
            <SquareMinus className="size-4" />
          </button>
          <button
            onClick={() => electronAPI?.maximizeWindow()}
            className="inline-flex h-9 w-11 items-center justify-center text-foreground hover:bg-border"
            aria-label="Maximize"
            title="Maximize"
          >
            <SquarePlus className="size-4" />
          </button>
          <button
            onClick={() => electronAPI?.closeWindow()}
            className="inline-flex h-9 w-11 items-center justify-center text-foreground hover:bg-destructive hover:text-white"
            aria-label="Close"
            title="Close"
          >
            <SquareX className="size-4" />
          </button>
        </div>
      ) : (
        <div className="w-4" />
      )}
    </div>
  )
}
