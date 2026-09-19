import type { ReactNode } from 'react'

/**
 * Wraps one gallery case. The label sits outside `data-gallery-case` so an
 * element screenshot only captures the component under test.
 */
export function Case({
  name,
  children,
  width,
}: {
  name: string
  children: ReactNode
  /** Fixed pixel width for cases whose natural width depends on the viewport. */
  width?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] text-muted-foreground">{name}</span>
      <div
        data-gallery-case={name}
        style={width ? { width: `${width}px` } : undefined}
        className="w-fit"
      >
        {children}
      </div>
    </div>
  )
}

export function CaseRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-6">{children}</div>
}

export function CaseGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  )
}
