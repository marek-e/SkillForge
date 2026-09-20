import { FolderIcon, SettingsIcon, TerminalIcon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

/**
 * The states of `tabs`, `accordion`, `collapsible`, `scroll-area` and
 * `resizable` that the `disclosure` section does not reach (PR 09).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`.
 *
 * Four groups of cases exist for a reason a static shot cannot show on its own:
 *
 * - the `*-focus-target` and `*-hover-target` cases are driven by the
 *   `disclosure extra states` interaction test, because the tab trigger's box
 *   shadow is written by three rules at once (the focus ring, the active
 *   shadow of a `default` list and the shadow reset of a `line` list) and the
 *   accordion trigger's focus ring brings a generated `::after` into a flex row
 *   with it;
 * - `scroll-area-always-*` force `type="always"`, because a Radix scrollbar is
 *   only in the DOM while the pointer is over the area otherwise;
 * - the two `*-inherited-leading` cases put a descendant with its own font size
 *   and no line height of its own inside a container that carries a paired
 *   `text-sm`, which is the trap `conventions.md` records. A paired step passes
 *   a *ratio* down and a StyleX length passes a *length*, so a ten-pixel child
 *   resolves to 14.29px one way and 20px the other. Both probes sit where that
 *   difference changes a box: a vertical tab trigger and an accordion trigger
 *   are sized by their content, and so is a paragraph in either panel;
 * - `resizable-vertical-handle` is the only case where the grip `div` is
 *   rotated by its parent's orientation.
 */
export function DisclosureExtraSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="tabs">
        <CaseRow>
          <Case name="tabs-default-focus-target" width={360}>
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Active</TabsTrigger>
                <TabsTrigger value="b">Inactive</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-line-focus-target" width={360}>
            <Tabs defaultValue="a">
              <TabsList variant="line">
                <TabsTrigger value="a">Active</TabsTrigger>
                <TabsTrigger value="b">Inactive</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-line-hover-target" width={360}>
            <Tabs defaultValue="a">
              <TabsList variant="line">
                <TabsTrigger value="a">Active</TabsTrigger>
                <TabsTrigger value="b">Hover me</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Panel</TabsContent>
            </Tabs>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="tabs-with-icons" width={360}>
            <Tabs defaultValue="files">
              <TabsList>
                <TabsTrigger value="files">
                  <FolderIcon />
                  Files
                </TabsTrigger>
                <TabsTrigger value="terminal">
                  <TerminalIcon />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <SettingsIcon className="size-5" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="files">Files panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-many" width={280}>
            <Tabs defaultValue="one">
              <TabsList>
                {['one', 'two', 'three', 'four', 'five', 'six'].map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {value}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="one">Panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-disabled-active" width={360}>
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a" disabled>
                  Disabled active
                </TabsTrigger>
                <TabsTrigger value="b">Other</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Panel</TabsContent>
            </Tabs>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="tabs-vertical-line" width={360}>
            <Tabs defaultValue="a" orientation="vertical">
              <TabsList variant="line">
                <TabsTrigger value="a">Active</TabsTrigger>
                <TabsTrigger value="b">Second</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Vertical panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-vertical-icons" width={360}>
            <Tabs defaultValue="a" orientation="vertical">
              <TabsList>
                <TabsTrigger value="a">
                  <FolderIcon />
                  First
                </TabsTrigger>
                <TabsTrigger value="b">
                  <TerminalIcon />
                  Second
                </TabsTrigger>
              </TabsList>
              <TabsContent value="a">Vertical panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-inherited-leading" width={360}>
            <Tabs defaultValue="a" orientation="vertical">
              <TabsList>
                <TabsTrigger value="a">
                  <span className="text-[10px]">Ten-pixel label</span>
                </TabsTrigger>
                <TabsTrigger value="b">Plain</TabsTrigger>
              </TabsList>
              <TabsContent value="a">
                <p className="text-[10px]">A paragraph with no line height of its own.</p>
                <Button size="sm">Panel button</Button>
              </TabsContent>
            </Tabs>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="accordion">
        <CaseRow>
          <Case name="accordion-focus-target" width={480}>
            <Accordion type="single" collapsible>
              <AccordionItem value="one">
                <AccordionTrigger>Focus me</AccordionTrigger>
                <AccordionContent>Body</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Case>
          <Case name="accordion-hover-target" width={480}>
            <Accordion type="single" collapsible>
              <AccordionItem value="one">
                <AccordionTrigger>Hover me</AccordionTrigger>
                <AccordionContent>Body</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="accordion-wrapping-trigger" width={320}>
            <Accordion type="single" collapsible defaultValue="one">
              <AccordionItem value="one">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <TerminalIcon className="size-4 text-muted-foreground" />
                    <code className="text-sm font-mono">/review-pull-request</code>
                    <span className="text-muted-foreground">- {LONG_TEXT}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>Body</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Case>
          <Case name="accordion-content-rich" width={480}>
            <Accordion type="single" collapsible defaultValue="one">
              <AccordionItem value="one">
                <AccordionTrigger>Rich body</AccordionTrigger>
                <AccordionContent>
                  <p>
                    A first paragraph with an <a href="#stylex">inline link</a> inside it.
                  </p>
                  <p>A last paragraph, which carries no bottom margin.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Case>
          <Case name="accordion-inherited-leading" width={480}>
            <Accordion type="single" collapsible defaultValue="one">
              <AccordionItem value="one">
                <AccordionTrigger>
                  <span className="text-[10px]">Ten-pixel label</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-[10px]">A paragraph with no line height of its own.</p>
                  <Button size="sm">Compact</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="collapsible">
        <Case name="collapsible-open-bordered" width={360}>
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="outline">Toggle</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-lg border p-3 text-sm">
                A body the collapsible itself puts no styling on.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Case>
        <Case name="collapsible-closed-bordered" width={360}>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline">Toggle</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-lg border p-3 text-sm">Hidden body</div>
            </CollapsibleContent>
          </Collapsible>
        </Case>
      </CaseGroup>

      <CaseGroup title="scroll area">
        <CaseRow>
          <Case name="scroll-area-always-vertical" width={280}>
            <ScrollArea type="always" className="h-40 rounded-lg border p-3">
              <div className="space-y-2 text-sm">
                {Array.from({ length: 16 }, (_, index) => (
                  <p key={index}>Row {index + 1}</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
          <Case name="scroll-area-always-horizontal" width={280}>
            <ScrollArea type="always" className="rounded-lg border p-3">
              <div className="w-[520px] text-sm">
                A single line of content that is much wider than the area holding it.
              </div>
            </ScrollArea>
          </Case>
          <Case name="scroll-area-always-both" width={280}>
            <ScrollArea type="always" className="h-40 rounded-lg border p-3">
              <div className="w-[520px] space-y-2 text-sm">
                {Array.from({ length: 16 }, (_, index) => (
                  <p key={index}>A wide row number {index + 1} that does not wrap</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="scroll-area-focus-target" width={280}>
            <ScrollArea type="always" className="h-24 rounded-lg border p-3">
              <div className="space-y-2 text-sm">
                {Array.from({ length: 10 }, (_, index) => (
                  <p key={index}>Row {index + 1}</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
          <Case name="scroll-area-inherited-radius" width={280}>
            <ScrollArea type="always" className="h-24 rounded-3xl border">
              <div className="space-y-2 bg-muted p-3 text-sm">
                {Array.from({ length: 10 }, (_, index) => (
                  <p key={index}>Row {index + 1}</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="resizable">
        <Case name="resizable-vertical-handle" width={480}>
          <ResizablePanelGroup orientation="vertical" className="h-40 rounded-lg border">
            <ResizablePanel defaultSize={40}>
              <div className="p-3 text-sm">Top</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <div className="p-3 text-sm">Bottom</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-handle-focus-target" width={480}>
          <ResizablePanelGroup orientation="horizontal" className="h-40 rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="p-3 text-sm">Left</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="p-3 text-sm">Right</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-three-panels" width={480}>
          <ResizablePanelGroup orientation="horizontal" className="h-40 rounded-lg border">
            <ResizablePanel defaultSize={25}>
              <div className="p-3 text-sm">One</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="p-3 text-sm">Two</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <div className="p-3 text-sm">Three</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-nested" width={480}>
          <ResizablePanelGroup orientation="horizontal" className="h-40 rounded-lg border">
            <ResizablePanel defaultSize={40}>
              <div className="p-3 text-sm">Side</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={50}>
                  <div className="p-3 text-sm">Inner top</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="p-3 text-sm">Inner bottom</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
      </CaseGroup>
    </div>
  )
}
