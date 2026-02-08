import type { ElectronWindow } from '@/lib/electron'

const electronAPI = (window as ElectronWindow).electronAPI
const isMac = electronAPI?.platform === 'darwin'

export function ElectronTitlebar() {
  return (
    <div className="drag flex h-9 shrink-0 items-center justify-between bg-sidebar border-b border-sidebar-border">
      {/* macOS: leave space for traffic lights */}
      <div className={isMac ? 'w-20' : ''} />
      <span className="text-xs font-medium text-muted-foreground select-none">SkillForge</span>
      {/* Windows/Linux: custom window controls; macOS uses native traffic lights */}
      {!isMac ? (
        <div className="no-drag flex items-center">
          <button
            onClick={() => electronAPI?.minimizeWindow()}
            className="inline-flex h-9 w-12 items-center justify-center text-muted-foreground hover:bg-accent"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            onClick={() => electronAPI?.maximizeWindow()}
            className="inline-flex h-9 w-12 items-center justify-center text-muted-foreground hover:bg-accent"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="9" height="9" />
            </svg>
          </button>
          <button
            onClick={() => electronAPI?.closeWindow()}
            className="inline-flex h-9 w-12 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
              <line x1="0" y1="0" x2="10" y2="10" />
              <line x1="10" y1="0" x2="0" y2="10" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-4" />
      )}
    </div>
  )
}
