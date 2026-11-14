import { colors } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { AlertCircleIcon, InboxIcon, RefreshCwIcon, SearchIcon } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { NotFound } from '@/components/ui/not-found'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

/**
 * The states of `progress`, `skeleton`, `spinner`, `empty`, `not-found` and
 * `alert` that the `data-display` section does not reach (PR 08).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`.
 *
 * Two of the cases exist for `animations.spec.ts` rather than for a static
 * shot: `skeleton-pulse-target` and `spinner-frame-target` are captured at
 * three fixed timestamps, because an infinite animation is the one thing a
 * normal screenshot parks on its first frame.
 */
export function FeedbackSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="progress">
        <CaseRow>
          <Case name="progress-66" width={240}>
            <Progress value={66} />
          </Case>
          <Case name="progress-7" width={240}>
            <Progress value={7} />
          </Case>
          <Case name="progress-narrow" width={80}>
            <Progress value={50} />
          </Case>
          <Case name="progress-taller" width={240}>
            <Progress value={50} sx={galleryStyles.case1} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="skeleton and spinner">
        <CaseRow>
          <Case name="skeleton-pulse-target" width={240}>
            <Skeleton sx={galleryStyles.case2} className="w-explicit" />
          </Case>
          <Case name="skeleton-stack" width={240}>
            <div {...stylex.props(galleryStyles.case3)}>
              <Skeleton sx={galleryStyles.case4} className="w-explicit" />
              <Skeleton sx={galleryStyles.case5} className="w-explicit" />
              <Skeleton sx={galleryStyles.case6} className="w-explicit" />
            </div>
          </Case>
          <Case name="skeleton-square">
            <Skeleton sx={galleryStyles.case7} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="spinner-frame-target">
            <Spinner />
          </Case>
          <Case name="spinner-size-6">
            <Spinner sx={galleryStyles.case8} />
          </Case>
          <Case name="spinner-muted">
            <Spinner sx={galleryStyles.case9} />
          </Case>
          <Case name="spinner-in-button">
            <Button variant="outline" size="sm" disabled>
              <Spinner />
              Loading
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="empty and not found">
        <Case name="empty-with-actions" width={480}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No results</EmptyTitle>
              <EmptyDescription>{LONG_TEXT}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div {...stylex.props(galleryStyles.case10)}>
                <Button size="sm">Clear filters</Button>
                <Button size="sm" variant="outline">
                  <RefreshCwIcon data-icon="inline-start" />
                  Retry
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </Case>
        <Case name="empty-media-default-large" width={480}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <InboxIcon
                  className={[stylex.props(galleryStyles.case11).className, 'size-explicit'].join(
                    ' '
                  )}
                />
              </EmptyMedia>
              <EmptyTitle>A title long enough to wrap inside the narrow header box</EmptyTitle>
              <EmptyDescription>
                A description with <a href="#">an inline link</a> in it.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Case>
        <Case name="empty-header-only" width={320}>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No media, no content</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </Case>
        <Case name="not-found-narrow" width={320}>
          <div {...stylex.props(galleryStyles.case12)}>
            <NotFound />
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="alert">
        <Case name="alert-long-text" width={480}>
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>A title long enough to wrap onto a second line in this box</AlertTitle>
            <AlertDescription>{LONG_TEXT}</AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-destructive-no-icon" width={480}>
          <Alert variant="destructive">
            <AlertTitle>No icon, destructive</AlertTitle>
            <AlertDescription>The description keeps the destructive colour.</AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-destructive-action" width={480}>
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Failed to load</AlertTitle>
            <AlertDescription>{LONG_TEXT}</AlertDescription>
            <AlertAction>
              <Button size="sm" variant="outline">
                Retry
              </Button>
            </AlertAction>
          </Alert>
        </Case>
        <Case name="alert-paragraphs" width={480}>
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>Two paragraphs</AlertTitle>
            <AlertDescription>
              <p>The first paragraph carries a bottom margin.</p>
              <p>
                The last one does not, and <a href="#">a link</a> is underlined.
              </p>
            </AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-description-only" width={480}>
          <Alert>
            <AlertCircleIcon />
            <AlertDescription>A description with no title above it.</AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-narrow" width={240}>
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>Narrow</AlertTitle>
            <AlertDescription>The grid keeps the icon column.</AlertDescription>
          </Alert>
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
  case1: { height: '0.5rem' },
  case2: { height: '1rem', width: '100%' },
  case3: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  case4: { height: '1rem', width: '6rem' },
  case5: { height: '3rem', width: '100%' },
  case6: { height: '3rem', width: '100%' },
  case7: { width: '4rem', height: '4rem' },
  case8: { width: '1.5rem', height: '1.5rem' },
  case9: { color: colors.mutedForeground },
  case10: { display: 'flex', gap: '0.5rem' },
  case11: { width: '2.5rem', height: '2.5rem', color: colors.mutedForeground },
  case12: { height: '20rem' },
})
