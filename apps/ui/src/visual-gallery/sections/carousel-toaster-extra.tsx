import { colors, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { toast } from '@/components/ui/toaster'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Carousel positions and toaster states (PR 19).
 *
 * A sibling section of `disclosure` (which owns the two original carousel
 * cases) and of `overlays` (which owns the single toaster trigger), because
 * `gallery.spec.ts` also captures one full-page screenshot per section and
 * those originals are frozen — see `docs/stylex-migration/conventions.md`.
 *
 * The carousel cases exist for what an element shot of the default state
 * cannot show: the gutter between two visible slides (`-ml-4`/`pl-4`
 * horizontally, `-mt-4`/`pt-4` vertically, which are the only per-orientation
 * declarations the component has), a carousel whose controls are both disabled,
 * and the two controls at the positions their `-left-12`/`-right-12` and
 * `-top-12`/`-bottom-12` offsets put them. The middle and last slide positions
 * are driven by `gallery.spec.ts`, which clicks Next and waits for Embla to
 * settle.
 *
 * The toaster cases are triggers: the toast itself is rendered by the globally
 * mounted `<Toaster />` into a fixed viewport of its own, so `overlays.spec.ts`
 * captures it full page after clicking one of these buttons.
 */

/**
 * Sileo dismisses a toast after `duration` ms and, on the way, expands it from
 * a pill to the full body after `autopilot.expand` and collapses it back after
 * `autopilot.collapse`. All three are wall-clock timers that a screenshot would
 * race, and `page.clock` does not fake them (the visual suite keeps timers
 * running on purpose, because TanStack Query, Radix and vaul depend on them).
 *
 * Every case therefore pins the timeline instead of disabling it: a ten-minute
 * duration puts the dismissal and the collapse far beyond any run, and the
 * expansion is either immediate or equally far away. `autopilot: false` would
 * not work — Sileo ignores autopilot entirely when there is no duration, so the
 * toast would stay a pill forever and the description would never render.
 */
const HOLD_MS = 600_000

/** Expands as soon as it enters, then stays open. */
const EXPANDED = {
  duration: HOLD_MS,
  autopilot: { expand: 0, collapse: HOLD_MS },
} as const

/** Stays collapsed: the pill state a toast shows for its first 150ms. */
const PILL = {
  duration: HOLD_MS,
  autopilot: { expand: HOLD_MS, collapse: HOLD_MS },
} as const

function Slide({ index }: { index: number }) {
  return <div {...stylex.props(galleryStyles.case0)}>Slide {index}</div>
}

export function CarouselToasterExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case1)}>
      <CaseGroup title="carousel horizontal">
        <CaseRow>
          <Case name="cartoast-carousel-steps" width={420}>
            <div {...stylex.props(galleryStyles.case2)}>
              <Carousel>
                <CarouselContent>
                  {[1, 2, 3].map((index) => (
                    <CarouselItem key={index}>
                      <Slide index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Case>
        </CaseRow>
        <CaseRow>
          {/* Two slides visible at once, which is the only way the 1rem
              gutter the content's `-ml-4` and the item's `pl-4` compose is
              on screen. */}
          <Case name="cartoast-carousel-half" width={420}>
            <div {...stylex.props(galleryStyles.case3)}>
              <Carousel>
                <CarouselContent>
                  {[1, 2, 3, 4].map((index) => (
                    <CarouselItem key={index} sx={galleryStyles.case4}>
                      <Slide index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Case>
        </CaseRow>
        <CaseRow>
          {/* One slide: Embla can scroll neither way, so both controls are
              disabled from the start. */}
          <Case name="cartoast-carousel-single" width={420}>
            <div {...stylex.props(galleryStyles.case5)}>
              <Carousel>
                <CarouselContent>
                  <CarouselItem>
                    <Slide index={1} />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="cartoast-carousel-focus-target" width={420}>
            <div {...stylex.props(galleryStyles.case6)}>
              <Carousel>
                <CarouselContent>
                  {[1, 2, 3].map((index) => (
                    <CarouselItem key={index}>
                      <Slide index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="carousel vertical">
        <CaseRow>
          <Case name="cartoast-carousel-vertical-steps" width={240}>
            <div {...stylex.props(galleryStyles.case7)}>
              <Carousel orientation="vertical">
                <CarouselContent sx={galleryStyles.case8}>
                  {[1, 2, 3].map((index) => (
                    <CarouselItem key={index}>
                      <Slide index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Case>
          {/* The vertical counterpart of `cartoast-carousel-half`: two items in
              view, so the `-mt-4`/`pt-4` gutter is visible. */}
          <Case name="cartoast-carousel-vertical-half" width={240}>
            <div {...stylex.props(galleryStyles.case9)}>
              <Carousel orientation="vertical">
                <CarouselContent sx={galleryStyles.case10}>
                  {[1, 2, 3, 4].map((index) => (
                    <CarouselItem key={index} sx={galleryStyles.case11}>
                      <Slide index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="toaster">
        <CaseRow>
          <Case name="cartoast-toast-single-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.success({
                  ...EXPANDED,
                  title: 'Skill saved',
                  description: 'skill-alpha was written to the library.',
                })
              }
            >
              One toast
            </Button>
          </Case>
          {/* Sileo shows one toast at a time: three in a row morph the same
              element through its header stack and settle on the last. */}
          <Case name="cartoast-toast-stack-trigger">
            <Button
              variant="outline"
              onClick={() => {
                toast.success({ ...EXPANDED, title: 'First', description: 'skill-alpha' })
                toast.info({ ...EXPANDED, title: 'Second', description: 'skill-beta' })
                toast.error({ ...EXPANDED, title: 'Third', description: 'skill-gamma' })
              }}
            >
              Three toasts
            </Button>
          </Case>
          <Case name="cartoast-toast-pill-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.success({
                  ...PILL,
                  title: 'Skill saved',
                  description: 'skill-alpha was written to the library.',
                })
              }
            >
              Collapsed pill
            </Button>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="cartoast-toast-success-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.success({ ...EXPANDED, title: 'Success', description: 'skill-alpha' })
              }
            >
              Success
            </Button>
          </Case>
          <Case name="cartoast-toast-error-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.error({ ...EXPANDED, title: 'Error', description: 'skill-alpha' })
              }
            >
              Error
            </Button>
          </Case>
          <Case name="cartoast-toast-warning-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.warning({ ...EXPANDED, title: 'Warning', description: 'skill-alpha' })
              }
            >
              Warning
            </Button>
          </Case>
          <Case name="cartoast-toast-info-trigger">
            <Button
              variant="outline"
              onClick={() => toast.info({ ...EXPANDED, title: 'Info', description: 'skill-alpha' })}
            >
              Info
            </Button>
          </Case>
          <Case name="cartoast-toast-action-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.action({ ...EXPANDED, title: 'Action', description: 'skill-alpha' })
              }
            >
              Action
            </Button>
          </Case>
        </CaseRow>
        <CaseRow>
          {/* The action button is the only focusable control inside a toast,
              and the only way to dismiss one: Sileo renders no close control
              and a click on the toast body does nothing. */}
          <Case name="cartoast-toast-button-trigger">
            <Button
              variant="outline"
              onClick={() => {
                const id = toast.success({
                  ...EXPANDED,
                  title: 'Skill deleted',
                  description: 'skill-alpha was removed.',
                  button: { title: 'Undo', onClick: () => toast.dismiss(id) },
                })
              }}
            >
              With button
            </Button>
          </Case>
          {/*
            A per-toast `position` overrides the `top-right` the app's
            `<Toaster />` sets for every other case.

            Collapsed on purpose. A bottom-anchored toast grows upwards from the
            viewport edge, so its top edge is wherever the spring that sizes the
            body has got to; under load that settled a pixel or two apart from
            run to run, while the 40px pill is a fixed height and lands on the
            same row every time. The expanded body is pinned by the eight
            top-right cases; this one exists for the placement.
          */}
          <Case name="cartoast-toast-placement-trigger">
            <Button
              variant="outline"
              onClick={() =>
                toast.info({
                  ...PILL,
                  position: 'bottom-center',
                  title: 'Bottom centre',
                  description: 'skill-alpha',
                })
              }
            >
              Bottom centre
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    display: 'flex',
    height: '7rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case1: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case2: { paddingInline: '3.5rem' },
  case3: { paddingInline: '3.5rem' },
  case4: { flexBasis: '50%' },
  case5: { paddingInline: '3.5rem' },
  case6: { paddingInline: '3.5rem' },
  case7: { paddingBlock: '3.5rem' },
  case8: { height: '7rem' },
  case9: { paddingBlock: '3.5rem' },
  case10: { height: '14rem' },
  case11: { flexBasis: '50%' },
})
