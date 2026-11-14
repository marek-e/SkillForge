import { colors, fonts, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { FolderOpenIcon, MoreHorizontalIcon, PlusIcon, WrenchIcon } from 'lucide-react'
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * The `Sidebar` shell itself is `fixed`, so its expanded/collapsed/mobile states
 * are baselined on the real routes rather than here. This section covers the
 * flow-positioned menu primitives, including the ones no route mounts.
 */
export function SidebarPartsSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="menu">
        <Case name="sidebar-menu" width={220}>
          <div {...stylex.props(galleryStyles.case1)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <WrenchIcon />
                  <span>Tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <FolderOpenIcon />
                  <span>Projects</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>3</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm">
                  <span>Small</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <span>Large</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline">
                  <span>Outline</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <span>Disabled</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>With action</span>
                </SidebarMenuButton>
                <SidebarMenuAction>
                  <MoreHorizontalIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>

        <Case name="sidebar-menu-sub" width={220}>
          <div {...stylex.props(galleryStyles.case2)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Parent</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>Child one</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton isActive>Child two</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton size="sm">Child small</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>

        <Case name="quirk-sidebar-menu-skeleton" width={220}>
          <div {...stylex.props(galleryStyles.case3)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="structure">
        <Case name="sidebar-structure" width={220}>
          <div {...stylex.props(galleryStyles.case4)}>
            <SidebarHeader>
              <span {...stylex.props(galleryStyles.case5)}>SkillForge</span>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupAction>
                  <PlusIcon />
                </SidebarGroupAction>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <WrenchIcon />
                        <span>Tools</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarInput placeholder="Filter" />
            </SidebarFooter>
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="trigger">
        <CaseRow>
          <Case name="sidebar-trigger">
            <SidebarTrigger />
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case1: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case2: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case3: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case4: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    color: colors.sidebarForeground,
  },
  case5: {
    fontFamily: fonts.serif,
    fontSize: '1.125rem',
    lineHeight: typography.lgLineHeight,
    fontWeight: 600,
  },
})
