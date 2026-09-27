import { useState } from 'react'
import { GitCommitIcon, SearchIcon, SettingsIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Case, CaseGroup, CaseRow } from '../Case'

/** The clock is frozen at 2025-06-01, so June 2025 is also the month of "today". */
const FIXED_MONTH = new Date(Date.UTC(2025, 5, 1))
const FIXED_DAY = new Date(Date.UTC(2025, 5, 12))
const RANGE_START = new Date(Date.UTC(2025, 5, 9))
const RANGE_END = new Date(Date.UTC(2025, 5, 24))

/**
 * The `command` and `calendar` states the `overlays` section does not reach
 * (PR 16).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`, "Gallery cases are append-only".
 *
 * What each case pins:
 *
 * - `cmdcal-command-full` is every part of the palette at once: the input
 *   wrapper's `InputGroup` overrides, two groups with their `cmdk-group-heading`
 *   elements, a leading icon, a shortcut, a disabled item and the separator;
 * - `cmdcal-command-selected` forces cmdk's `data-selected="true"` onto a named
 *   item, which is the item's only pointer-free highlighted state;
 * - `cmdcal-command-checked` renders the `CheckIcon` the item always appends:
 *   it is invisible by default, opaque under `data-checked="true"`, and hidden
 *   outright when the item also holds a shortcut;
 * - `cmdcal-command-empty` is the empty branch of the list;
 * - `cmdcal-command-dialog-trigger` is a *closed* trigger. `CommandDialog`
 *   renders into a portal, so `overlays.spec.ts` and `animations.spec.ts`
 *   capture the open panel and its enter frames;
 * - the calendar cases are the branches of `DayPicker`'s own class map: the
 *   today marker, outside days shown and hidden, a range wide enough to have a
 *   start, three middles and an end, week numbers, the dropdown caption layout,
 *   disabled days, and a calendar inside a card (where the root's background
 *   goes transparent). `cmdcal-calendar-nav-target` is the only uncontrolled
 *   one, because the month navigation test has to be able to move it.
 */
export function CommandCalendarExtraSection() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-8">
      <CaseGroup title="command palette">
        <CaseRow>
          <Case name="cmdcal-command-full" width={360}>
            <div className="rounded-xl ring-1 ring-foreground/10">
              <Command>
                <CommandInput placeholder="Search commands…" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Commands">
                    <CommandItem value="commit">
                      <GitCommitIcon />
                      commit
                      <CommandShortcut>⌘K</CommandShortcut>
                    </CommandItem>
                    <CommandItem value="settings">
                      <SettingsIcon />
                      settings
                    </CommandItem>
                    <CommandItem value="disabled" disabled>
                      <SparklesIcon />
                      disabled entry
                      <CommandShortcut>⇧⌘D</CommandShortcut>
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

          <Case name="cmdcal-command-selected" width={360}>
            <div className="rounded-xl ring-1 ring-foreground/10">
              <Command value="verify">
                <CommandInput placeholder="Search commands…" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Commands">
                    <CommandItem value="commit">
                      <GitCommitIcon />
                      commit
                    </CommandItem>
                    <CommandItem value="verify">
                      <SparklesIcon />
                      verify
                      <CommandShortcut>⌘V</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Case>

          <Case name="cmdcal-command-checked" width={360}>
            <div className="rounded-xl ring-1 ring-foreground/10">
              <Command>
                <CommandList>
                  <CommandGroup heading="Editors">
                    <CommandItem value="cursor" data-checked="true">
                      Cursor
                    </CommandItem>
                    <CommandItem value="zed">Zed</CommandItem>
                    <CommandItem value="code" data-checked="true">
                      VS Code
                      <CommandShortcut>⌘1</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Case>

          <Case name="cmdcal-command-empty" width={360}>
            <div className="rounded-xl ring-1 ring-foreground/10">
              <Command>
                <CommandInput
                  placeholder="Search commands…"
                  value="zzzz"
                  onValueChange={() => {}}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Commands">
                    <CommandItem value="commit">commit</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Case>

          <Case name="cmdcal-command-dialog-trigger">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <SearchIcon />
              Rich command dialog
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="calendar">
        <CaseRow>
          <Case name="cmdcal-calendar-today-outside">
            <Calendar mode="single" month={FIXED_MONTH} />
          </Case>

          <Case name="cmdcal-calendar-no-outside">
            <Calendar mode="single" month={FIXED_MONTH} showOutsideDays={false} />
          </Case>

          <Case name="cmdcal-calendar-range-weeks">
            <Calendar
              mode="range"
              selected={{ from: RANGE_START, to: RANGE_END }}
              month={FIXED_MONTH}
            />
          </Case>

          <Case name="cmdcal-calendar-week-numbers">
            <Calendar mode="single" selected={FIXED_DAY} month={FIXED_MONTH} showWeekNumber />
          </Case>

          <Case name="cmdcal-calendar-dropdown-layout">
            <Calendar mode="single" month={FIXED_MONTH} captionLayout="dropdown" />
          </Case>

          <Case name="cmdcal-calendar-disabled">
            <Calendar
              mode="single"
              selected={FIXED_DAY}
              month={FIXED_MONTH}
              disabled={{ after: new Date(Date.UTC(2025, 5, 18)) }}
            />
          </Case>

          <Case name="cmdcal-calendar-in-card">
            <Card>
              <CardContent>
                <Calendar mode="single" selected={FIXED_DAY} month={FIXED_MONTH} />
              </CardContent>
            </Card>
          </Case>

          <Case name="cmdcal-calendar-nav-target">
            <Calendar mode="single" defaultMonth={FIXED_MONTH} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Command>
          <CommandInput placeholder="Search commands…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Commands">
              <CommandItem value="commit">
                <GitCommitIcon />
                commit
                <CommandShortcut>⌘K</CommandShortcut>
              </CommandItem>
              <CommandItem value="settings">
                <SettingsIcon />
                settings
              </CommandItem>
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
      </CommandDialog>
    </div>
  )
}
