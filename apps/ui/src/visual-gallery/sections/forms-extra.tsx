import { fonts, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { AtSignIcon, SearchIcon, SquareTerminal, XIcon } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * The states of `input`, `textarea`, `label`, `field` and `input-group` that
 * the `forms` section does not reach (PR 05).
 *
 * A sibling section rather than more cases in `forms`, because `gallery.spec.ts`
 * also captures one full-page screenshot per section and that original is
 * frozen — see `docs/stylex-migration/conventions.md`.
 *
 * Three kinds of case live here:
 *
 * 1. States no existing case shows: the combined `aria-invalid` + focus ring,
 *    read-only focus, the addon alignments with their negative margins, the
 *    container-query orientation of `Field`, the `has-data-checked` box of a
 *    `FieldLabel`, and the sibling-margin rules of `FieldDescription`.
 * 2. Interaction targets whose state a `gallery.spec.ts` test drives (`*-target`).
 * 3. `quirk-*` cases that pin an oddity of the pre-migration cascade, so the
 *    migration has to keep reproducing it.
 */
export function FormsExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="input states">
        <CaseRow>
          <Case name="input-invalid-focus-target" width={240}>
            <Input aria-invalid defaultValue="invalid and focused" />
          </Case>
          <Case name="input-readonly-focus-target" width={240}>
            <Input readOnly defaultValue="read only" />
          </Case>
          <Case name="input-invalid-disabled" width={240}>
            <Input aria-invalid disabled defaultValue="invalid and disabled" />
          </Case>
          <Case name="input-placeholder-long" width={240}>
            <Input placeholder="A placeholder long enough to run past the right edge" />
          </Case>
          <Case name="input-password" width={240}>
            <Input type="password" defaultValue="fixture-secret" />
          </Case>
        </CaseRow>
        <CaseRow>
          {/* Pins the pre-migration cascade: a caller font size loses to the
              component's own breakpoint rule above 48rem, because a media query
              adds no specificity but is emitted later in the utility layer. The
              desktop shot is therefore 14px and the mobile one 24px. */}
          <Case name="quirk-input-caller-text-2xl" width={260}>
            <Input sx={galleryStyles.case1} defaultValue="Skill name" />
          </Case>
          <Case name="input-caller-text-sm" width={240}>
            <Input sx={galleryStyles.case2} defaultValue="editor command" />
          </Case>
          <Case name="input-caller-flex-1" width={240}>
            <div {...stylex.props(galleryStyles.case3)}>
              <Input sx={galleryStyles.case4} defaultValue="grows to fill" />
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="textarea and label states">
        <CaseRow>
          <Case name="textarea-readonly" width={320}>
            <Textarea readOnly defaultValue="read only" />
          </Case>
          <Case name="textarea-invalid-focus-target" width={320}>
            <Textarea aria-invalid defaultValue="invalid and focused" />
          </Case>
          {/* Same breakpoint quirk as `quirk-input-caller-text-2xl`. */}
          <Case name="quirk-textarea-caller-text-xs" width={320}>
            <Textarea sx={galleryStyles.case5} defaultValue={'---\nname: fixture\n---\n'} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="label-caller-text-base">
            <Label sx={galleryStyles.case6}>Color Mode</Label>
          </Case>
          <Case name="label-in-disabled-group" width={240}>
            <div className="group" data-disabled="true">
              <Label>Label inside a disabled group</Label>
            </div>
          </Case>
          <Case name="label-flex-row">
            <Label sx={galleryStyles.case8}>
              <AtSignIcon
                className={[stylex.props(galleryStyles.case9).className, 'size-explicit'].join(' ')}
              />
              Label with an icon
            </Label>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="field orientation and content">
        <CaseRow>
          {/* `@md/field-group` is a container query on `FieldGroup`, so the two
              widths below decide the orientation, not the viewport. */}
          <Case name="field-responsive-narrow" width={320}>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldLabel htmlFor="fx-responsive-a">Editor command</FieldLabel>
                <Input id="fx-responsive-a" defaultValue="windsurf" />
              </Field>
            </FieldGroup>
          </Case>
          <Case name="field-responsive-wide" width={520}>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldLabel htmlFor="fx-responsive-b">Editor command</FieldLabel>
                <Input id="fx-responsive-b" defaultValue="windsurf" />
              </Field>
            </FieldGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="field-horizontal-content-checkbox" width={360}>
            <Field orientation="horizontal">
              <Checkbox id="fx-horizontal-check" />
              <FieldContent>
                <FieldTitle>Include drafts</FieldTitle>
                <FieldDescription>Drafts are hidden from the library by default.</FieldDescription>
              </FieldContent>
            </Field>
          </Case>
          <Case name="field-horizontal-labels" width={360}>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="fx-horizontal-input">Name</FieldLabel>
              <Input id="fx-horizontal-input" defaultValue="alpha" />
            </Field>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="field-label-checked" width={320}>
            <FieldLabel htmlFor="fx-label-checked">
              <Field orientation="horizontal">
                <Checkbox id="fx-label-checked" checked />
                <FieldTitle>Checked wrapper</FieldTitle>
              </Field>
            </FieldLabel>
          </Case>
          <Case name="field-label-unchecked" width={320}>
            <FieldLabel htmlFor="fx-label-unchecked">
              <Field orientation="horizontal">
                <Checkbox id="fx-label-unchecked" />
                <FieldTitle>Unchecked wrapper</FieldTitle>
              </Field>
            </FieldLabel>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="field group, legend and description">
        <CaseRow>
          <Case name="field-group-nested" width={360}>
            <FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fx-nested-a">Inner field</FieldLabel>
                  <Input id="fx-nested-a" defaultValue="inner" />
                </Field>
              </FieldGroup>
              <Field>
                <FieldLabel htmlFor="fx-nested-b">Outer field</FieldLabel>
                <Input id="fx-nested-b" defaultValue="outer" />
              </Field>
            </FieldGroup>
          </Case>
          <Case name="field-set-radio-group" width={360}>
            <FieldSet>
              <FieldLegend>Default view</FieldLegend>
              <RadioGroup defaultValue="list">
                <div {...stylex.props(galleryStyles.case10)}>
                  <RadioGroupItem value="list" id="fx-radio-list" />
                  <Label htmlFor="fx-radio-list">List</Label>
                </div>
              </RadioGroup>
            </FieldSet>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="field-legend-description" width={360}>
            <FieldSet>
              <FieldLegend>Scope</FieldLegend>
              <FieldDescription>
                Pulled up under a legend-variant legend by the sibling rule.
              </FieldDescription>
            </FieldSet>
          </Case>
          <Case name="field-description-link-hover-target" width={360}>
            <Field>
              <FieldLabel htmlFor="fx-link">Directory</FieldLabel>
              <Input id="fx-link" defaultValue="/tmp/fixture" />
              <FieldDescription>
                Read the <a href="#fx-link">directory documentation</a> first.
              </FieldDescription>
            </Field>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="field-description-not-last" width={360}>
            <Field>
              <FieldLabel htmlFor="fx-not-last">Tags</FieldLabel>
              <FieldDescription>A description that is not the last child.</FieldDescription>
              <Input id="fx-not-last" defaultValue="alpha, beta" />
            </Field>
          </Case>
          <Case name="field-separator-plain" width={360}>
            <FieldSeparator />
          </Case>
          <Case name="field-title-disabled" width={360}>
            <Field data-disabled="true">
              <FieldTitle>Disabled title</FieldTitle>
              <FieldDescription>Disabled description.</FieldDescription>
            </Field>
          </Case>
        </CaseRow>
        <CaseRow>
          {/* `FieldError` returns `null` when it has neither children nor
              errors, so this field shows a label and a control and no error at
              all. (The case needs a box of its own: a case element with a zero
              height is never `visible` to the screenshot helper.) */}
          <Case name="quirk-field-error-empty" width={240}>
            <Field>
              <FieldLabel htmlFor="fx-error-empty">No error rendered</FieldLabel>
              <Input id="fx-error-empty" defaultValue="valid" />
              <FieldError />
            </Field>
          </Case>
          <Case name="field-error-children" width={360}>
            <Field data-invalid="true">
              <FieldError>Directly provided error text.</FieldError>
            </Field>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="input group addons and buttons">
        <CaseRow>
          <Case name="input-group-focus-target" width={260}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput placeholder="Focus me" />
            </InputGroup>
          </Case>
          <Case name="input-group-invalid-focus-target" width={260}>
            <InputGroup>
              <InputGroupInput aria-invalid defaultValue="invalid" />
            </InputGroup>
          </Case>
          <Case name="input-group-button-focus-target" width={260}>
            <InputGroup>
              <InputGroupInput defaultValue="migration" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs">
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="input-group-button-sizes" width={320}>
            <InputGroup>
              <InputGroupInput defaultValue="sizes" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="xs">xs</InputGroupButton>
                <InputGroupButton size="sm">sm</InputGroupButton>
                <InputGroupButton size="icon-xs">
                  <XIcon />
                </InputGroupButton>
                <InputGroupButton size="icon-sm">
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Case>
          <Case name="input-group-button-variants" width={320}>
            <InputGroup>
              <InputGroupInput defaultValue="variants" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton variant="default">save</InputGroupButton>
                <InputGroupButton variant="outline">edit</InputGroupButton>
                <InputGroupButton variant="destructive">drop</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="input-group-addon-button-start" width={260}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupButton size="icon-xs">
                  <SearchIcon />
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupInput defaultValue="button addon" />
            </InputGroup>
          </Case>
          <Case name="input-group-addon-kbd-start" width={260}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <kbd>⌘F</kbd>
              </InputGroupAddon>
              <InputGroupInput defaultValue="kbd addon" />
            </InputGroup>
          </Case>
          <Case name="input-group-text-icon" width={260}>
            <InputGroup>
              <InputGroupInput defaultValue="text addon" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>
                  <SquareTerminal />
                  cmd
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="input-group-block-start-input" width={320}>
            <InputGroup>
              <InputGroupAddon align="block-start">
                <InputGroupText>Instructions</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput defaultValue="an input under a block-start addon" />
            </InputGroup>
          </Case>
          <Case name="input-group-block-end-input" width={320}>
            <InputGroup>
              <InputGroupInput defaultValue="an input over a block-end addon" />
              <InputGroupAddon align="block-end">
                <InputGroupButton>Save</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="input-group-addon-border-b" width={320}>
            <InputGroup>
              <InputGroupAddon align="block-start" sx={galleryStyles.case11} className="border-b">
                <InputGroupText>Bordered addon</InputGroupText>
              </InputGroupAddon>
              <InputGroupTextarea defaultValue="Body" />
            </InputGroup>
          </Case>
          <Case name="input-group-textarea-only" width={320}>
            <InputGroup>
              <InputGroupTextarea defaultValue="A group whose only control is a textarea." />
            </InputGroup>
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
  case1: {
    fontSize: { default: '1.5rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: {
      default: typography.xxlLineHeight,
      '@media (width >= 48rem)': typography.smLineHeight,
    },
    fontWeight: 700,
  },
  case2: {
    fontSize: { default: '0.875rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: {
      default: typography.smLineHeight,
      '@media (width >= 48rem)': typography.smLineHeight,
    },
  },
  case3: { display: 'flex' },
  case4: { flex: 1 },
  case5: {
    fontFamily: fonts.mono,
    fontSize: { default: '0.75rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: {
      default: typography.xsLineHeight,
      '@media (width >= 48rem)': typography.smLineHeight,
    },
  },
  case6: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 },
  case8: { flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  case9: { width: '1rem', height: '1rem' },
  case10: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  case11: { borderBottomWidth: '1px', borderBottomStyle: 'solid' },
})
