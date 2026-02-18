import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useMatches, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'

type BreadcrumbOverrides = Record<string, string>

interface BreadcrumbContextValue {
  overrides: BreadcrumbOverrides
  setOverride: (path: string, label: string) => void
  removeOverride: (path: string) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  overrides: {},
  setOverride: () => {},
  removeOverride: () => {},
})

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<BreadcrumbOverrides>({})

  const setOverride = useCallback((path: string, label: string) => {
    setOverrides((prev) => (prev[path] === label ? prev : { ...prev, [path]: label }))
  }, [])

  const removeOverride = useCallback((path: string) => {
    setOverrides((prev) => {
      if (!(path in prev)) return prev
      const next = { ...prev }
      delete next[path]
      return next
    })
  }, [])

  return (
    <BreadcrumbContext.Provider value={{ overrides, setOverride, removeOverride }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb(path: string, label: string | undefined) {
  const { setOverride, removeOverride } = useContext(BreadcrumbContext)

  useEffect(() => {
    if (label === undefined) return
    setOverride(path, label)
    return () => removeOverride(path)
  }, [path, label, setOverride, removeOverride])
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/tools': 'Tools',
  '/skill-library': 'Skill Library',
  '/projects': 'Projects',
  '/settings': 'Settings',
}

export function Breadcrumbs() {
  const matches = useMatches()
  const overrides = useContext(BreadcrumbContext).overrides

  const currentMatch = matches[matches.length - 1]
  const currentPath = currentMatch?.pathname || '/'

  const segments = currentPath.split('/').filter(Boolean)
  const crumbs: { label: string; path: string }[] = []

  for (let i = 0; i < segments.length; i++) {
    const path = '/' + segments.slice(0, i + 1).join('/')
    const label =
      overrides[path] ||
      routeLabels[path] ||
      segments[i].replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    crumbs.push({ label, path })
  }

  const isHome = crumbs.length === 0

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className={isHome ? undefined : 'hidden md:block'}>
          {isHome ? (
            <BreadcrumbPage className="flex items-center gap-2">
              <HomeIcon className="size-4" /> Home
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-2">
                <HomeIcon className="size-4" /> Home
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={crumb.path} className="contents">
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className={isLast ? undefined : 'hidden md:block'}>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
