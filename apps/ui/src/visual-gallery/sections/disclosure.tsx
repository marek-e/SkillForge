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
    <div className="space-y-8">
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
              <div className="pt-2 text-sm text-muted-foreground">Collapsed body</div>
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
              <div className="pt-2 text-sm text-muted-foreground">Expanded body</div>
            </CollapsibleContent>
          </Collapsible>
        </Case>
      </CaseGroup>

      <CaseGroup title="scroll area">
        <Case name="scroll-area-vertical" width={280}>
          <ScrollArea className="h-40 rounded-lg border p-3">
            <div className="space-y-2 text-sm">
              {Array.from({ length: 16 }, (_, index) => (
                <p key={index}>Row {index + 1}</p>
              ))}
            </div>
          </ScrollArea>
        </Case>
        <Case name="scroll-area-short" width={280}>
          <ScrollArea className="h-40 rounded-lg border p-3">
            <div className="text-sm">Content that does not overflow.</div>
          </ScrollArea>
        </Case>
      </CaseGroup>

      <CaseGroup title="resizable">
        <Case name="resizable-horizontal" width={480}>
          <ResizablePanelGroup orientation="horizontal" className="h-40 rounded-lg border">
            <ResizablePanel defaultSize={35}>
              <div className="p-3 text-sm">Left</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65}>
              <div className="p-3 text-sm">Right</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
        <Case name="resizable-vertical" width={480}>
          <ResizablePanelGroup orientation="vertical" className="h-40 rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="p-3 text-sm">Top</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="p-3 text-sm">Bottom</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Case>
      </CaseGroup>

      <CaseGroup title="carousel">
        <Case name="carousel-default" width={420}>
          <div className="px-14">
            <Carousel>
              <CarouselContent>
                {Array.from({ length: 4 }, (_, index) => (
                  <CarouselItem key={index}>
                    <div className="flex h-28 items-center justify-center rounded-lg bg-muted text-sm">
                      Slide {index + 1}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </Case>
        <Case name="carousel-vertical" width={220}>
          <div className="py-14">
            <Carousel orientation="vertical">
              <CarouselContent className="h-28">
                {Array.from({ length: 3 }, (_, index) => (
                  <CarouselItem key={index}>
                    <div className="flex h-28 items-center justify-center rounded-lg bg-muted text-sm">
                      Slide {index + 1}
                    </div>
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
