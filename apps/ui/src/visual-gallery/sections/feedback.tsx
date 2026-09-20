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
    <div className="space-y-8">
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
            <Progress value={50} className="h-2" />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="skeleton and spinner">
        <CaseRow>
          <Case name="skeleton-pulse-target" width={240}>
            <Skeleton className="h-4 w-full" />
          </Case>
          <Case name="skeleton-stack" width={240}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </Case>
          <Case name="skeleton-square">
            <Skeleton className="size-16" />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="spinner-frame-target">
            <Spinner />
          </Case>
          <Case name="spinner-size-6">
            <Spinner className="size-6" />
          </Case>
          <Case name="spinner-muted">
            <Spinner className="text-muted-foreground" />
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
              <div className="flex gap-2">
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
                <InboxIcon className="size-10 text-muted-foreground" />
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
          <div className="h-80">
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
