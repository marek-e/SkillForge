import { CalendarIcon, SettingsIcon, TrashIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/components/ui/combobox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
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
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { toast } from '@/components/ui/toaster'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Case, CaseGroup, CaseRow } from '../Case'

const FIXED_MONTH = new Date(Date.UTC(2025, 5, 1))
const FIXED_DAY = new Date(Date.UTC(2025, 5, 12))
const RANGE_START = new Date(Date.UTC(2025, 5, 9))
const RANGE_END = new Date(Date.UTC(2025, 5, 17))
const COMBOBOX_ITEMS = ['Cursor', 'VS Code', 'Zed', 'Sublime Text', 'Windsurf']

export function OverlaysSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="dialog triggers">
        <CaseRow>
          <Case name="dialog-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New skill</DialogTitle>
                  <DialogDescription>
                    Fill in a name, optional description, tags and scope.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Create skill</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Case>

          <Case name="alert-dialog-trigger">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Open alert dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <TrashIcon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes Alpha Platform from your project list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Case>

          <Case name="alert-dialog-sm-trigger">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Open small alert dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                  <AlertDialogDescription>Unsaved edits are lost.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep</AlertDialogCancel>
                  <AlertDialogAction>Discard</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="sheet and drawer triggers">
        <CaseRow>
          {(['right', 'left', 'top', 'bottom'] as const).map((side) => (
            <Case key={side} name={`sheet-${side}-trigger`}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sheet {side}</Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Sheet {side}</SheetTitle>
                    <SheetDescription>A sheet anchored to the {side} edge.</SheetDescription>
                  </SheetHeader>
                  <SheetFooter>
                    <Button variant="outline">Close</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </Case>
          ))}
          {(['bottom', 'right'] as const).map((direction) => (
            <Case key={direction} name={`drawer-${direction}-trigger`}>
              <Drawer direction={direction}>
                <DrawerTrigger asChild>
                  <Button variant="outline">Drawer {direction}</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Drawer {direction}</DrawerTitle>
                    <DrawerDescription>A drawer from the {direction} edge.</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button variant="outline">Close</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="floating triggers">
        <CaseRow>
          <Case name="popover-trigger">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Popover title</PopoverTitle>
                  <PopoverDescription>Popover description text.</PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </Case>

          <Case name="tooltip-trigger">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for tooltip</Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Refresh detected skills</TooltipContent>
            </Tooltip>
          </Case>

          <Case name="hover-card-trigger">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="link">Hover card</Button>
              </HoverCardTrigger>
              <HoverCardContent>A hover card with a fixed width and a shadow.</HoverCardContent>
            </HoverCard>
          </Case>

          <Case name="dropdown-menu-trigger">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SettingsIcon />
                  Open menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    Light
                    <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Dark</DropdownMenuItem>
                  <DropdownMenuItem disabled>Disabled entry</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Show hidden</DropdownMenuCheckboxItem>
                <DropdownMenuRadioGroup value="grid">
                  <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Nested one</DropdownMenuItem>
                    <DropdownMenuItem>Nested two</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Case>

          <Case name="context-menu-trigger">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-16 w-48 items-center justify-center rounded-lg border border-dashed text-sm">
                Right click here
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>Row actions</ContextMenuLabel>
                <ContextMenuItem>
                  Open
                  <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuCheckboxItem checked>Favorite</ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuRadioGroup value="name">
                  <ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="path">Sort by path</ContextMenuRadioItem>
                </ContextMenuRadioGroup>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Nested</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="menubar and navigation menu">
        <Case name="menubar-closed" width={480}>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New skill
                  <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem checked>Autosave</MenubarCheckboxItem>
                <MenubarSub>
                  <MenubarSubTrigger>Export</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Markdown</MenubarItem>
                    <MenubarItem>JSON</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </Case>

        <Case name="navigation-menu-closed" width={480}>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-64 gap-1 p-2">
                    <NavigationMenuLink href="#">Claude Code</NavigationMenuLink>
                    <NavigationMenuLink href="#">Cursor</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Projects</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Case>
      </CaseGroup>

      <CaseGroup title="select">
        <CaseRow>
          <Case name="select-closed" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Editors</SelectLabel>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="cursor">Cursor</SelectItem>
                  <SelectItem value="code">VS Code</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="zed" disabled>
                    Zed (disabled)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Case>
          <Case name="select-placeholder" width={240}>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick an editor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="select-disabled" width={240}>
            <Select disabled defaultValue="cursor">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="select-invalid" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger className="w-full" aria-invalid>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="command">
        <Case name="command-inline" width={360}>
          <div className="rounded-xl ring-1 ring-foreground/10">
            <Command>
              <CommandInput placeholder="Search commands…" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Commands">
                  <CommandItem value="commit">
                    commit
                    <CommandShortcut>⌘K</CommandShortcut>
                  </CommandItem>
                  <CommandItem value="verify">verify</CommandItem>
                  <CommandItem value="disabled" disabled>
                    disabled entry
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Skills">
                  <CommandItem value="summarize">summarize-pull-request</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </Case>
        <Case name="command-empty" width={360}>
          <div className="rounded-xl ring-1 ring-foreground/10">
            <Command>
              <CommandInput placeholder="Search commands…" value="zzzz" onValueChange={() => {}} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Commands">
                  <CommandItem value="commit">commit</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="calendar">
        <CaseRow>
          <Case name="calendar-single">
            <Calendar mode="single" selected={FIXED_DAY} month={FIXED_MONTH} />
          </Case>
          <Case name="calendar-range">
            <Calendar
              mode="range"
              selected={{ from: RANGE_START, to: RANGE_END }}
              month={FIXED_MONTH}
            />
          </Case>
          <Case name="calendar-dropdown">
            <Calendar mode="single" captionLayout="dropdown" month={FIXED_MONTH} />
          </Case>
          <Case name="calendar-disabled-days">
            <Calendar
              mode="single"
              month={FIXED_MONTH}
              disabled={{ before: new Date(Date.UTC(2025, 5, 10)) }}
            />
          </Case>
          <Case name="calendar-in-popover-trigger">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon />
                  Pick a date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={FIXED_DAY} month={FIXED_MONTH} />
              </PopoverContent>
            </Popover>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="combobox">
        <CaseRow>
          <Case name="combobox-closed" width={260}>
            <Combobox items={COMBOBOX_ITEMS}>
              <ComboboxInput placeholder="Search editors…" />
              <ComboboxContent>
                <ComboboxEmpty>No editors found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="combobox-selected" width={260}>
            <Combobox items={COMBOBOX_ITEMS} defaultValue="Cursor">
              <ComboboxInput showClear placeholder="Search editors…" />
              <ComboboxContent>
                <ComboboxEmpty>No editors found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="combobox-disabled" width={260}>
            <Combobox items={COMBOBOX_ITEMS}>
              <ComboboxInput disabled placeholder="Disabled" />
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="combobox-chips" width={300}>
            <Combobox items={COMBOBOX_ITEMS} multiple defaultValue={['Cursor', 'VS Code']}>
              <ComboboxChips>
                <ComboboxValue>
                  {(value: string[]) =>
                    value.map((item) => (
                      <ComboboxChip key={item} aria-label={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Add editor…" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="toaster">
        <CaseRow>
          <Case name="toaster-trigger">
            <Button
              variant="outline"
              onClick={() => toast.success({ title: 'Skill saved', description: 'skill-alpha' })}
            >
              Show toast
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}
