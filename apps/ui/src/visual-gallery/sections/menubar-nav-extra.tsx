import * as stylex from '@stylexjs/stylex'
import { FileTextIcon, FolderIcon, SettingsIcon, WrenchIcon } from 'lucide-react'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Menubar and navigation-menu states the `overlays` section does not mount
 * (PR 14).
 *
 * A sibling section rather than extra cases in `overlays`, because
 * `gallery.spec.ts` also takes one **full-page** screenshot per section: adding
 * a case to an existing section changes that section's page height and would
 * require refreshing a frozen original, which the migration never does.
 *
 * The closed cases live here; the open ones are driven from
 * `visual/overlays.spec.ts` and `visual/animations.spec.ts`, which click the
 * triggers below and capture the portalled content full-page. What the pair
 * covers, all captured while both components were still Tailwind:
 *
 * - a menubar with four menus, one of them a disabled trigger, and a first
 *   menu holding every item shape: label, shortcut, `inset`, `disabled`,
 *   `variant="destructive"`, separator, checkbox (checked and unchecked),
 *   radio group and a submenu;
 * - the navigation menu in both modes — the default viewport (which animates
 *   the shared panel and shows the indicator) and `viewport={false}`, whose
 *   panel is the `group-data-[viewport=false]/navigation-menu:*` variant set;
 * - `NavigationMenuLink` in its `data-active` state, next to an inactive one
 *   and one that carries an icon, so the `[&_svg…]` sizing rule is covered.
 */
export function MenubarNavExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="menubar">
        <Case name="menubar-nav-bar-rich" width={520}>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarLabel>Workspace</MenubarLabel>
                <MenubarGroup>
                  <MenubarItem>
                    <FileTextIcon />
                    New skill
                    <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem inset>
                    Open recent
                    <MenubarShortcut>⌘⇧O</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled>
                    <FolderIcon />
                    Import folder
                  </MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarCheckboxItem checked>Autosave</MenubarCheckboxItem>
                <MenubarCheckboxItem>Word wrap</MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarRadioGroup value="name">
                  <MenubarRadioItem value="name">Sort by name</MenubarRadioItem>
                  <MenubarRadioItem value="path">Sort by path</MenubarRadioItem>
                </MenubarRadioGroup>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>Export as</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>
                      Markdown
                      <MenubarShortcut>⌘M</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem inset>JSON</MenubarItem>
                    <MenubarItem disabled>PDF</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem variant="destructive">
                  <SettingsIcon />
                  Delete workspace
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  Undo
                  <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Redo
                  <MenubarShortcut>⌘⇧Z</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger disabled>View</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Help</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Documentation</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </Case>
      </CaseGroup>

      <CaseGroup title="navigation menu">
        <Case name="menubar-nav-nav-viewport" width={520}>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div
                    className={[stylex.props(galleryStyles.case1).className, 'w-explicit'].join(
                      ' '
                    )}
                  >
                    <NavigationMenuLink href="#" active>
                      <WrenchIcon />
                      Claude Code
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#">Cursor</NavigationMenuLink>
                    <NavigationMenuLink href="#">Gemini CLI</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Skills</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div
                    className={[stylex.props(galleryStyles.case2).className, 'w-explicit'].join(
                      ' '
                    )}
                  >
                    <NavigationMenuLink href="#">Library</NavigationMenuLink>
                    <NavigationMenuLink href="#">Drafts</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Projects</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuIndicator />
          </NavigationMenu>
        </Case>

        <Case name="menubar-nav-nav-no-viewport" width={520}>
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Connectors</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div
                    className={[stylex.props(galleryStyles.case3).className, 'w-explicit'].join(
                      ' '
                    )}
                  >
                    <NavigationMenuLink href="#" active>
                      Filesystem
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#">Registry</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Settings</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Case>

        <CaseRow>
          <Case name="menubar-nav-link-states" width={260}>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#">Inactive</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#" active>
                    Active
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#">
                    <WrenchIcon />
                    With icon
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
  case1: { display: 'grid', width: '18rem', gap: '0.25rem', padding: '0.5rem' },
  case2: { display: 'grid', width: '16rem', gap: '0.25rem', padding: '0.5rem' },
  case3: { display: 'grid', width: '16rem', gap: '0.25rem', padding: '0.5rem' },
})
