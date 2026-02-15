import type { ElectronWindow } from '@/lib/electron'
import { Outlet, useMatches, Link } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { ElectronTitlebar } from './electron-titlebar'
import { Separator } from './ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from './ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { ModeToggle } from './mode-toggle'

const isElectron =
  typeof window !== 'undefined' && !!(window as ElectronWindow).electronAPI?.isElectron

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/tools': 'Tools',
  '/skill-library': 'Skill Library',
  '/projects': 'Projects',
  '/settings': 'Settings',
}

function Breadcrumbs() {
  const matches = useMatches()

  const currentMatch = matches[matches.length - 1]
  const currentPath = currentMatch?.pathname || '/'

  if (currentPath === '/') {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <HomeIcon className="size-4" /> Home
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Build breadcrumb segments from the path
  const segments = currentPath.split('/').filter(Boolean)
  const crumbs: { label: string; path: string }[] = []

  for (let i = 0; i < segments.length; i++) {
    const path = '/' + segments.slice(0, i + 1).join('/')
    const label =
      routeLabels[path] ||
      segments[i].replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    crumbs.push({ label, path })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-2">
              <HomeIcon className="size-4" /> Home
            </Link>
          </BreadcrumbLink>
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

export function Layout() {
  return (
    <div className={`flex h-screen flex-col ${isElectron ? 'electron-app' : ''}`}>
      {isElectron && <ElectronTitlebar />}
      <SidebarProvider className="flex-1 min-h-0!">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 px-4 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 data-vertical:self-center "
              />
              <Breadcrumbs />
            </div>
            <ModeToggle />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 container mx-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
