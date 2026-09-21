import { Button } from '@/components/ui/button'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Sheet and drawer states the `overlays` section does not reach (PR 11).
 *
 * `overlays` covers the four sheet sides and the bottom/right drawer with a
 * short header and footer. What is missing is the left and top drawer
 * directions, a sheet rendered without its close button, and content taller
 * than the viewport — neither component sets `overflow`, so a long body simply
 * runs past the edge, which is a quirk the migration has to preserve.
 *
 * A new section rather than extra cases in `overlays`: `gallery.spec.ts` takes
 * one full-page screenshot per section, so appending to an existing one would
 * invalidate a frozen original.
 */
const LONG_ITEMS = Array.from({ length: 24 }, (_, index) => `Detected skill ${index + 1}`)

function LongBody() {
  return (
    <div className="flex flex-col gap-2 px-4">
      {LONG_ITEMS.map((item) => (
        <div key={item} className="rounded-md border px-2 py-1 text-sm">
          {item}
        </div>
      ))}
    </div>
  )
}

export function OverlaysSheetDrawerSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="sheet without a close button">
        <CaseRow>
          {(['right', 'left'] as const).map((side) => (
            <Case key={side} name={`sheet-${side}-no-close-trigger`}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sheet {side} bare</Button>
                </SheetTrigger>
                <SheetContent side={side} showCloseButton={false}>
                  <SheetHeader>
                    <SheetTitle>No close button</SheetTitle>
                    <SheetDescription>
                      The ghost icon button in the corner is suppressed.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetFooter>
                    <Button variant="outline">Dismiss</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="sheet with overflowing content">
        <CaseRow>
          {(['right', 'bottom'] as const).map((side) => (
            <Case key={side} name={`sheet-${side}-long-trigger`}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sheet {side} long</Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Long sheet {side}</SheetTitle>
                    <SheetDescription>Twenty-four rows, taller than the viewport.</SheetDescription>
                  </SheetHeader>
                  <LongBody />
                  <SheetFooter>
                    <Button variant="outline">Close</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="drawer directions">
        <CaseRow>
          {(['left', 'top'] as const).map((direction) => (
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

          <Case name="drawer-bottom-long-trigger">
            <Drawer direction="bottom">
              <DrawerTrigger asChild>
                <Button variant="outline">Drawer bottom long</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Long drawer</DrawerTitle>
                  <DrawerDescription>
                    The handle bar only shows for the bottom direction.
                  </DrawerDescription>
                </DrawerHeader>
                <LongBody />
                <DrawerFooter>
                  <Button variant="outline">Close</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}
