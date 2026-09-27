import { CheckIcon, SlashIcon, UserIcon, UsersIcon } from 'lucide-react'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Avatar, breadcrumb and pagination states the `data-display` section does not
 * reach (PR 18). Every case name carries the `navbits` token so `-g nav-?bits`
 * selects this section and its interaction block and nothing else.
 *
 * The image is an inline SVG data URI — a flat rectangle, no network, no
 * decoding variance — so the `after:` overlay that every `Avatar` paints over
 * its content is compared against a constant.
 */
const AVATAR_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNGY0NmU1Ii8+PC9zdmc+'

export function NavBitsExtraSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="avatar images and sizes">
        <CaseRow>
          <Case name="navbits-avatar-image-lg">
            <Avatar size="lg">
              <AvatarImage src={AVATAR_IMAGE} alt="Large" />
              <AvatarFallback>L</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="navbits-avatar-image-sm">
            <Avatar size="sm">
              <AvatarImage src={AVATAR_IMAGE} alt="Small" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="navbits-avatar-image-xs">
            <Avatar size="xs">
              <AvatarImage src={AVATAR_IMAGE} alt="Extra small" />
              <AvatarFallback>X</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="navbits-avatar-fallback-icon">
            <Avatar>
              <AvatarFallback>
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="avatar badge per size">
        <CaseRow>
          {/* `group-data-[size=sm]/avatar:[&>svg]:hidden` — the tick is not rendered at `sm`. */}
          <Case name="navbits-avatar-badge-sm">
            <Avatar size="sm">
              <AvatarFallback>S</AvatarFallback>
              <AvatarBadge>
                <CheckIcon />
              </AvatarBadge>
            </Avatar>
          </Case>
          <Case name="navbits-avatar-badge-lg">
            <Avatar size="lg">
              <AvatarFallback>L</AvatarFallback>
              <AvatarBadge>
                <CheckIcon />
              </AvatarBadge>
            </Avatar>
          </Case>
          {/* No `group-data-[size=xs]/avatar:` rule exists for the badge, so it
              is sized by its content alone. Pinned as found, not fixed. */}
          <Case name="navbits-avatar-badge-xs">
            <Avatar size="xs">
              <AvatarFallback>X</AvatarFallback>
              <AvatarBadge>
                <CheckIcon />
              </AvatarBadge>
            </Avatar>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="avatar group and caller overrides">
        <CaseRow>
          <Case name="navbits-avatar-group-sm">
            <AvatarGroup>
              <Avatar size="sm">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar size="sm">
                <AvatarImage src={AVATAR_IMAGE} alt="B" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>
                <UsersIcon />
              </AvatarGroupCount>
            </AvatarGroup>
          </Case>
          <Case name="navbits-avatar-group-lg">
            <AvatarGroup>
              <Avatar size="lg">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>
                <UsersIcon />
              </AvatarGroupCount>
            </AvatarGroup>
          </Case>
          {/* The two shapes `project-avatar.tsx` passes: a caller utility that
              contests the component's own radius and `::after` border. */}
          <Case name="navbits-avatar-rounded-override">
            <Avatar size="lg" className="rounded-lg after:rounded-lg">
              <AvatarImage src={AVATAR_IMAGE} alt="Rounded" className="rounded-lg" />
              <AvatarFallback className="rounded-lg">R</AvatarFallback>
            </Avatar>
          </Case>
          <Case name="navbits-avatar-squared-override">
            <Avatar size="lg" className="rounded-none after:border-0 after:rounded-none">
              <AvatarImage src={AVATAR_IMAGE} alt="Squared" className="rounded-none" />
              <AvatarFallback className="rounded-none">Q</AvatarFallback>
            </Avatar>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="breadcrumb">
        <Case name="navbits-breadcrumb-short" width={480}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
        <Case name="navbits-breadcrumb-ellipsis-link" width={480}>
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
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Alpha</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
        {/* A separator with children of its own: the default chevron is not
            rendered, and `[&>svg]:size-3.5` sizes whatever the caller passes. */}
        <Case name="navbits-breadcrumb-custom-separator" width={480}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Library</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>·</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Skill</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
        {/* `flex-wrap` plus `wrap-break-word`: a label with no break opportunity
            is broken inside the word rather than overflowing the 240px box. */}
        <Case name="navbits-breadcrumb-overflow" width={240}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Workspaces</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Organisation settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Supercalifragilisticexpialidocious</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
        {/* The shape `lib/breadcrumbs.tsx` renders: an `asChild` link wrapping
            its own flex row, and items hidden below the `md` breakpoint. */}
        <Case name="navbits-breadcrumb-aschild" width={480}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <a href="#" className="flex items-center gap-2">
                    <UserIcon className="size-4" /> Home
                  </a>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <UsersIcon className="size-4" /> Team
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Case>
        <CaseRow>
          <Case name="navbits-breadcrumb-hover-target">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Hover me</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Case>
          <Case name="navbits-breadcrumb-focus-target">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Focus me</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="pagination">
        <Case name="navbits-pagination-full" width={480}>
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
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">9</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Case>
        {/* There is no `disabled` prop: a disabled control is an `aria-disabled`
            anchor plus the caller utilities that grey it out and kill its hits. */}
        <Case name="navbits-pagination-disabled-prev" width={480}>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled="true"
                  className="pointer-events-none opacity-50"
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Case>
        <CaseRow>
          <Case name="navbits-pagination-ellipsis">
            <PaginationEllipsis />
          </Case>
          <Case name="navbits-pagination-sizes">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#" size="sm">
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="default">
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="lg">
                    3
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Case>
          <Case name="navbits-pagination-hover-target">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#">7</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Case>
          <Case name="navbits-pagination-focus-target">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#">8</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}
