import * as stylex from '@stylexjs/stylex'
import { colors, fonts, radius } from '@/styles/tokens.stylex'
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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { WrenchIcon, SettingsIcon, FolderOpenIcon, LibraryBigIcon } from 'lucide-react'
import { ComponentProps } from 'react'

const IN_ICON_SIDEBAR = ':is(:where([data-slot="sidebar"])[data-collapsible="icon"] *)'

const styles = stylex.create({
  homeLink: { display: 'flex', alignItems: 'center' },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    width: '2rem',
    height: '2rem',
    borderRadius: radius.md,
    backgroundColor: {
      default: null,
      [IN_ICON_SIDEBAR]: {
        default: null,
        '@media (hover: hover)': {
          default: null,
          ':hover': 'color-mix(in oklab, var(--primary) 20%, transparent)',
        },
      },
    },
  },
  logo: {
    width: '1.5rem',
    height: '1.5rem',
    filter: { default: null, ':is(.dark *)': 'invert(100%)' },
  },
  titleBox: {
    display: 'grid',
    flex: '1',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: 1.25,
  },
  title: {
    fontWeight: 600,
    fontFamily: fonts.serif,
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.sidebarForeground,
    opacity: { default: null, [IN_ICON_SIDEBAR]: 0 },
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
    transitionTimingFunction: 'linear',
  },
})

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
        <Link to="/" {...stylex.props(styles.homeLink)}>
          <div {...stylex.props(styles.logoBox)}>
            <img src="/anvil_outlined.svg" alt="SkillForge" {...stylex.props(styles.logo)} />
          </div>
          <div {...stylex.props(styles.titleBox)}>
            <span {...stylex.props(styles.title)}>SkillForge</span>
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
