import * as stylex from '@stylexjs/stylex'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/components/ui/combobox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Select and combobox states the `overlays` section does not mount (PR 15).
 *
 * A sibling section rather than extra cases in `overlays`, for the reason given
 * in `docs/stylex-migration/conventions.md`: `gallery.spec.ts` also takes one
 * full-page screenshot per section, and a frozen original is never replaced.
 *
 * Every case name carries the `selcombo` token so `-g selcombo` selects this
 * row's interaction tests. The closed triggers here are also what
 * `overlays.spec.ts` and `animations.spec.ts` open: the popup is portalled, so
 * an open select or combobox is captured full page, not as a case element.
 */
const EDITORS = ['Cursor', 'VS Code', 'Zed', 'Sublime Text', 'Windsurf']

const MANY_EDITORS = Array.from({ length: 40 }, (_, index) => `Editor ${index + 1}`)

const LONG_LABEL = 'A very long editor name that has to be clamped by the trigger value span'

export function SelectComboboxExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="select trigger">
        <CaseRow>
          <Case name="selcombo-select-placeholder" width={240}>
            <Select>
              <SelectTrigger sx={galleryStyles.case1} className="w-explicit">
                <SelectValue placeholder="Pick an editor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-value" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case2} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-disabled" width={240}>
            <Select disabled defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case3} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-invalid" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case4} className="w-explicit" aria-invalid>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="selcombo-select-size-default" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case5} className="w-explicit" size="default">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-size-sm" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case6} className="w-explicit" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-fit">
            <Select defaultValue="cursor">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-long" width={240}>
            <Select defaultValue="long">
              <SelectTrigger sx={galleryStyles.case7} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">{LONG_LABEL}</SelectItem>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="selcombo-select-hover-target" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case8} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-focus-target" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case9} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-invalid-focus-target" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case10} className="w-explicit" aria-invalid>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
              </SelectContent>
            </Select>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="select popup triggers">
        <CaseRow>
          <Case name="selcombo-select-groups" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case11} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Editors</SelectLabel>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="cursor">Cursor</SelectItem>
                  <SelectItem value="code">VS Code</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Unavailable</SelectLabel>
                  <SelectItem value="zed" disabled>
                    Zed (disabled)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-popper" width={240}>
            <Select defaultValue="cursor">
              <SelectTrigger sx={galleryStyles.case12} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" align="start">
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="cursor">Cursor</SelectItem>
                <SelectItem value="code">VS Code</SelectItem>
              </SelectContent>
            </Select>
          </Case>
          <Case name="selcombo-select-scroll" width={240}>
            <Select defaultValue="Editor 20">
              <SelectTrigger sx={galleryStyles.case13} className="w-explicit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANY_EDITORS.map((editor) => (
                  <SelectItem key={editor} value={editor}>
                    {editor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="combobox">
        <CaseRow>
          <Case name="selcombo-combobox-input" width={260}>
            <Combobox items={EDITORS}>
              <ComboboxInput placeholder="Search editors…" />
              <ComboboxContent>
                <ComboboxEmpty>No editors found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="selcombo-combobox-clear" width={260}>
            <Combobox items={EDITORS} defaultValue="Cursor">
              <ComboboxInput showClear placeholder="Search editors…" />
              <ComboboxContent>
                <ComboboxEmpty>No editors found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="selcombo-combobox-disabled" width={260}>
            <Combobox items={EDITORS}>
              <ComboboxInput disabled placeholder="Disabled" />
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="selcombo-combobox-list" width={260}>
            <Combobox items={EDITORS}>
              <ComboboxInput placeholder="Search editors…" />
              <ComboboxContent>
                <ComboboxEmpty>No editors found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item} disabled={item === 'Zed'}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="selcombo-combobox-chips" width={300}>
            <Combobox items={EDITORS} multiple defaultValue={['Cursor', 'VS Code']}>
              <ComboboxChips>
                <ComboboxValue>
                  {(value: string[]) =>
                    value.map((item) => (
                      <ComboboxChip key={item} aria-label={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Add editor…" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="selcombo-combobox-chips-plain" width={300}>
            <Combobox items={EDITORS} multiple defaultValue={[]}>
              <ComboboxChips>
                <ComboboxChipsInput placeholder="Add editor…" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="selcombo-combobox-chips-invalid" width={300}>
            <Combobox items={EDITORS} multiple defaultValue={['Cursor']}>
              <ComboboxChips>
                <ComboboxValue>
                  {(value: string[]) =>
                    value.map((item) => (
                      <ComboboxChip key={item} aria-label={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput aria-invalid placeholder="Add editor…" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="selcombo-combobox-chip-disabled" width={300}>
            <Combobox items={EDITORS} multiple defaultValue={['Cursor']} disabled>
              <ComboboxChips>
                <ComboboxValue>
                  {(value: string[]) =>
                    value.map((item) => (
                      <ComboboxChip key={item} aria-label={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput disabled placeholder="Add editor…" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Case>
          <Case name="selcombo-combobox-chips-focus-target" width={300}>
            <Combobox items={EDITORS} multiple defaultValue={['Zed']}>
              <ComboboxChips>
                <ComboboxValue>
                  {(value: string[]) =>
                    value.map((item) => (
                      <ComboboxChip key={item} aria-label={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Add editor…" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
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
  case1: { width: '100%' },
  case2: { width: '100%' },
  case3: { width: '100%' },
  case4: { width: '100%' },
  case5: { width: '100%' },
  case6: { width: '100%' },
  case7: { width: '100%' },
  case8: { width: '100%' },
  case9: { width: '100%' },
  case10: { width: '100%' },
  case11: { width: '100%' },
  case12: { width: '100%' },
  case13: { width: '100%' },
})
