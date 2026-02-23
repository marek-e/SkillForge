import { Link, useLocation } from '@tanstack/react-router'
import { NavMain } from '@/components/app-sidebar/nav-main'
import { NavProjects } from '@/components/app-sidebar/nav-projects'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { WrenchIcon, SettingsIcon, FolderOpenIcon, LibraryBigIcon } from 'lucide-react'
import { ComponentProps } from 'react'

const navItems = [
  {
    title: 'Tools',
    url: '/tools',
    icon: <WrenchIcon />,
  },
  {
    title: 'Skill Library',
    url: '/skill-library',
    icon: <LibraryBigIcon />,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: <FolderOpenIcon />,
  },
]

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <Link to="/" className="flex items-center">
          <div className="flex items-center justify-center p-1 size-8 group-data-[collapsible=icon]:hover:bg-primary/20 rounded-md">
            <img src="/anvil_outlined.svg" alt="SkillForge" className="size-6 dark:invert" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-semibold font-serif text-lg truncate text-sidebar-foreground group-data-[collapsible=icon]:opacity-0 transition-opacity duration-200 ease-linear">
              SkillForge
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <SidebarSeparator />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              isActive={location.pathname === '/settings'}
            >
              <Link to="/settings">
                <SettingsIcon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}
