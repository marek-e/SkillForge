import { colors, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { ChevronDownIcon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

export function DisclosureSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="tabs">
        <CaseRow>
          <Case name="tabs-default" width={360}>
            <Tabs defaultValue="commands">
              <TabsList>
                <TabsTrigger value="commands">Commands (3)</TabsTrigger>
                <TabsTrigger value="skills">Skills (4)</TabsTrigger>
              </TabsList>
              <TabsContent value="commands">Commands panel</TabsContent>
              <TabsContent value="skills">Skills panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-line" width={360}>
            <Tabs defaultValue="a">
              <TabsList variant="line">
                <TabsTrigger value="a">First</TabsTrigger>
                <TabsTrigger value="b">Second</TabsTrigger>
              </TabsList>
              <TabsContent value="a">First panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-disabled" width={360}>
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Enabled</TabsTrigger>
                <TabsTrigger value="b" disabled>
                  Disabled
                </TabsTrigger>
              </TabsList>
              <TabsContent value="a">Panel</TabsContent>
            </Tabs>
          </Case>
          <Case name="tabs-vertical" width={360}>
            <Tabs defaultValue="a" orientation="vertical">
              <TabsList>
                <TabsTrigger value="a">First</TabsTrigger>
                <TabsTrigger value="b">Second</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Panel</TabsContent>
            </Tabs>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="accordion">
        <Case name="accordion-collapsed" width={480}>
          <Accordion type="single" collapsible>
            <AccordionItem value="one">
              <AccordionTrigger>First item</AccordionTrigger>
              <AccordionContent>{LONG_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Second item</AccordionTrigger>
              <AccordionContent>Second body</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Case>
        <Case name="accordion-expanded" width={480}>
          <Accordion type="single" collapsible defaultValue="one">
            <AccordionItem value="one">
              <AccordionTrigger>First item</AccordionTrigger>
              <AccordionContent>{LONG_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Second item</AccordionTrigger>
              <AccordionContent>Second body</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Case>
        <Case name="accordion-multiple" width={480}>
          <Accordion type="multiple" defaultValue={['one', 'two']}>
            <AccordionItem value="one">
              <AccordionTrigger>First item</AccordionTrigger>
              <AccordionContent>First body</AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Second item</AccordionTrigger>
              <AccordionContent>Second body</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Case>
        <Case name="accordion-disabled" width={480}>
          <Accordion type="single" collapsible>
            <AccordionItem value="one" disabled>
              <AccordionTrigger>Disabled item</AccordionTrigger>
              <AccordionContent>Hidden</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Case>
      </CaseGroup>

      <CaseGroup title="collapsible">
        <Case name="collapsible-closed" width={360}>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                Toggle
                <ChevronDownIcon />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div {...stylex.props(galleryStyles.case1)}>Collapsed body</div>
            </CollapsibleContent>
          </Collapsible>
        </Case>
        <Case name="collapsible-open" width={360}>
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                Toggle
                <ChevronDownIcon />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div {...stylex.props(galleryStyles.case2)}>Expanded body</div>
            </CollapsibleContent>
          </Collapsible>
        </Case>
      </CaseGroup>

      <CaseGroup title="scroll area">
        <Case name="scroll-area-vertical" width={280}>
          <ScrollArea sx={galleryStyles.case3}>
            <div {...stylex.props(galleryStyles.case4)}>
              {Array.from({ length: 16 }, (_, index) => (
                <p key={index}>Row {index + 1}</p>
              ))}
            </div>
          </ScrollArea>
        </Case>
        <Case name="scroll-area-short" width={280}>
          <ScrollArea sx={galleryStyles.case5}>
            <div {...stylex.props(galleryStyles.case6)}>Content that does not overflow.</div>
          </ScrollArea>
        </Case>
      </CaseGroup>

      <CaseGroup title="resizable">
        <Case name="resizable-horizontal" width={480}>
          <ResizablePanelGroup orientation="horizontal" sx={galleryStyles.case7}>
            <ResizablePanel defaultSize={35}>
              <div {...stylex.props(galleryStyles.case8)}>Left</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65}>
              <div {...stylex.props(galleryStyles.case9)}>Right</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-vertical" width={480}>
          <ResizablePanelGroup orientation="vertical" sx={galleryStyles.case10}>
            <ResizablePanel defaultSize={50}>
              <div {...stylex.props(galleryStyles.case11)}>Top</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div {...stylex.props(galleryStyles.case12)}>Bottom</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
      </CaseGroup>

      <CaseGroup title="carousel">
        <Case name="carousel-default" width={420}>
          <div {...stylex.props(galleryStyles.case13)}>
            <Carousel>
              <CarouselContent>
                {Array.from({ length: 4 }, (_, index) => (
                  <CarouselItem key={index}>
                    <div {...stylex.props(galleryStyles.case14)}>Slide {index + 1}</div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </Case>
        <Case name="carousel-vertical" width={220}>
          <div {...stylex.props(galleryStyles.case15)}>
            <Carousel orientation="vertical">
              <CarouselContent sx={galleryStyles.case16}>
                {Array.from({ length: 3 }, (_, index) => (
                  <CarouselItem key={index}>
                    <div {...stylex.props(galleryStyles.case17)}>Slide {index + 1}</div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
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
  case1: {
    paddingTop: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    color: colors.mutedForeground,
  },
  case2: {
    paddingTop: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    color: colors.mutedForeground,
  },
  case3: {
    height: '10rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
  },
  case4: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case5: {
    height: '10rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.75rem',
  },
  case6: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case7: { height: '10rem', borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid' },
  case8: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case9: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case10: { height: '10rem', borderRadius: radius.lg, borderWidth: '1px', borderStyle: 'solid' },
  case11: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case12: { padding: '0.75rem', fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case13: { paddingInline: '3.5rem' },
  case14: {
    display: 'flex',
    height: '7rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case15: { paddingBlock: '3.5rem' },
  case16: { height: '7rem' },
  case17: {
    display: 'flex',
    height: '7rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
})
