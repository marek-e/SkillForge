import { Link } from '@tanstack/react-router'
import { NavMain } from '@/components/nav-main'
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { BotIcon, BookOpenIcon } from 'lucide-react'
import { ComponentProps } from 'react'

const navItems = [
  {
    title: 'Agents',
    url: '/agents',
    icon: <BotIcon />,
  },
  {
    title: 'Skills',
    url: '/skills',
    icon: <BookOpenIcon />,
  },
]

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenIcon className="h-4 w-4" />
            </div>
            <span className="font-semibold font-serif text-lg group-data-[collapsible=icon]:hidden">
              SkillForge
            </span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
