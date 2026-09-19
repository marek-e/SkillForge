import { useState } from 'react'
import { ArrowRightIcon, PlusIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { DisplayViewSwitch } from '@/components/ui/display-view-switch'
import { Toggle } from '@/components/ui/toggle'
import type { SkillViewMode } from '@/lib/skill-view'
import { Case, CaseGroup, CaseRow } from '../Case'

const BUTTON_VARIANTS = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const
const BUTTON_SIZES = ['default', 'xs', 'sm', 'lg'] as const
const ICON_SIZES = ['icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const
const BADGE_VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const

export function ButtonsSection() {
  const [viewMode, setViewMode] = useState<SkillViewMode>('list')

  return (
    <div className="space-y-8">
      <CaseGroup title="button variants">
        <CaseRow>
          {BUTTON_VARIANTS.map((variant) => (
            <Case key={variant} name={`button-${variant}`}>
              <Button variant={variant}>Button</Button>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="button sizes">
        <CaseRow>
          {BUTTON_SIZES.map((size) => (
            <Case key={size} name={`button-size-${size}`}>
              <Button size={size}>Button</Button>
            </Case>
          ))}
          {ICON_SIZES.map((size) => (
            <Case key={size} name={`button-size-${size}`}>
              <Button size={size} aria-label="Star">
                <StarIcon />
              </Button>
            </Case>
          ))}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="button states">
        <CaseRow>
          <Case name="button-disabled">
            <Button disabled>Disabled</Button>
          </Case>
          <Case name="button-disabled-outline">
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </Case>
          <Case name="button-invalid">
            <Button aria-invalid>Invalid</Button>
          </Case>
          <Case name="button-hover-target">
            <Button>Hover me</Button>
          </Case>
          <Case name="button-focus-target">
            <Button variant="outline">Focus me</Button>
          </Case>
          <Case name="button-expanded">
            <Button variant="outline" aria-expanded="true">
              Expanded
            </Button>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="button with icons">
        <CaseRow>
          <Case name="button-icon-start">
            <Button>
              <PlusIcon data-icon="inline-start" />
              New skill
            </Button>
          </Case>
          <Case name="button-icon-end">
            <Button variant="outline">
              All tools
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </Case>
          <Case name="button-destructive-icon">
            <Button variant="destructive" size="sm">
              <Trash2Icon />
              Remove from library
            </Button>
          </Case>
          <Case name="button-long-label" width={160}>
            <Button className="w-full">A button label long enough to be truncated</Button>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="button group">
        <CaseRow>
          <Case name="button-group-horizontal">
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-vertical">
            <ButtonGroup orientation="vertical">
              <Button variant="outline">Top</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Bottom</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-separator">
            <ButtonGroup>
              <Button variant="outline">Copy</Button>
              <ButtonGroupSeparator />
              <Button variant="outline">Paste</Button>
            </ButtonGroup>
          </Case>
          <Case name="button-group-text">
            <ButtonGroup>
              <ButtonGroupText>https://</ButtonGroupText>
              <Button variant="outline">example.com</Button>
            </ButtonGroup>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="badge">
        <CaseRow>
          {BADGE_VARIANTS.map((variant) => (
            <Case key={variant} name={`badge-${variant}`}>
              <Badge variant={variant}>Badge</Badge>
            </Case>
          ))}
          <Case name="badge-with-icon">
            <Badge variant="outline">
              <StarIcon data-icon="inline-start" />
              Favorite
            </Badge>
          </Case>
          <Case name="badge-invalid">
            <Badge aria-invalid>Invalid</Badge>
          </Case>
          <Case name="badge-long" width={140}>
            <Badge variant="secondary">A badge label that overflows its container</Badge>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="toggle">
        <CaseRow>
          <Case name="toggle-off">
            <Toggle aria-label="Bold">B</Toggle>
          </Case>
          <Case name="toggle-on">
            <Toggle pressed aria-label="Bold">
              B
            </Toggle>
          </Case>
          <Case name="toggle-outline-off">
            <Toggle variant="outline" aria-label="Italic">
              I
            </Toggle>
          </Case>
          <Case name="toggle-outline-on">
            <Toggle variant="outline" pressed aria-label="Italic">
              I
            </Toggle>
          </Case>
          <Case name="toggle-sm">
            <Toggle size="sm" aria-label="Small">
              S
            </Toggle>
          </Case>
          <Case name="toggle-lg">
            <Toggle size="lg" aria-label="Large">
              L
            </Toggle>
          </Case>
          <Case name="toggle-disabled">
            <Toggle disabled aria-label="Disabled">
              D
            </Toggle>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="display view switch">
        <CaseRow>
          <Case name="display-view-switch-list">
            <DisplayViewSwitch value="list" onChange={() => {}} />
          </Case>
          <Case name="display-view-switch-grid">
            <DisplayViewSwitch value="grid" onChange={() => {}} />
          </Case>
          <Case name="display-view-switch-interactive">
            <DisplayViewSwitch value={viewMode} onChange={setViewMode} />
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}
