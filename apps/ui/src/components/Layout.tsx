import { isElectron } from '@/lib/electron'
import { BreadcrumbProvider, Breadcrumbs } from '@/lib/breadcrumbs'
import { Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar/app-sidebar'
import { ElectronTitlebar } from './electron-titlebar'
import { Separator } from './ui/separator'
import { ModeToggle } from './mode-toggle'
import * as stylex from '@stylexjs/stylex'
import { motion } from '@/styles/tokens.stylex'

const styles = stylex.create({
  root: { display: 'flex', height: '100vh', flexDirection: 'column' },
  provider: { flex: 1, minHeight: 0, overflow: 'hidden' },
  header: {
    display: 'flex',
    height: {
      default: '4rem',
      ':is([data-slot="sidebar-wrapper"]:has([data-collapsible="icon"]) *)': '3rem',
    },
    flexShrink: 0,
    paddingInline: '1rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    transitionProperty: 'width, height',
    transitionTimingFunction: 'linear',
    transitionDuration: motion.duration,
  },
  headerStart: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  trigger: { marginLeft: '-0.25rem' },
  separator: {
    marginRight: '0.5rem',
    height: {
      default: null,
      ':is([data-orientation="horizontal"])': '1px',
      ':is([data-orientation="vertical"])': '1rem',
    },
    alignSelf: { default: null, ':is([data-orientation="vertical"])': 'center' },
  },
  main: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    width: '100%',
    maxWidth: {
      default: null,
      '@media (width >= 40rem)': '40rem',
      '@media (width >= 48rem)': '48rem',
      '@media (width >= 64rem)': '64rem',
      '@media (width >= 80rem)': '80rem',
      '@media (width >= 96rem)': '96rem',
    },
    marginInline: 'auto',
    overflowY: 'auto',
  },
})

export function Layout() {
  const root = stylex.props(styles.root)
  return (
    <div {...root} className={isElectron ? `electron-app ${root.className}` : root.className}>
      {isElectron && <ElectronTitlebar />}
      <SidebarProvider sx={styles.provider}>
        <AppSidebar />
        <BreadcrumbProvider>
          <SidebarInset>
            <header {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerStart)}>
                <SidebarTrigger sx={styles.trigger} />
                <Separator orientation="vertical" sx={styles.separator} />
                <Breadcrumbs />
              </div>
              <ModeToggle />
            </header>
            <main {...stylex.props(styles.main)}>
              <Outlet />
            </main>
          </SidebarInset>
        </BreadcrumbProvider>
      </SidebarProvider>
    </div>
  )
}
