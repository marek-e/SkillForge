import * as stylex from '@stylexjs/stylex'
import { ArrowRightIcon, PlusIcon, StarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { DisplayViewSwitch } from '@/components/ui/display-view-switch'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Button, badge, toggle and group states the `buttons` section does not mount (PR 04).
 *
 * A sibling section rather than extra cases in `buttons`, for the reason given in
 * `docs/stylex-migration/conventions.md`: `gallery.spec.ts` also takes one full-page
 * screenshot per section, and a frozen original is never replaced.
 *
 * It covers the parts of the `cva` strings that only appear in a combination:
 *
 * - the whole variant x size matrix, which `buttons` samples only along each axis;
 * - the `has-data-[icon=inline-start|end]` padding, which differs per size;
 * - `in-data-[slot=button-group]:rounded-lg`, which only fires inside a group;
 * - the button-group child-edge rules, including the `!important` one
 *   (`[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!`) whose only visible
 *   effect is when the last `[data-slot]` child is *not* the last child;
 * - focus and hover per variant, because the focus ring composes a different colour
 *   for `destructive`, and `aria-invalid` competes with `focus-visible` for both the
 *   ring and the border colour;
 * - `[a]:hover:*` on badges, which needs a real anchor (`asChild`).
 */

const VARIANTS = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const
const TEXT_SIZES = ['default', 'xs', 'sm', 'lg'] as const
const ICON_SIZES = ['icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const
const PADDED_SIZES = ['default', 'xs', 'sm', 'lg'] as const
const BADGE_LINK_VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'link'] as const

export function ButtonsExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="variant x text size">
        {VARIANTS.map((variant) => (
          <CaseRow key={variant}>
            {TEXT_SIZES.map((size) => (
              <Case key={size} name={`button-${variant}-${size}`}>
                <Button variant={variant} size={size}>
                  Button
                </Button>
              </Case>
            ))}
          </CaseRow>
        ))}
      </CaseGroup>

      <CaseGroup title="variant x icon size">
        {VARIANTS.map((variant) => (
          <CaseRow key={variant}>
            {ICON_SIZES.map((size) => (
              <Case key={size} name={`button-${variant}-${size}`}>
                <Button variant={variant} size={size} aria-label="Star">
                  <StarIcon />
                </Button>
              </Case>
            ))}
          </CaseRow>
        ))}
      </CaseGroup>

      <CaseGroup title="inline icon padding per size">
        <CaseRow>
          {PADDED_SIZES.map((size) => (
            <Case key={size} name={`button-${size}-icon-start`}>
              <Button size={size}>
                <PlusIcon data-icon="inline-start" />
                New
              </Button>
            </Case>
          ))}
        </CaseRow>
        <CaseRow>
          {PADDED_SIZES.map((size) => (
            <Case key={size} name={`button-${size}-icon-end`}>
              <Button size={size} variant="outline">
                More
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </Case>
          ))}
        </CaseRow>
        <Case name="button-icon-both">
          <Button>
            <PlusIcon data-icon="inline-start" />
            Both
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </Case>
        <Case name="button-sized-svg">
          <Button aria-label="Star">
            <StarIcon
              className={[stylex.props(galleryStyles.case1).className, 'size-explicit'].join(' ')}
            />
          </Button>
        </Case>
      </CaseGroup>

      <CaseGroup title="interaction targets">
        <CaseRow>
          {VARIANTS.map((variant) => (
            <Case key={variant} name={`button-hover-${variant}-target`}>
              <Button variant={variant}>Hover</Button>
            </Case>
          ))}
        </CaseRow>
        <CaseRow>
          {VARIANTS.map((variant) => (
            <Case key={variant} name={`button-focus-${variant}-target`}>
              <Button variant={variant}>Focus</Button>
            </Case>
          ))}
        </CaseRow>
        <CaseRow>
          <Case name="button-invalid-focus-target">
            <Button aria-invalid>Invalid</Button>
          </Case>
          <Case name="button-invalid-outline">
            <Button variant="outline" aria-invalid>
              Invalid
            </Button>
          </Case>
          <Case name="button-invalid-destructive">
            <Button variant="destructive" aria-invalid>
              Invalid
            </Button>
          </Case>
          <Case name="button-active-target">
            <Button variant="secondary">Active</Button>
          </Case>
        </CaseRow>
        <CaseRow>
          {VARIANTS.map((variant) => (
            <Case key={variant} name={`button-disabled-${variant}`}>
              <Button variant={variant} disabled>
                Disabled
              </Button>
            </Case>
          ))}
        </CaseRow>
        <CaseRow>
          <Case name="button-expanded-ghost">
            <Button variant="ghost" aria-expanded="true">
              Expanded
            </Button>
          </Case>
          <Case name="button-expanded-secondary">
            <Button variant="secondary" aria-expanded="true">
              Expanded
            </Button>
          </Case>
          <Case name="button-expanded-collapsed">
            <Button variant="ghost" aria-expanded="false">
              Collapsed
            </Button>
          </Case>
          <Case name="button-aschild-link">
            <Button asChild variant="outline">
              <a href="#stylex">Anchor button</a>
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="button group edges">
        <CaseRow>
          <Case name="button-group-two">
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-text-last">
            <ButtonGroup>
              <Button variant="outline">Button</Button>
              <ButtonGroupText>.com</ButtonGroupText>
            </ButtonGroup>
          </Case>
          <Case name="button-group-text-both">
            <ButtonGroup>
              <ButtonGroupText>https://</ButtonGroupText>
              <Button variant="outline">example</Button>
              <ButtonGroupText>.com</ButtonGroupText>
            </ButtonGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="button-group-xs">
            <ButtonGroup>
              <Button variant="outline" size="xs">
                One
              </Button>
              <Button variant="outline" size="xs">
                Two
              </Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-sm">
            <ButtonGroup>
              <Button variant="outline" size="sm">
                One
              </Button>
              <Button variant="outline" size="sm">
                Two
              </Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-icon-xs">
            <ButtonGroup>
              <Button variant="outline" size="icon-xs" aria-label="Star">
                <StarIcon />
              </Button>
              <Button variant="outline" size="icon-xs" aria-label="Add">
                <PlusIcon />
              </Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-icon-sm">
            <ButtonGroup>
              <Button variant="outline" size="icon-sm" aria-label="Star">
                <StarIcon />
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Add">
                <PlusIcon />
              </Button>
            </ButtonGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="button-group-nested">
            <ButtonGroup>
              <ButtonGroup>
                <Button variant="outline">A</Button>
                <Button variant="outline">B</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button variant="outline">C</Button>
                <Button variant="outline">D</Button>
              </ButtonGroup>
            </ButtonGroup>
          </Case>
          <Case name="button-group-input" width={280}>
            <ButtonGroup>
              <Input placeholder="Search" />
              <Button variant="outline">Go</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-select" width={280}>
            <ButtonGroup>
              <Select defaultValue="cursor">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </Select>
              <Button variant="outline">Open</Button>
            </ButtonGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="button-group-vertical-two">
            <ButtonGroup orientation="vertical">
              <Button variant="outline">Top</Button>
              <Button variant="outline">Bottom</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-vertical-text-last">
            <ButtonGroup orientation="vertical">
              <Button variant="outline">Button</Button>
              <ButtonGroupText>Footer</ButtonGroupText>
            </ButtonGroup>
          </Case>
          <Case name="button-group-vertical-separator">
            <ButtonGroup orientation="vertical">
              <Button variant="outline">Copy</Button>
              <ButtonGroupSeparator orientation="horizontal" />
              <Button variant="outline">Paste</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-mixed-variants">
            <ButtonGroup>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </ButtonGroup>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="badge">
        <CaseRow>
          {BADGE_LINK_VARIANTS.map((variant) => (
            <Case key={variant} name={`badge-link-${variant}`}>
              <Badge variant={variant} asChild>
                <a href="#stylex">Link badge</a>
              </Badge>
            </Case>
          ))}
        </CaseRow>
        <CaseRow>
          <Case name="badge-hover-target">
            <Badge asChild>
              <a href="#stylex">Hover</a>
            </Badge>
          </Case>
          <Case name="badge-hover-ghost-target">
            <Badge variant="ghost" asChild>
              <a href="#stylex">Hover</a>
            </Badge>
          </Case>
          <Case name="badge-focus-target">
            <Badge asChild>
              <a href="#stylex">Focus</a>
            </Badge>
          </Case>
          <Case name="badge-icon-end">
            <Badge variant="secondary">
              Trailing
              <ArrowRightIcon data-icon="inline-end" />
            </Badge>
          </Case>
          <Case name="badge-invalid-outline">
            <Badge variant="outline" aria-invalid>
              Invalid
            </Badge>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="toggle">
        <CaseRow>
          <Case name="toggle-sm-on">
            <Toggle size="sm" pressed aria-label="Small on">
              S
            </Toggle>
          </Case>
          <Case name="toggle-lg-on">
            <Toggle size="lg" pressed aria-label="Large on">
              L
            </Toggle>
          </Case>
          <Case name="toggle-outline-disabled">
            <Toggle variant="outline" disabled aria-label="Outline disabled">
              D
            </Toggle>
          </Case>
          <Case name="toggle-outline-sm">
            <Toggle variant="outline" size="sm" aria-label="Outline small">
              S
            </Toggle>
          </Case>
          <Case name="toggle-icon">
            <Toggle aria-label="Star">
              <StarIcon />
            </Toggle>
          </Case>
          <Case name="toggle-focus-target">
            <Toggle aria-label="Focus">F</Toggle>
          </Case>
          <Case name="toggle-invalid">
            <Toggle aria-invalid aria-label="Invalid">
              I
            </Toggle>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="display view switch">
        <CaseRow>
          <Case name="display-view-switch-hover-target">
            <DisplayViewSwitch value="list" onChange={() => {}} />
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
  case1: { width: '1.5rem', height: '1.5rem' },
})
