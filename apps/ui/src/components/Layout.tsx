import { isElectron } from '@/lib/electron'
import { BreadcrumbProvider, Breadcrumbs } from '@/lib/breadcrumbs'
import { Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar/app-sidebar'
import { ElectronTitlebar } from './electron-titlebar'
import { Separator } from './ui/separator'
import { ModeToggle } from './mode-toggle'

export function Layout() {
  return (
    <div className={`flex h-screen flex-col ${isElectron ? 'electron-app' : ''}`}>
      {isElectron && <ElectronTitlebar />}
      <SidebarProvider className="flex-1 min-h-0!">
        <AppSidebar />
        <BreadcrumbProvider>
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
        </BreadcrumbProvider>
      </SidebarProvider>
    </div>
  )
}
