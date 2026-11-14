import { colors } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Case, CaseGroup, CaseRow } from '../Case'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

/**
 * Popover, tooltip and hover-card in the states the `overlays` section does not
 * reach (PR 12).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`.
 *
 * Almost every case here exists for a *portalled* capture rather than for the
 * element shot of its trigger: the content is what this row migrates, and it
 * only exists while the floating element is open. `overlays.spec.ts` opens each
 * one by pointer and by keyboard, `animations.spec.ts` captures the enter frames
 * and `computed-styles.spec.ts` dumps the open content.
 *
 * The four `side` values matter one by one: each one gets its own enter
 * keyframes (`data-[side=bottom]:slide-in-from-top-2` and its three siblings)
 * and its own `--radix-*-content-transform-origin`. The two collision cases sit
 * at the ends of a full-width row and ask for the side that has no room, so
 * Radix's flip middleware rewrites `data-side` and a different keyframe runs.
 */
export function FloatingExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="popover sides">
        <CaseRow>
          {SIDES.map((side) => (
            <Case key={side} name={`popover-side-${side}-trigger`}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover {side}</Button>
                </PopoverTrigger>
                <PopoverContent side={side}>
                  <PopoverHeader>
                    <PopoverTitle>Popover {side}</PopoverTitle>
                    <PopoverDescription>
                      Anchored to the {side} side of its trigger.
                    </PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="popover collision edges and keyboard">
        <div className={[stylex.props(galleryStyles.case1).className, 'w-explicit'].join(' ')}>
          <Case name="popover-collision-start-trigger">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Edge L</Button>
              </PopoverTrigger>
              <PopoverContent side="left">
                <PopoverHeader>
                  <PopoverTitle>Left edge</PopoverTitle>
                  <PopoverDescription>No room on the left of the trigger.</PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </Case>

          <Case name="popover-collision-end-trigger">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Edge R</Button>
              </PopoverTrigger>
              <PopoverContent side="right">
                <PopoverHeader>
                  <PopoverTitle>Right edge</PopoverTitle>
                  <PopoverDescription>No room on the right of the trigger.</PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </Case>
        </div>

        <CaseRow>
          <Case name="popover-keyboard-trigger">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Keyboard popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Opened by keyboard</PopoverTitle>
                  <PopoverDescription>
                    Enter on the trigger opens it; Escape closes it and restores focus.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="tooltip sides">
        <CaseRow>
          {SIDES.map((side) => (
            <Case key={side} name={`tooltip-side-${side}-target`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip {side}</Button>
                </TooltipTrigger>
                <TooltipContent side={side}>Tooltip on the {side}</TooltipContent>
              </Tooltip>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="tooltip text and keyboard">
        <CaseRow>
          <Case name="tooltip-long-target">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Long tooltip</Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                A tooltip long enough to reach its maximum width and wrap onto several lines, which
                is the only state that shows what the content box does.
              </TooltipContent>
            </Tooltip>
          </Case>

          <Case name="tooltip-focus-target">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Focus me</Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Opened by keyboard focus</TooltipContent>
            </Tooltip>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="hover card">
        <div className={[stylex.props(galleryStyles.case2).className, 'w-explicit'].join(' ')}>
          <Case name="hover-card-side-right-trigger">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="link">Hover card right</Button>
              </HoverCardTrigger>
              <HoverCardContent side="right">
                A hover card anchored to the right of its trigger.
              </HoverCardContent>
            </HoverCard>
          </Case>

          <Case name="hover-card-rich-trigger">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="link">Hover card content</Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div {...stylex.props(galleryStyles.case3)}>
                  <p {...stylex.props(galleryStyles.case4)}>Alpha Platform</p>
                  <p {...stylex.props(galleryStyles.case5)}>
                    Twelve detected skills across two tools, last scanned an hour ago.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </Case>

          <Case name="hover-card-collision-end-trigger">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="link">Edge hover card</Button>
              </HoverCardTrigger>
              <HoverCardContent side="right">
                A hover card with no room on the right of its trigger.
              </HoverCardContent>
            </HoverCard>
          </Case>
        </div>
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
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1.5rem',
  },
  case2: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1.5rem',
  },
  case3: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.25rem' },
  },
  case4: { fontWeight: 500 },
  case5: { color: colors.mutedForeground },
})
