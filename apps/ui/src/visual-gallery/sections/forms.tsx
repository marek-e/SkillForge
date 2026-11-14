import { colors, fonts, radius, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { SearchIcon, SquareTerminal, XIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

export function FormsSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="input">
        <CaseRow>
          <Case name="input-empty" width={240}>
            <Input placeholder="Skill name" />
          </Case>
          <Case name="input-filled" width={240}>
            <Input defaultValue="summarize-pull-request" />
          </Case>
          <Case name="input-invalid" width={240}>
            <Input aria-invalid defaultValue="not valid" />
          </Case>
          <Case name="input-disabled" width={240}>
            <Input disabled defaultValue="disabled" />
          </Case>
          <Case name="input-readonly" width={240}>
            <Input readOnly defaultValue="read only" />
          </Case>
          <Case name="input-focus-target" width={240}>
            <Input placeholder="Focus me" />
          </Case>
          <Case name="input-long-value" width={240}>
            <Input
              readOnly
              defaultValue="/Users/fixture/projects/gamma/with/a/deliberately/long/nested/path"
            />
          </Case>
          <Case name="input-file" width={240}>
            <Input type="file" />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="textarea and label">
        <CaseRow>
          <Case name="textarea-empty" width={320}>
            <Textarea placeholder="Skill instructions…" />
          </Case>
          <Case name="textarea-filled" width={320}>
            <Textarea defaultValue={LONG_TEXT} />
          </Case>
          <Case name="textarea-invalid" width={320}>
            <Textarea aria-invalid defaultValue="invalid" />
          </Case>
          <Case name="textarea-disabled" width={320}>
            <Textarea disabled defaultValue="disabled" />
          </Case>
          <Case name="textarea-mono" width={320}>
            <Textarea sx={galleryStyles.case1} defaultValue={'---\nname: fixture\n---\n'} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="label-default">
            <Label>Description</Label>
          </Case>
          <Case name="label-long" width={200}>
            <Label>A label long enough to wrap onto two lines</Label>
          </Case>
          <Case name="label-with-disabled-peer" width={240}>
            <div>
              <Input id="disabled-peer" disabled className="peer" />
              <Label htmlFor="disabled-peer">Label next to a disabled control</Label>
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="field">
        <Case name="field-vertical" width={360}>
          <Field>
            <FieldLabel htmlFor="field-a">Name</FieldLabel>
            <Input id="field-a" placeholder="summarize-pull-request" />
            <FieldDescription>Used as the skill directory name.</FieldDescription>
          </Field>
        </Case>
        <Case name="field-horizontal" width={360}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Favorite</FieldTitle>
              <FieldDescription>Pin this project to the sidebar.</FieldDescription>
            </FieldContent>
            <Switch />
          </Field>
        </Case>
        <Case name="field-invalid" width={360}>
          <Field data-invalid="true">
            <FieldLabel htmlFor="field-b">Directory path</FieldLabel>
            <Input id="field-b" aria-invalid defaultValue="not/a/path" />
            <FieldError errors={[{ message: 'Path must be absolute.' }]} />
          </Field>
        </Case>
        <Case name="field-errors-multiple" width={360}>
          <Field data-invalid="true">
            <FieldLabel htmlFor="field-c">Tags</FieldLabel>
            <Input id="field-c" aria-invalid />
            <FieldError
              errors={[{ message: 'Tags must be lowercase.' }, { message: 'Tags must be unique.' }]}
            />
          </Field>
        </Case>
        <Case name="field-set" width={360}>
          <FieldSet>
            <FieldLegend>Scope</FieldLegend>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="field-scope-a" />
                <FieldLabel htmlFor="field-scope-a">General</FieldLabel>
              </Field>
              <FieldSeparator>or</FieldSeparator>
              <Field orientation="horizontal">
                <Checkbox id="field-scope-b" />
                <FieldLabel htmlFor="field-scope-b">Project specific</FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
        </Case>
        <Case name="field-legend-label" width={360}>
          <FieldSet>
            <FieldLegend variant="label">Legend rendered as a label</FieldLegend>
            <FieldDescription>Description under a label-variant legend.</FieldDescription>
          </FieldSet>
        </Case>
        <Case name="field-disabled" width={360}>
          <Field data-disabled="true">
            <FieldLabel htmlFor="field-d">Disabled field</FieldLabel>
            <Input id="field-d" disabled />
            <FieldDescription>Disabled description.</FieldDescription>
          </Field>
        </Case>
      </CaseGroup>

      <CaseGroup title="input group">
        <CaseRow>
          <Case name="input-group-search" width={260}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search skills..." />
              <InputGroupAddon align="inline-end">
                <kbd {...stylex.props(galleryStyles.case3)}>⌘F</kbd>
              </InputGroupAddon>
            </InputGroup>
          </Case>
          <Case name="input-group-clear" width={260}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput defaultValue="migration" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs">
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Case>
          <Case name="input-group-terminal" width={260}>
            <InputGroup>
              <InputGroupInput placeholder="e.g. windsurf" />
              <InputGroupAddon>
                <SquareTerminal
                  className={[stylex.props(galleryStyles.case4).className, 'size-explicit'].join(
                    ' '
                  )}
                />
              </InputGroupAddon>
            </InputGroup>
          </Case>
          <Case name="input-group-disabled" width={260}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput disabled defaultValue="disabled" />
            </InputGroup>
          </Case>
          <Case name="input-group-invalid" width={260}>
            <InputGroup>
              <InputGroupInput aria-invalid defaultValue="invalid" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>err</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="input-group-block" width={320}>
            <InputGroup>
              <InputGroupAddon align="block-start">
                <InputGroupText>Instructions</InputGroupText>
              </InputGroupAddon>
              <InputGroupTextarea defaultValue="Describe the skill…" />
              <InputGroupAddon align="block-end">
                <InputGroupButton>Save</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="checkbox">
        <CaseRow>
          <Case name="checkbox-unchecked">
            <Checkbox />
          </Case>
          <Case name="checkbox-checked">
            <Checkbox checked />
          </Case>
          <Case name="checkbox-indeterminate">
            <Checkbox checked="indeterminate" />
          </Case>
          <Case name="checkbox-disabled">
            <Checkbox disabled />
          </Case>
          <Case name="checkbox-disabled-checked">
            <Checkbox disabled checked />
          </Case>
          <Case name="checkbox-invalid">
            <Checkbox aria-invalid />
          </Case>
          <Case name="checkbox-focus-target">
            <Checkbox />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="radio group">
        <Case name="radio-group-default" width={320}>
          <RadioGroup defaultValue="list">
            <div {...stylex.props(galleryStyles.case5)}>
              <RadioGroupItem value="list" id="gallery-radio-list" />
              <Label htmlFor="gallery-radio-list">List</Label>
            </div>
            <div {...stylex.props(galleryStyles.case6)}>
              <RadioGroupItem value="grid" id="gallery-radio-grid" />
              <Label htmlFor="gallery-radio-grid">Grid</Label>
            </div>
          </RadioGroup>
        </Case>
        <Case name="radio-group-disabled" width={320}>
          <RadioGroup defaultValue="a" disabled>
            <div {...stylex.props(galleryStyles.case7)}>
              <RadioGroupItem value="a" id="gallery-radio-a" />
              <Label htmlFor="gallery-radio-a">Disabled selected</Label>
            </div>
            <div {...stylex.props(galleryStyles.case8)}>
              <RadioGroupItem value="b" id="gallery-radio-b" />
              <Label htmlFor="gallery-radio-b">Disabled unselected</Label>
            </div>
          </RadioGroup>
        </Case>
        <Case name="radio-group-invalid" width={320}>
          <RadioGroup defaultValue="a">
            <div {...stylex.props(galleryStyles.case9)}>
              <RadioGroupItem value="a" id="gallery-radio-c" aria-invalid />
              <Label htmlFor="gallery-radio-c">Invalid</Label>
            </div>
          </RadioGroup>
        </Case>
        <Case name="radio-group-columns" width={480}>
          <RadioGroup defaultValue="system" sx={galleryStyles.case10}>
            <div {...stylex.props(galleryStyles.case11)}>
              <RadioGroupItem value="system" id="gallery-radio-system" />
              <Label htmlFor="gallery-radio-system">System</Label>
            </div>
            <div {...stylex.props(galleryStyles.case12)}>
              <RadioGroupItem value="light" id="gallery-radio-light" />
              <Label htmlFor="gallery-radio-light">Light</Label>
            </div>
            <div {...stylex.props(galleryStyles.case13)}>
              <RadioGroupItem value="dark" id="gallery-radio-dark" />
              <Label htmlFor="gallery-radio-dark">Dark</Label>
            </div>
          </RadioGroup>
        </Case>
      </CaseGroup>

      <CaseGroup title="switch">
        <CaseRow>
          <Case name="switch-off">
            <Switch />
          </Case>
          <Case name="switch-on">
            <Switch checked />
          </Case>
          <Case name="switch-sm-off">
            <Switch size="sm" />
          </Case>
          <Case name="switch-sm-on">
            <Switch size="sm" checked />
          </Case>
          <Case name="switch-disabled">
            <Switch disabled />
          </Case>
          <Case name="switch-disabled-on">
            <Switch disabled checked />
          </Case>
          <Case name="switch-invalid">
            <Switch aria-invalid />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="slider">
        <Case name="slider-single" width={320}>
          <Slider value={[40]} />
        </Case>
        <Case name="slider-range" width={320}>
          <Slider value={[20, 70]} />
        </Case>
        <Case name="slider-min" width={320}>
          <Slider value={[0]} />
        </Case>
        <Case name="slider-max" width={320}>
          <Slider value={[100]} />
        </Case>
        <Case name="slider-disabled" width={320}>
          <Slider value={[50]} disabled />
        </Case>
        <Case name="slider-vertical" width={80}>
          <div {...stylex.props(galleryStyles.case14)}>
            <Slider value={[35]} orientation="vertical" />
          </div>
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
  case1: {
    minHeight: '8rem',
    fontFamily: fonts.mono,
    fontSize: { default: '0.75rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: {
      default: typography.xsLineHeight,
      '@media (width >= 48rem)': typography.smLineHeight,
    },
  },
  case3: {
    borderRadius: '0.25rem',
    backgroundColor: colors.muted,
    paddingInline: '0.25rem',
    paddingBlock: '0.125rem',
    fontFamily: fonts.mono,
    fontSize: '10px',
    lineHeight: 'inherit',
    color: colors.mutedForeground,
  },
  case4: { width: '1rem', height: '1rem', color: colors.foreground },
  case5: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  case6: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  case7: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  case8: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  case9: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  case10: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  case11: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '1rem',
  },
  case12: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '1rem',
  },
  case13: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '1rem',
  },
  case14: { height: '10rem' },
})
