import { colors, fonts, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

/**
 * The states of `card`, `table`, `separator` and `aspect-ratio` that the
 * `data-display` section does not reach (PR 07).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`.
 *
 * What is pinned here is everything written by a *selector* rather than by a
 * plain declaration: the card's `:has()` paddings and its first/last-child
 * image radii, the header's `.border-b` padding and its action/description
 * grid tracks, the row borders a table's head, body and footer reach into, the
 * checkbox column's padding reset, and the two orientations of a separator
 * inside a flex row.
 */

/** A 320×120 rectangle. Inline, so a case never waits on the network. */
const BANNER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMzIwIDEyMCI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiM0ZjQ2ZTUiLz48L3N2Zz4='

/** A 160×160 square with a circle, so a cropped aspect ratio is visible. */
const SQUARE_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgMTYwIDE2MCI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiMwZjc2NmUiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjgwIiByPSI0OCIgZmlsbD0iIzk5ZjZlNCIvPjwvc3ZnPg=='

export function DataDisplayExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="card headers, actions and images">
        <CaseRow>
          <Case name="card-header-border" width={320}>
            <Card>
              <CardHeader sx={galleryStyles.case1} className="border-b">
                <CardTitle>Bordered header</CardTitle>
                <CardDescription>The header pads itself differently.</CardDescription>
              </CardHeader>
              <CardContent>Body copy under a separated header.</CardContent>
            </Card>
          </Case>
          <Case name="card-sm-header-border" width={320}>
            <Card size="sm">
              <CardHeader sx={galleryStyles.case2} className="border-b">
                <CardTitle>Bordered header, compact</CardTitle>
                <CardDescription>Three rather than four.</CardDescription>
              </CardHeader>
              <CardContent>Body copy.</CardContent>
            </Card>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="card-action-long-title" width={320}>
            <Card>
              <CardHeader>
                <CardTitle>An action next to a title long enough to wrap</CardTitle>
                <CardDescription>{LONG_TEXT}</CardDescription>
                <CardAction>
                  <Badge variant="secondary">Ready</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>Content below a two-column header.</CardContent>
            </Card>
          </Case>
          <Case name="card-action-no-description" width={320}>
            <Card>
              <CardHeader>
                <CardTitle>Action, no description</CardTitle>
                <CardAction>
                  <Button size="xs" variant="outline">
                    Open
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>One header row instead of two.</CardContent>
            </Card>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="card-image-first" width={320}>
            <Card>
              <img src={BANNER_IMAGE} alt="" />
              <CardHeader>
                <CardTitle>Image first</CardTitle>
                <CardDescription>The top padding collapses.</CardDescription>
              </CardHeader>
              <CardContent>Body copy.</CardContent>
            </Card>
          </Case>
          <Case name="card-image-last" width={320}>
            <Card>
              <CardHeader>
                <CardTitle>Image last</CardTitle>
              </CardHeader>
              <img src={BANNER_IMAGE} alt="" />
            </Card>
          </Case>
          <Case name="card-sm-image-footer" width={320}>
            <Card size="sm">
              <img src={BANNER_IMAGE} alt="" />
              <CardHeader>
                <CardTitle>Compact, image and footer</CardTitle>
              </CardHeader>
              <CardContent>Body copy.</CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="card-sm-long-content" width={320}>
            <Card size="sm">
              <CardHeader>
                <CardTitle>A compact card title long enough to wrap over two lines</CardTitle>
                <CardDescription>{LONG_TEXT}</CardDescription>
                <CardAction>
                  <Badge>New</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>{LONG_TEXT}</CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Dismiss
                </Button>
              </CardFooter>
            </Card>
          </Case>
          <Case name="card-hover-target" width={320}>
            {/*
              `SkillCard`'s hover ring, without its `transition-shadow`: a
              150 ms box-shadow transition is what a hover screenshot would
              race against, and the point of the case is the composed ring.
            */}
            <Card size="sm" sx={galleryStyles.case3}>
              <CardHeader>
                <CardTitle>Hover target</CardTitle>
                <CardDescription>A caller-supplied hover ring.</CardDescription>
              </CardHeader>
            </Card>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="table rows, columns and captions">
        <Case name="table-selected-rows" width={640}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-state="selected">
                <TableCell>Alpha Platform</TableCell>
                <TableCell>/Users/fixture/projects/alpha</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Beta Service</TableCell>
                <TableCell>/Users/fixture/projects/beta</TableCell>
              </TableRow>
              <TableRow data-state="selected">
                <TableCell>Gamma Tooling</TableCell>
                <TableCell>/Users/fixture/projects/gamma</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Case>
        <Case name="table-row-hover-target" width={640}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>A row that is hovered</TableCell>
              </TableRow>
              <TableRow data-state="selected">
                <TableCell>A selected row that is hovered</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Case>
        <Case name="table-checkbox-column" width={640}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tools</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Checkbox checked />
                </TableCell>
                <TableCell>Alpha Platform</TableCell>
                <TableCell>
                  <Badge variant="secondary">Claude Code</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>Beta Service</TableCell>
                <TableCell>
                  <Badge variant="secondary">Codex</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Case>
        <Case name="table-column-widths" width={480}>
          <Table>
            <TableCaption>Widths come from the caller, as inline styles.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 40 }} />
                <TableHead style={{ width: 160 }}>Name</TableHead>
                <TableHead>Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Alpha Platform</TableCell>
                <TableCell>
                  <span
                    className={[stylex.props(galleryStyles.case4).className, 'w-explicit'].join(
                      ' '
                    )}
                  >
                    /Users/fixture/projects/alpha/packages/runtime/src
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>A project name long enough to be squeezed</TableCell>
                <TableCell>
                  <span
                    className={[stylex.props(galleryStyles.case5).className, 'w-explicit'].join(
                      ' '
                    )}
                  >
                    /Users/fixture/projects/beta
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>2 projects</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Case>
        <Case name="table-overflowing" width={320}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Tools</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Alpha Platform</TableCell>
                <TableCell>/Users/fixture/projects/alpha/packages/runtime</TableCell>
                <TableCell>Claude Code, Codex, Cursor</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Case>
      </CaseGroup>

      <CaseGroup title="separator orientations">
        <Case name="separator-in-flex-row">
          <div {...stylex.props(galleryStyles.case6)}>
            <span {...stylex.props(galleryStyles.case7)}>One</span>
            <Separator orientation="vertical" />
            <span {...stylex.props(galleryStyles.case8)}>Two</span>
            <Separator orientation="vertical" />
            <span {...stylex.props(galleryStyles.case9)}>Three</span>
          </div>
        </Case>
        <Case name="separator-in-flex-column" width={240}>
          <div {...stylex.props(galleryStyles.case10)}>
            <span {...stylex.props(galleryStyles.case11)}>One</span>
            <Separator />
            <span {...stylex.props(galleryStyles.case12)}>Two</span>
            <Separator />
            <span {...stylex.props(galleryStyles.case13)}>Three</span>
          </div>
        </Case>
        <Case name="separator-semantic" width={240}>
          <Separator decorative={false} />
        </Case>
        <Case name="separator-vertical-stretch">
          <div {...stylex.props(galleryStyles.case14)}>
            <span {...stylex.props(galleryStyles.case15)}>Left</span>
            <Separator orientation="vertical" />
            <span {...stylex.props(galleryStyles.case16)}>Right</span>
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="aspect ratios">
        <CaseRow>
          <Case name="aspect-ratio-16-9-image" width={240}>
            <AspectRatio ratio={16 / 9}>
              <img src={SQUARE_IMAGE} alt="" {...stylex.props(galleryStyles.case17)} />
            </AspectRatio>
          </Case>
          <Case name="aspect-ratio-4-3-image" width={240}>
            <AspectRatio ratio={4 / 3}>
              <img src={SQUARE_IMAGE} alt="" {...stylex.props(galleryStyles.case18)} />
            </AspectRatio>
          </Case>
          <Case name="aspect-ratio-1-1-image" width={160}>
            <AspectRatio ratio={1}>
              <img src={SQUARE_IMAGE} alt="" {...stylex.props(galleryStyles.case19)} />
            </AspectRatio>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="aspect-ratio-4-3" width={240}>
            <AspectRatio ratio={4 / 3}>
              <div {...stylex.props(galleryStyles.case20)} />
            </AspectRatio>
          </Case>
          <Case name="aspect-ratio-in-card" width={320}>
            <Card size="sm">
              <CardContent>
                <AspectRatio ratio={16 / 9}>
                  <img src={SQUARE_IMAGE} alt="" {...stylex.props(galleryStyles.case21)} />
                </AspectRatio>
              </CardContent>
            </Card>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case1: { borderBottomWidth: '1px', borderBottomStyle: 'solid' },
  case2: { borderBottomWidth: '1px', borderBottomStyle: 'solid' },
  case3: {
    cursor: 'pointer',
    boxShadow: {
      default:
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 0 #0000',
      '@media (hover: hover)': {
        default: null,
        ':hover':
          '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 20%, transparent), 0 0 #0000',
      },
    },
  },
  case4: {
    color: colors.mutedForeground,
    fontFamily: fonts.mono,
    fontSize: '0.75rem',
    lineHeight: typography.xsLineHeight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
    display: 'block',
  },
  case5: {
    color: colors.mutedForeground,
    fontFamily: fonts.mono,
    fontSize: '0.75rem',
    lineHeight: typography.xsLineHeight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
    display: 'block',
  },
  case6: { display: 'flex', height: '2.5rem', alignItems: 'center', gap: '0.5rem' },
  case7: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case8: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case9: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case10: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  case11: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case12: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case13: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case14: { display: 'flex', height: '4rem', alignItems: 'stretch', gap: '0.5rem' },
  case15: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case16: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case17: { width: '100%', height: '100%', borderRadius: radius.lg, objectFit: 'cover' },
  case18: { width: '100%', height: '100%', borderRadius: radius.lg, objectFit: 'cover' },
  case19: { width: '100%', height: '100%', borderRadius: radius.lg, objectFit: 'cover' },
  case20: { width: '100%', height: '100%', borderRadius: radius.lg, backgroundColor: colors.muted },
  case21: { width: '100%', height: '100%', borderRadius: radius.lg, objectFit: 'cover' },
})
