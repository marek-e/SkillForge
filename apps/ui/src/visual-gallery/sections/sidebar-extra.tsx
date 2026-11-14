import { colors, fonts, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import {
  FolderOpenIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SettingsIcon,
  WrenchIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * The sidebar shell itself (PR 17).
 *
 * `sidebar-parts` covers the flow-positioned menu primitives; this section adds
 * the shell, whose container is `position: fixed`. Each case is wrapped in a
 * frame that carries a `transform`, which makes it the containing block for
 * those fixed descendants, so several shells can be baselined on one page
 * without overlapping. The frame clips the `100svh` container to its own box.
 *
 * At 390px every shell renders its mobile branch instead (a `Sheet`), so the
 * case shows only its `SidebarInset`; `overlays.spec.ts` opens one.
 */
const FRAME_WIDTH = 380
const FRAME_HEIGHT = 260

function Frame({ children, offset = 0 }: { children: ReactNode; offset?: number }) {
  return (
    <div
      {...stylex.props(galleryStyles.case0)}
      style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
    >
      {/*
       * The containing block for the fixed container is this element's padding
       * box, so an `offset` is what brings an off-canvas rail — which sits two
       * spacing steps outside a container parked at `-(--sidebar-width)` — back
       * inside the clip.
       */}
      <div
        style={{
          marginLeft: offset,
          width: FRAME_WIDTH - offset,
          height: FRAME_HEIGHT,
          transform: 'translateZ(0)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

type ShellProps = {
  open?: boolean
  collapsible?: 'offcanvas' | 'icon' | 'none'
  variant?: 'sidebar' | 'floating' | 'inset'
  side?: 'left' | 'right'
  rail?: boolean
  offset?: number
  children?: ReactNode
}

function Shell({
  open = true,
  collapsible = 'icon',
  variant = 'sidebar',
  side = 'left',
  rail = false,
  offset = 0,
  children,
}: ShellProps) {
  return (
    <Frame offset={offset}>
      <SidebarProvider defaultOpen={open}>
        <Sidebar collapsible={collapsible} variant={variant} side={side}>
          <SidebarHeader>
            <span {...stylex.props(galleryStyles.case1)}>SkillForge</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupAction>
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Tools">
                      <WrenchIcon />
                      <span>Tools</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Projects">
                      <FolderOpenIcon />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            {children}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" tooltip="Settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          {rail ? <SidebarRail /> : null}
        </Sidebar>
        <SidebarInset>
          <div {...stylex.props(galleryStyles.case2)}>
            <SidebarTrigger />
            <span {...stylex.props(galleryStyles.case3)}>Inset</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Frame>
  )
}

export function SidebarExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case4)}>
      <CaseGroup title="shell states">
        <CaseRow>
          <Case name="sidebarx-expanded-icon">
            <Shell />
          </Case>
          <Case name="sidebarx-collapsed-icon">
            <Shell open={false} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="sidebarx-expanded-offcanvas">
            <Shell collapsible="offcanvas" />
          </Case>
          <Case name="sidebarx-collapsed-offcanvas">
            <Shell collapsible="offcanvas" open={false} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="sidebarx-collapsible-none">
            <Shell collapsible="none" />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="variants and sides">
        <CaseRow>
          <Case name="sidebarx-variant-inset">
            <Shell variant="inset" />
          </Case>
          <Case name="sidebarx-variant-inset-collapsed">
            <Shell variant="inset" open={false} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="sidebarx-variant-floating">
            <Shell variant="floating" />
          </Case>
          <Case name="sidebarx-variant-floating-collapsed">
            <Shell variant="floating" open={false} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="sidebarx-side-right">
            <Shell side="right" />
          </Case>
          <Case name="sidebarx-side-right-collapsed">
            <Shell side="right" collapsible="offcanvas" open={false} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="rail">
        <CaseRow>
          <Case name="sidebarx-rail">
            <Shell rail />
          </Case>
          <Case name="sidebarx-rail-offcanvas">
            <Shell rail collapsible="offcanvas" open={false} offset={56} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="sidebarx-rail-right">
            <Shell rail side="right" />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="menu matrix">
        <Case name="sidebarx-menu-matrix" width={240}>
          <div {...stylex.props(galleryStyles.case5)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="default">
                  <WrenchIcon />
                  <span>Default default</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm">
                  <WrenchIcon />
                  <span>Default sm</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <WrenchIcon />
                  <span>Default lg</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline" size="default">
                  <span>Outline default</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline" size="sm">
                  <span>Outline sm</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline" size="lg">
                  <span>Outline lg</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive variant="outline">
                  <span>Outline active</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled="true">
                  <span>Aria disabled</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>

        <Case name="sidebarx-menu-badges" width={240}>
          <div {...stylex.props(galleryStyles.case6)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="default">
                  <span>Badge default</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>12</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm">
                  <span>Badge sm</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>7</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <span>Badge lg</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>3</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>

        <Case name="sidebarx-menu-actions" width={240}>
          <div {...stylex.props(galleryStyles.case7)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="default">
                  <span>Action default</span>
                </SidebarMenuButton>
                <SidebarMenuAction>
                  <MoreHorizontalIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm">
                  <span>Action on hover</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontalIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <span>Action lg</span>
                </SidebarMenuButton>
                <SidebarMenuAction aria-expanded="true" showOnHover>
                  <MoreHorizontalIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>

        <Case name="sidebarx-menu-sub" width={240}>
          <div {...stylex.props(galleryStyles.case8)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Parent</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>
                      <WrenchIcon />
                      <span>Sub md</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton size="sm" isActive>
                      <span>Sub sm active</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton aria-disabled="true">
                      <span>Sub disabled</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>

        <Case name="sidebarx-menu-skeleton" width={240}>
          <div {...stylex.props(galleryStyles.case9)}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="structure parts">
        <Case name="sidebarx-structure" width={240}>
          <div {...stylex.props(galleryStyles.case10)}>
            <SidebarHeader>
              <SidebarInput placeholder="Filter" />
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Group</SidebarGroupLabel>
                <SidebarGroupAction>
                  <PlusIcon />
                </SidebarGroupAction>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <span>Item</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarSeparator orientation="vertical" />
            </SidebarFooter>
          </div>
        </Case>

        {/*
         * A ten-pixel span inherits its line height from whichever ancestor
         * declares one, so this is what shows whether a paired `text-*` on a
         * container may be written as a length (`conventions.md`, "Paired
         * line-heights: never write the ratio").
         */}
        <Case name="sidebarx-text-probe" width={240}>
          <div {...stylex.props(galleryStyles.case11)}>
            <SidebarGroupContent>
              <span {...stylex.props(galleryStyles.case12)}>probe in group content</span>
              <SidebarGroupLabel>
                <span {...stylex.props(galleryStyles.case13)}>probe in label</span>
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span {...stylex.props(galleryStyles.case14)}>probe in button</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <span {...stylex.props(galleryStyles.case15)}>9</span>
                  </SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm">
                    <span {...stylex.props(galleryStyles.case16)}>probe in sm button</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span {...stylex.props(galleryStyles.case17)}>probe in sub</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </Case>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  case1: {
    fontFamily: fonts.serif,
    fontSize: '1.125rem',
    lineHeight: typography.lgLineHeight,
    fontWeight: 600,
  },
  case2: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' },
  case3: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case4: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case5: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case6: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case7: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case8: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case9: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case10: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    color: colors.sidebarForeground,
  },
  case11: {
    borderRadius: radius.lg,
    backgroundColor: colors.sidebar,
    padding: '0.5rem',
    color: colors.sidebarForeground,
  },
  case12: { fontSize: '10px', lineHeight: 'inherit' },
  case13: { fontSize: '10px', lineHeight: 'inherit' },
  case14: { fontSize: '10px', lineHeight: 'inherit' },
  case15: { fontSize: '10px', lineHeight: 'inherit' },
  case16: { fontSize: '10px', lineHeight: 'inherit' },
  case17: { fontSize: '10px', lineHeight: 'inherit' },
})
