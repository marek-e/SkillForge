import { WrenchIcon } from 'lucide-react'
import { Blockquote, Code, H1, H2, H3, Large, Lead, Muted, P, Small } from '@/components/typography'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

/**
 * Typography states the original `typography` section does not mount (PR 03).
 *
 * A sibling section rather than extra cases in `typography`, because
 * `gallery.spec.ts` also takes one **full-page** screenshot per section: adding
 * a case to an existing section changes that section's page height and would
 * require refreshing a frozen original, which the migration never does. A new
 * section only ever creates new originals.
 *
 * What it covers, all captured while the components were still Tailwind:
 *
 * - the flow rules that only appear between siblings — `P`'s
 *   `[&:not(:first-child)]:mt-6`, `H2`'s `first:mt-0`, `Blockquote`'s `mt-6`;
 * - inline `Code` inside a real line box (padding on an inline box changes the
 *   line box, which a standalone case cannot show) versus the `pre` variant,
 *   including a line long enough to exercise `overflow-x-auto`;
 * - wrapping for every text component at a narrow width, on top of the two
 *   viewport projects;
 * - caller `className` overrides of the kinds the app actually uses, including
 *   `H2 className="flex items-center gap-2"` from `routes/home.tsx` and
 *   overrides that `twMerge` resolves today by dropping a base class
 *   (`p-2`/`rounded-sm` over the block code variant's `p-4`/`rounded-lg`).
 */
export function TypographyExtraSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="flow between siblings">
        <Case name="typography-h2-in-flow" width={480}>
          <div>
            <H2>First section, a first child</H2>
            <P>Body copy directly under the first heading.</P>
            <H2>Second section, not a first child</H2>
            <P>Body copy directly under the second heading.</P>
          </div>
        </Case>
        <Case name="typography-p-triple" width={480}>
          <div>
            <P>First paragraph.</P>
            <P>Second paragraph.</P>
            <P>Third paragraph.</P>
          </div>
        </Case>
        <Case name="typography-p-only-child" width={480}>
          <div>
            <P>The only paragraph, so the first-child rule keeps it flush.</P>
          </div>
        </Case>
        <Case name="typography-blockquote-after-p" width={480}>
          <div>
            <P>A paragraph introducing the quotation below.</P>
            <Blockquote>Preserve existing CSS values exactly.</Blockquote>
            <P>A paragraph following the quotation.</P>
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="code in flow">
        <Case name="typography-code-in-paragraph" width={480}>
          <P>
            Run <Code>pnpm visual</Code> before committing, then read <Code>visual/results</Code>{' '}
            when a comparison fails.
          </P>
        </Case>
        <Case name="typography-code-block-overflow" width={320}>
          <Code variant="block">
            {'pnpm --filter @skillforge/ui visual:check-originals --with-a-very-long-flag\n'}
          </Code>
        </Case>
      </CaseGroup>

      <CaseGroup title="wrapping">
        <Case name="typography-h2-wrapping" width={280}>
          <H2>A level two heading long enough to wrap onto several lines</H2>
        </Case>
        <Case name="typography-h3-wrapping" width={280}>
          <H3>A level three heading long enough to wrap onto several lines</H3>
        </Case>
        <Case name="typography-lead-narrow" width={200}>
          <Lead>{LONG_TEXT}</Lead>
        </Case>
        <Case name="typography-blockquote-narrow" width={200}>
          <Blockquote>{LONG_TEXT}</Blockquote>
        </Case>
        <CaseRow>
          <Case name="typography-large-narrow" width={160}>
            <Large>Large text that wraps</Large>
          </Case>
          <Case name="typography-small-narrow" width={160}>
            <Small>Small text that wraps onto three lines</Small>
          </Case>
          <Case name="typography-muted-narrow" width={160}>
            <Muted>Muted text that wraps onto three lines</Muted>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="caller overrides">
        <Case name="typography-h2-flex-override" width={480}>
          <H2 className="flex items-center gap-2">
            <WrenchIcon /> Connected Tools
          </H2>
        </Case>
        <CaseRow>
          <Case name="typography-h1-size-override">
            <H1 className="text-lg">H1 at the large size</H1>
          </Case>
          <Case name="typography-p-override" width={320}>
            <P className="text-sm text-muted-foreground">A paragraph with a smaller, muted size.</P>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="typography-code-override">
            <Code className="bg-primary text-primary-foreground">override</Code>
          </Case>
          <Case name="typography-blockquote-override" width={320}>
            <Blockquote className="border-l-4 pl-4 not-italic">
              A quotation with a wider rule and upright text.
            </Blockquote>
          </Case>
        </CaseRow>
        <Case name="typography-code-block-override" width={320}>
          <Code variant="block" className="p-2 rounded-sm">
            {'pnpm visual\n'}
          </Code>
        </Case>
      </CaseGroup>
    </div>
  )
}
