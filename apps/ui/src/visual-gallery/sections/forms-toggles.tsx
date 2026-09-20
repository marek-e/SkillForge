import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * The states of `checkbox`, `radio-group`, `switch` and `slider` that the
 * `forms` section does not reach (PR 06).
 *
 * A sibling section, because `gallery.spec.ts` also captures one full-page
 * screenshot per section and that original is frozen — see
 * `docs/stylex-migration/conventions.md`.
 *
 * The interesting states here are the ones written by two rules at once: an
 * invalid control that is also checked, a control inside a disabled `Field`, a
 * `Label` next to a disabled peer, and the thumb states of a slider, which are
 * the only hover/active rules in the four components.
 */
export function FormsTogglesSection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="checkbox states">
        <CaseRow>
          <Case name="checkbox-invalid-checked">
            <Checkbox aria-invalid checked />
          </Case>
          <Case name="checkbox-invalid-indeterminate">
            <Checkbox aria-invalid checked="indeterminate" />
          </Case>
          <Case name="checkbox-indeterminate-disabled">
            <Checkbox disabled checked="indeterminate" />
          </Case>
          <Case name="checkbox-hover-target">
            <Checkbox />
          </Case>
          <Case name="checkbox-invalid-focus-target">
            <Checkbox aria-invalid />
          </Case>
          <Case name="checkbox-checked-focus-target">
            <Checkbox checked />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="checkbox-in-disabled-field" width={320}>
            <Field orientation="horizontal">
              <Checkbox id="ft-disabled-field" disabled />
              <FieldLabel htmlFor="ft-disabled-field">
                Inside a field with a disabled control
              </FieldLabel>
            </Field>
          </Case>
          <Case name="checkbox-with-disabled-peer" width={320}>
            <div className="flex items-center gap-2">
              <Checkbox id="ft-peer" disabled />
              <Label htmlFor="ft-peer">Label after a disabled peer</Label>
            </div>
          </Case>
          <Case name="checkbox-in-field-label" width={320}>
            <FieldLabel htmlFor="ft-field-label">
              <Field orientation="horizontal">
                <Checkbox id="ft-field-label" checked />
                <FieldTitle>Checked inside a field label</FieldTitle>
              </Field>
            </FieldLabel>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="radio group states">
        <CaseRow>
          <Case name="radio-group-focus-target" width={200}>
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="a" id="ft-radio-focus" />
                <Label htmlFor="ft-radio-focus">Selected</Label>
              </div>
            </RadioGroup>
          </Case>
          <Case name="radio-group-hover-target" width={200}>
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="b" id="ft-radio-hover" />
                <Label htmlFor="ft-radio-hover">Not selected</Label>
              </div>
            </RadioGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="radio-group-invalid-checked" width={240}>
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="a" id="ft-radio-invalid" aria-invalid />
                <Label htmlFor="ft-radio-invalid">Invalid and selected</Label>
              </div>
            </RadioGroup>
          </Case>
          <Case name="radio-group-disabled-item" width={240}>
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="a" id="ft-radio-disabled-on" disabled />
                <Label htmlFor="ft-radio-disabled-on">One item disabled</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="b" id="ft-radio-enabled" />
                <Label htmlFor="ft-radio-enabled">The other enabled</Label>
              </div>
            </RadioGroup>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="switch states">
        <CaseRow>
          <Case name="switch-focus-target">
            <Switch />
          </Case>
          <Case name="switch-checked-focus-target">
            <Switch checked />
          </Case>
          <Case name="switch-invalid-focus-target">
            <Switch aria-invalid />
          </Case>
          <Case name="switch-invalid-checked">
            <Switch aria-invalid checked />
          </Case>
          <Case name="switch-sm-disabled-on">
            <Switch size="sm" disabled checked />
          </Case>
          <Case name="switch-sm-invalid">
            <Switch size="sm" aria-invalid />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="switch-with-disabled-peer" width={320}>
            <div className="flex items-center gap-2">
              <Switch id="ft-switch-peer" disabled />
              <Label htmlFor="ft-switch-peer">Label after a disabled switch</Label>
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="slider states">
        <Case name="slider-hover-target" width={320}>
          <Slider value={[40]} />
        </Case>
        <Case name="slider-active-target" width={320}>
          <Slider value={[60]} />
        </Case>
        <Case name="slider-range-focus-target" width={320}>
          <Slider value={[20, 70]} />
        </Case>
        <Case name="slider-vertical-range" width={80}>
          <div className="h-40">
            <Slider value={[20, 70]} orientation="vertical" />
          </div>
        </Case>
        <Case name="slider-disabled-range" width={320}>
          <Slider value={[30, 80]} disabled />
        </Case>
        <Case name="slider-step" width={320}>
          <Slider value={[50]} step={25} />
        </Case>
      </CaseGroup>
    </div>
  )
}
