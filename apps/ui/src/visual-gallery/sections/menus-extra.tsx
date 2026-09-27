import { BellIcon, CopyIcon, SettingsIcon, StarIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Case, CaseGroup, CaseRow } from '../Case'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

/**
 * Menu states the `overlays` section does not reach (PR 13).
 *
 * Every case here is a *closed* trigger: `DropdownMenuContent` and
 * `ContextMenuContent` render into a portal, so an element screenshot of the
 * case box never contains them. The open states are captured full page by the
 * `menus-extra` block in `visual/overlays.spec.ts`, and the enter animation by
 * `visual/animations.spec.ts`.
 *
 * `inset={false}` is deliberate on one item: React stringifies a `data-*`
 * attribute, so `data-inset="false"` is rendered and Tailwind's `data-inset:`
 * variant (a bare `[data-inset]` attribute selector) still matches it. The
 * item is indented exactly like an `inset` one. That is the behaviour at the
 * frozen commit and it is pinned, not fixed.
 */
export function MenusExtraSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="dropdown menu, every item kind">
        <CaseRow>
          <Case name="menu-dropdown-rich">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SettingsIcon />
                  Rich menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <StarIcon />
                    Favourite
                    <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CopyIcon />
                    Duplicate
                    <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <BellIcon />
                    Disabled entry
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Show hidden files</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Show sizes</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked disabled>
                  Locked toggle
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="name">
                  <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="size" disabled>
                    Size
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuLabel>Projects</DropdownMenuLabel>
                    <DropdownMenuItem>
                      Alpha
                      <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Beta</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Keep a copy</DropdownMenuCheckboxItem>
                    <DropdownMenuItem variant="destructive">
                      <TrashIcon />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <TrashIcon />
                  Delete
                  <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" disabled>
                  <TrashIcon />
                  Delete all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Case>

          <Case name="menu-dropdown-inset">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Inset menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-56">
                <DropdownMenuLabel inset>Inset label</DropdownMenuLabel>
                <DropdownMenuItem inset>Inset item</DropdownMenuItem>
                <DropdownMenuItem inset={false}>Inset false item</DropdownMenuItem>
                <DropdownMenuItem>Plain item</DropdownMenuItem>
                <DropdownMenuCheckboxItem inset checked>
                  Inset checkbox
                </DropdownMenuCheckboxItem>
                <DropdownMenuRadioGroup value="a">
                  <DropdownMenuRadioItem inset value="a">
                    Inset radio
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger inset>Inset submenu</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Nested</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="dropdown menu placement">
        <CaseRow>
          {SIDES.map((side) => (
            <Case key={side} name={`menu-dropdown-side-${side}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Side {side}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={side} align="center">
                  <DropdownMenuItem>
                    Open
                    <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="context menu">
        <CaseRow>
          <Case name="menu-context-rich">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-20 w-56 items-center justify-center rounded-lg border border-dashed text-sm">
                Right click for the rich menu
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel inset>Row actions</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuItem inset>
                    Open
                    <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <CopyIcon />
                    Duplicate
                    <ContextMenuShortcut>⇧⌘D</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem disabled>
                    <BellIcon />
                    Disabled entry
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem checked>Favourite</ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem>Pinned</ContextMenuCheckboxItem>
                <ContextMenuRadioGroup value="name">
                  <ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="path" disabled>
                    Sort by path
                  </ContextMenuRadioItem>
                </ContextMenuRadioGroup>
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuLabel>Projects</ContextMenuLabel>
                    <ContextMenuItem>
                      Alpha
                      <ContextMenuShortcut>⌘1</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuCheckboxItem checked>Keep a copy</ContextMenuCheckboxItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem variant="destructive">
                  <TrashIcon />
                  Delete
                  <ContextMenuShortcut>⌫</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem variant="destructive" disabled>
                  <TrashIcon />
                  Delete all
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Case>

          <Case name="menu-context-edge">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-20 w-56 items-center justify-center rounded-lg border border-dashed text-sm">
                Collision target
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>Collision</ContextMenuLabel>
                <ContextMenuItem>
                  Open
                  <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>Rename</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Alpha</ContextMenuItem>
                    <ContextMenuItem>Beta</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}
