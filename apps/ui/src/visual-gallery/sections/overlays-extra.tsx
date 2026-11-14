import { colors, radius } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { TrashIcon, TriangleAlertIcon } from 'lucide-react'
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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * The dialog and alert-dialog states the `overlays` section does not reach
 * (PR 10).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`.
 *
 * Each group exists for a reason the three cases in `overlays` cannot show:
 *
 * - the alert dialog's header and footer are a grid whose rows, columns and
 *   alignment are chosen by three things at once: the content's `data-size`,
 *   whether a media slot is present, and the 40rem breakpoint. `overlays` only
 *   ever renders *default + media* and *small + no media*, so the two missing
 *   corners are here;
 * - a dialog is positioned by a `translate` that two utilities compose, and
 *   `CommandDialog` is the one caller in the codebase that overrides half of
 *   it. That composition has no StyleX equivalent, so the case is the proof
 *   that the pair still resolves the same way;
 * - the `*-inherited-leading` cases put a descendant with its own font size and
 *   no line height of its own inside a container that carries a paired
 *   `text-sm` (or the `text-base` + `leading-none` pair, which additionally
 *   publishes a variable a caller's own text utility reads). A paired step
 *   passes a *ratio* down and a length passes a *length*, so a ten-pixel child
 *   resolves to 14.29px one way and 20px the other, and both probes sit in a
 *   box that is sized by its content;
 * - the remaining cases are the branches of the two components' own props:
 *   no close button, a footer close button, content taller than the viewport,
 *   and an overlay opened from inside another overlay.
 */
export function OverlaysExtraSection() {
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="dialog shape">
        <CaseRow>
          <Case name="dialog-no-close-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog without close</Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>No close button</DialogTitle>
                  <DialogDescription>
                    The corner button is gone, so the header keeps the full width.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </Case>

          <Case name="dialog-footer-close-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog with footer close</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Footer close</DialogTitle>
                  <DialogDescription>
                    The footer renders its own close button after the children.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Case>

          <Case name="dialog-tall-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog taller than viewport</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Long body</DialogTitle>
                  <DialogDescription>
                    Nothing constrains the height, so the panel grows past both edges.
                  </DialogDescription>
                </DialogHeader>
                {Array.from({ length: 14 }, (_, index) => (
                  <p key={index}>
                    Paragraph {index + 1} of a body that is deliberately longer than the window is
                    tall.
                  </p>
                ))}
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Case>

          <Case name="dialog-wide-child-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog with a wide child</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Width ceiling</DialogTitle>
                  <DialogDescription>
                    A very wide child cannot push the panel past its maximum width.
                  </DialogDescription>
                </DialogHeader>
                <div
                  className={[stylex.props(galleryStyles.case1).className, 'w-explicit'].join(' ')}
                />
              </DialogContent>
            </Dialog>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="dialog composition">
        <CaseRow>
          <Case name="dialog-nested-select-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog with a select</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nested overlay</DialogTitle>
                  <DialogDescription>
                    A second portal opens on top of the first one.
                  </DialogDescription>
                </DialogHeader>
                <Select defaultValue="cursor">
                  <SelectTrigger>
                    <SelectValue placeholder="Pick an editor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cursor">Cursor</SelectItem>
                    <SelectItem value="zed">Zed</SelectItem>
                  </SelectContent>
                </Select>
              </DialogContent>
            </Dialog>
          </Case>

          <Case name="dialog-inherited-leading-trigger">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog leading probe</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Title <span {...stylex.props(galleryStyles.case2)}>ten-pixel title span</span>
                  </DialogTitle>
                  <DialogDescription>
                    Description{' '}
                    <span {...stylex.props(galleryStyles.case3)}>ten-pixel description span</span>
                  </DialogDescription>
                </DialogHeader>
                <p {...stylex.props(galleryStyles.case4)}>
                  A ten-pixel paragraph in the panel body.
                </p>
              </DialogContent>
            </Dialog>
          </Case>

          <Case name="command-dialog-trigger">
            <Button variant="outline" onClick={() => setCommandOpen(true)}>
              Command dialog
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="alert dialog matrix">
        <CaseRow>
          <Case name="alert-dialog-default-no-media-trigger">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Alert default, no media</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave this page?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Two rows and no media column, which is the layout the wide breakpoint aligns to
                    the start.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay</AlertDialogCancel>
                  <AlertDialogAction>Leave</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Case>

          <Case name="alert-dialog-sm-media-trigger">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Alert small, with media</Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <TriangleAlertIcon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Three rows</AlertDialogTitle>
                  <AlertDialogDescription>
                    The small size keeps the media stacked above the title at every width.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Erase</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Case>

          <Case name="alert-dialog-small-actions-trigger">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Alert with small actions</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <TrashIcon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Remove the tag?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Both actions take the button props, so the row can be smaller and quieter.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="ghost" size="sm">
                    Keep
                  </AlertDialogCancel>
                  <AlertDialogAction variant="secondary" size="sm">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Case>

          <Case name="alert-dialog-inherited-leading-trigger">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Alert leading probe</Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Title <span {...stylex.props(galleryStyles.case5)}>ten-pixel title span</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Description{' '}
                    <span {...stylex.props(galleryStyles.case6)}>ten-pixel description span</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command>
          <CommandInput placeholder="Search commands" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Skills">
              <CommandItem>Create skill</CommandItem>
              <CommandItem>Import skill</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case1: {
    backgroundColor: colors.muted,
    height: '1.5rem',
    width: '900px',
    borderRadius: radius.md,
  },
  case2: { fontSize: '10px', lineHeight: 'inherit' },
  case3: { fontSize: '10px', lineHeight: 'inherit' },
  case4: { fontSize: '10px', lineHeight: 'inherit' },
  case5: { fontSize: '10px', lineHeight: 'inherit' },
  case6: { fontSize: '10px', lineHeight: 'inherit' },
})
