import { colors, fonts, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
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
    <div {...stylex.props(galleryStyles.case0)}>
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
                  <SettingsIcon
                    className={[stylex.props(galleryStyles.case1).className, 'size-explicit'].join(
                      ' '
                    )}
                  />
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
                  <span {...stylex.props(galleryStyles.case2)}>Ten-pixel label</span>
                </TabsTrigger>
                <TabsTrigger value="b">Plain</TabsTrigger>
              </TabsList>
              <TabsContent value="a">
                <p {...stylex.props(galleryStyles.case3)}>
                  A paragraph with no line height of its own.
                </p>
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
                  <span {...stylex.props(galleryStyles.case4)}>
                    <TerminalIcon
                      className={[
                        stylex.props(galleryStyles.case5).className,
                        'size-explicit',
                      ].join(' ')}
                    />
                    <code {...stylex.props(galleryStyles.case6)}>/review-pull-request</code>
                    <span {...stylex.props(galleryStyles.case7)}>- {LONG_TEXT}</span>
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
                  <span {...stylex.props(galleryStyles.case8)}>Ten-pixel label</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p {...stylex.props(galleryStyles.case9)}>
                    A paragraph with no line height of its own.
                  </p>
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
              <div {...stylex.props(galleryStyles.case10)}>
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
              <div {...stylex.props(galleryStyles.case11)}>Hidden body</div>
            </CollapsibleContent>
          </Collapsible>
        </Case>
      </CaseGroup>

      <CaseGroup title="scroll area">
        <CaseRow>
          <Case name="scroll-area-always-vertical" width={280}>
            <ScrollArea type="always" sx={galleryStyles.case12}>
              <div {...stylex.props(galleryStyles.case13)}>
                {Array.from({ length: 16 }, (_, index) => (
                  <p key={index}>Row {index + 1}</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
          <Case name="scroll-area-always-horizontal" width={280}>
            <ScrollArea type="always" sx={galleryStyles.case14}>
              <div
                className={[stylex.props(galleryStyles.case15).className, 'w-explicit'].join(' ')}
              >
                A single line of content that is much wider than the area holding it.
              </div>
            </ScrollArea>
          </Case>
          <Case name="scroll-area-always-both" width={280}>
            <ScrollArea type="always" sx={galleryStyles.case16}>
              <div
                className={[stylex.props(galleryStyles.case17).className, 'w-explicit'].join(' ')}
              >
                {Array.from({ length: 16 }, (_, index) => (
                  <p key={index}>A wide row number {index + 1} that does not wrap</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="scroll-area-focus-target" width={280}>
            <ScrollArea type="always" sx={galleryStyles.case18}>
              <div {...stylex.props(galleryStyles.case19)}>
                {Array.from({ length: 10 }, (_, index) => (
                  <p key={index}>Row {index + 1}</p>
                ))}
              </div>
            </ScrollArea>
          </Case>
          <Case name="scroll-area-inherited-radius" width={280}>
            <ScrollArea type="always" sx={galleryStyles.case20}>
              <div {...stylex.props(galleryStyles.case21)}>
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
          <ResizablePanelGroup orientation="vertical" sx={galleryStyles.case22}>
            <ResizablePanel defaultSize={40}>
              <div {...stylex.props(galleryStyles.case23)}>Top</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <div {...stylex.props(galleryStyles.case24)}>Bottom</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-handle-focus-target" width={480}>
          <ResizablePanelGroup orientation="horizontal" sx={galleryStyles.case25}>
            <ResizablePanel defaultSize={50}>
              <div {...stylex.props(galleryStyles.case26)}>Left</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div {...stylex.props(galleryStyles.case27)}>Right</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-three-panels" width={480}>
          <ResizablePanelGroup orientation="horizontal" sx={galleryStyles.case28}>
            <ResizablePanel defaultSize={25}>
              <div {...stylex.props(galleryStyles.case29)}>One</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div {...stylex.props(galleryStyles.case30)}>Two</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <div {...stylex.props(galleryStyles.case31)}>Three</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-nested" width={480}>
          <ResizablePanelGroup orientation="horizontal" sx={galleryStyles.case32}>
            <ResizablePanel defaultSize={40}>
              <div {...stylex.props(galleryStyles.case33)}>Side</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={50}>
                  <div {...stylex.props(galleryStyles.case34)}>Inner top</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div {...stylex.props(galleryStyles.case35)}>Inner bottom</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case1: { width: '1.25rem', height: '1.25rem' },
  case2: { fontSize: '10px', lineHeight: 'inherit' },
  case3: { fontSize: '10px', lineHeight: 'inherit' },
  case4: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  case5: { width: '1rem', height: '1rem', color: colors.mutedForeground },
  case6: { fontSize: '0.875rem', lineHeight: typography.smLineHeight, fontFamily: fonts.mono },
  case7: { color: colors.mutedForeground },
  case8: { fontSize: '10px', lineHeight: 'inherit' },
  case9: { fontSize: '10px', lineHeight: 'inherit' },
  case10: {
    marginTop: '0.5rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case11: {
    marginTop: '0.5rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case12: {
    height: '10rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
  },
  case13: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case14: { borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid', padding: '0.75rem' },
  case15: { width: '520px', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case16: {
    height: '10rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
  },
  case17: {
    width: '520px',
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case18: {
    height: '6rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
  },
  case19: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case20: { height: '6rem', borderRadius: radius['3xl'], borderWidth: '1px', borderStyle: 'solid' },
  case21: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
    backgroundColor: colors.muted,
    padding: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case22: { height: '10rem', borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid' },
  case23: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case24: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case25: { height: '10rem', borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid' },
  case26: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case27: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case28: { height: '10rem', borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid' },
  case29: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case30: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case31: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case32: { height: '10rem', borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid' },
  case33: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case34: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case35: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
})
