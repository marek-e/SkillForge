import { colors, fonts, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { AlertCircleIcon, CheckIcon, FolderOpenIcon, InboxIcon, UserIcon } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { NotFound } from '@/components/ui/not-found'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
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

const AVATAR_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNGY0NmU1Ii8+PC9zdmc+'

export function DataDisplaySection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="card">
        <CaseRow>
          <Case name="card-default" width={320}>
            <Card>
              <CardHeader>
                <CardTitle>Claude Code</CardTitle>
                <CardDescription>/Users/fixture/.claude</CardDescription>
                <CardAction>
                  <Badge>Ready</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>Four skills and three commands detected.</CardContent>
            </Card>
          </Case>
          <Case name="card-sm" width={320}>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Compact card</CardTitle>
                <CardDescription>Smaller paddings and gaps.</CardDescription>
              </CardHeader>
              <CardContent>Content</CardContent>
            </Card>
          </Case>
          <Case name="card-with-footer" width={320}>
            <Card>
              <CardHeader>
                <CardTitle>With footer</CardTitle>
              </CardHeader>
              <CardContent>Body copy.</CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </Case>
          <Case name="card-long-content" width={320}>
            <Card>
              <CardHeader>
                <CardTitle>A card title long enough to wrap over two lines</CardTitle>
                <CardDescription>{LONG_TEXT}</CardDescription>
              </CardHeader>
              <CardContent>{LONG_TEXT}</CardContent>
            </Card>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="table">
        <Case name="table-default" width={640}>
          <Table>
            <TableCaption>Projects detected on this machine.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 40 }} />
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Tools</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell />
                <TableCell>Alpha Platform</TableCell>
                <TableCell sx={galleryStyles.case1}>/Users/fixture/projects/alpha</TableCell>
                <TableCell>
                  <Badge variant="secondary">Claude Code</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell />
                <TableCell>Beta Service</TableCell>
                <TableCell sx={galleryStyles.case2}>/Users/fixture/projects/beta</TableCell>
                <TableCell>
                  <Badge variant="secondary">Codex</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>2 projects</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Case>
        <Case name="table-empty" width={640}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
        </Case>
      </CaseGroup>

      <CaseGroup title="separator and aspect ratio">
        <CaseRow>
          <Case name="separator-horizontal" width={240}>
            <Separator />
          </Case>
          <Case name="separator-vertical">
            <div {...stylex.props(galleryStyles.case3)}>
              <span {...stylex.props(galleryStyles.case4)}>A</span>
              <Separator orientation="vertical" sx={galleryStyles.case5} />
              <span {...stylex.props(galleryStyles.case6)}>B</span>
            </div>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="aspect-ratio-16-9" width={240}>
            <AspectRatio ratio={16 / 9}>
              <div {...stylex.props(galleryStyles.case7)} />
            </AspectRatio>
          </Case>
          <Case name="aspect-ratio-1-1" width={160}>
            <AspectRatio ratio={1}>
              <div {...stylex.props(galleryStyles.case8)} />
            </AspectRatio>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="avatar">
        <CaseRow>
          <Case name="avatar-image">
            <Avatar>
              <AvatarImage src={AVATAR_IMAGE} alt="Alpha" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="avatar-fallback">
            <Avatar>
              <AvatarFallback>SF</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="avatar-xs">
            <Avatar size="xs">
              <AvatarFallback>X</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="avatar-sm">
            <Avatar size="sm">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="avatar-lg">
            <Avatar size="lg">
              <AvatarFallback>L</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="avatar-badge">
            <Avatar>
              <AvatarFallback>B</AvatarFallback>
              <AvatarBadge>
                <CheckIcon />
              </AvatarBadge>
            </Avatar>
          </Case>
          <Case name="avatar-group">
            <AvatarGroup>
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="breadcrumb">
        <Case name="breadcrumb-default" width={480}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Alpha Platform</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
        <Case name="breadcrumb-ellipsis" width={480}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Deeply nested page</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
      </CaseGroup>

      <CaseGroup title="pagination">
        <Case name="pagination-default" width={480}>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Case>
      </CaseGroup>

      <CaseGroup title="progress, skeleton, spinner">
        <CaseRow>
          <Case name="progress-0" width={240}>
            <Progress value={0} />
          </Case>
          <Case name="progress-33" width={240}>
            <Progress value={33} />
          </Case>
          <Case name="progress-100" width={240}>
            <Progress value={100} />
          </Case>
          <Case name="progress-undefined" width={240}>
            <Progress />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="skeleton-line" width={240}>
            <Skeleton sx={galleryStyles.case9} className="w-explicit" />
          </Case>
          <Case name="skeleton-block" width={240}>
            <Skeleton sx={galleryStyles.case10} className="w-explicit" />
          </Case>
          <Case name="skeleton-circle">
            <Skeleton sx={galleryStyles.case11} />
          </Case>
          <Case name="spinner-default">
            <Spinner />
          </Case>
          <Case name="spinner-large">
            <Spinner sx={galleryStyles.case12} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="empty and not found">
        <Case name="empty-default" width={480}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <FolderOpenIcon
                  className={[stylex.props(galleryStyles.case13).className, 'size-explicit'].join(
                    ' '
                  )}
                />
              </EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>
                Add a project directory to see which AI tools are configured.
              </EmptyDescription>
            </EmptyHeader>
            <Button>Add project</Button>
          </Empty>
        </Case>
        <Case name="empty-icon-media" width={480}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>Nothing here</EmptyTitle>
              <EmptyDescription>The icon media variant.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm">
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        </Case>
        <Case name="not-found" width={640}>
          <div {...stylex.props(galleryStyles.case14)}>
            <NotFound />
          </div>
        </Case>
      </CaseGroup>

      <CaseGroup title="alert">
        <Case name="alert-default" width={480}>
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>The runtime is running on port 4321.</AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-destructive" width={480}>
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Failed to load projects</AlertTitle>
            <AlertDescription>Fixture runtime is unavailable.</AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-no-icon" width={480}>
          <Alert>
            <AlertTitle>No icon</AlertTitle>
            <AlertDescription>An alert rendered without a leading icon.</AlertDescription>
          </Alert>
        </Case>
        <Case name="alert-with-action" width={480}>
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>With action</AlertTitle>
            <AlertDescription>{LONG_TEXT}</AlertDescription>
            <AlertAction>
              <Button size="xs" variant="outline">
                Retry
              </Button>
            </AlertAction>
          </Alert>
        </Case>
        <Case name="alert-title-only" width={480}>
          <Alert>
            <UserIcon />
            <AlertTitle>Title only</AlertTitle>
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
  case1: { fontFamily: fonts.mono, fontSize: '0.75rem', lineHeight: typography.xsLineHeight },
  case2: { fontFamily: fonts.mono, fontSize: '0.75rem', lineHeight: typography.xsLineHeight },
  case3: { display: 'flex', height: '2.5rem', alignItems: 'center' },
  case4: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case5: { marginInline: '0.5rem' },
  case6: { fontSize: '0.875rem', lineHeight: typography.smLineHeight },
  case7: { width: '100%', height: '100%', borderRadius: radius.lg, backgroundColor: colors.muted },
  case8: { width: '100%', height: '100%', borderRadius: radius.lg, backgroundColor: colors.muted },
  case9: { height: '1rem', width: '100%' },
  case10: { height: '6rem', width: '100%', borderRadius: radius.xl },
  case11: { width: '2.5rem', height: '2.5rem', borderRadius: 'calc(infinity * 1px)' },
  case12: { width: '2rem', height: '2rem' },
  case13: { width: '2.5rem', height: '2.5rem', color: colors.mutedForeground },
  case14: { height: '20rem' },
})
