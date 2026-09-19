import {
  Blockquote,
  Code,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Large,
  Lead,
  Muted,
  P,
  Small,
} from '@/components/typography'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

export function TypographySection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="headings">
        <CaseRow>
          <Case name="typography-h1">
            <H1>Heading level one</H1>
          </Case>
          <Case name="typography-h2">
            <H2>Heading level two</H2>
          </Case>
          <Case name="typography-h3">
            <H3>Heading level three</H3>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="typography-h4">
            <H4>Heading level four</H4>
          </Case>
          <Case name="typography-h5">
            <H5>Heading level five</H5>
          </Case>
          <Case name="typography-h6">
            <H6>Heading level six</H6>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="text">
        <Case name="typography-p" width={480}>
          <P>The quick brown fox jumps over the lazy dog. {LONG_TEXT}</P>
        </Case>
        <Case name="typography-p-stacked" width={480}>
          <div>
            <P>First paragraph, which carries no top margin.</P>
            <P>Second paragraph, which does carry a top margin.</P>
          </div>
        </Case>
        <CaseRow>
          <Case name="typography-lead" width={360}>
            <Lead>A lead paragraph introduces the page.</Lead>
          </Case>
          <Case name="typography-large">
            <Large>Large text</Large>
          </Case>
          <Case name="typography-small">
            <Small>Small text</Small>
          </Case>
          <Case name="typography-muted">
            <Muted>Muted text</Muted>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="blockquote and code">
        <Case name="typography-blockquote" width={480}>
          <Blockquote>
            Preserve existing CSS values exactly, including oklch values, radii and easing.
          </Blockquote>
        </Case>
        <CaseRow>
          <Case name="typography-code-inline">
            <Code>pnpm visual</Code>
          </Case>
        </CaseRow>
        <Case name="typography-code-block" width={480}>
          <Code variant="block">{'pnpm visual\npnpm visual:report\n'}</Code>
        </Case>
      </CaseGroup>

      <CaseGroup title="caller overrides">
        <CaseRow>
          <Case name="typography-h1-override">
            <H1 className="text-base font-normal text-muted-foreground">
              H1 with a className override
            </H1>
          </Case>
          <Case name="typography-muted-override">
            <Muted className="text-foreground">Muted with a className override</Muted>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="wrapping">
        <Case name="typography-h1-wrapping" width={280}>
          <H1>A heading long enough to wrap onto several lines</H1>
        </Case>
        <Case name="typography-p-narrow" width={200}>
          <P>{LONG_TEXT}</P>
        </Case>
      </CaseGroup>
    </div>
  )
}
