import { createRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { useTheme } from 'next-themes'
import { rootRoute } from './__root'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { LayoutGridIcon, LayoutListIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { H1, Lead } from '@/components/typography'
import { colors, motion, radius } from '@/styles/tokens.stylex'
import {
  getDefaultEditor,
  setDefaultEditor,
  getCustomEditorCmd,
  setCustomEditorCmd,
} from '@/lib/editor-settings'
import { getDefaultSkillView, setDefaultSkillView, type SkillViewMode } from '@/lib/skill-view'
import { EditorSelect } from '@/components/EditorSelect'

/**
 * `transition-colors`, written out (`tailwind-values.md` §8).
 *
 * The `--tw-gradient-*` entries belong to the utility's property list and are
 * kept so the computed `transition-property` string is unchanged; naming a
 * custom property that no longer exists is inert. Same string as
 * `ToolCardCompact` (PR 22).
 */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/**
 * `space-y-*` and `space-x-3` are the page's child rules, and both migrate:
 * every element they reach is one this route renders itself, or a StyleX
 * component (`RadioGroup`, `RadioGroupItem`, `Label`, `H1`, `Lead`) whose own
 * styles declare no margin at all. Tailwind emits both margins of a pair with
 * the leading one at zero (`tailwind-values.md` §7). The compiler turns the
 * block pair into the physical `margin-top`/`margin-bottom` (PR 22) but leaves
 * the inline pair logical, as `margin-inline-start`/`margin-inline-end` —
 * either way the same resolution as Tailwind's own while the document stays
 * `horizontal-tb` and `ltr`. The eight margin declarations cost four new atomic
 * classes; the other four dedupe onto rules earlier rows emitted.
 */
const styles = stylex.create({
  // `space-y-6`
  page: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1.5rem' },
  },

  // `space-y-4`
  section: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1rem' },
  },

  // `space-y-2`
  sectionHeading: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
  },

  // `text-sm text-muted-foreground`, on the three section paragraphs and on the
  // five option hints. Plain runs of text with no descendant of their own, so
  // the paired line height is written as the length it resolves to (`20px`).
  // The hints sit inside a `Label` whose `leading-none` also sets
  // `--tw-leading: 1`, which is a non-inherited property: their `text-sm` read
  // its own paired value, not the label's, and both forms measure `14px` /
  // `20px`.
  mutedText: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
  },

  // `flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50
  //  transition-colors`.
  //
  // The border colour is not declared: `border` writes only a width and a
  // style, and the `* { border-color: … }` rule in the `base` layer keeps
  // painting it, as it did before.
  option: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '1rem',
    backgroundColor: {
      default: null,
      '@media (hover: hover)': {
        default: null,
        // The `var()` stays inside the `color-mix()`: a literal colour is
        // folded at build time into a different computed string (PR 10).
        ':hover': 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
    marginInlineStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginInlineEnd: { default: null, ':is(*)>:not(:last-child)': '0.75rem' },
  },

  // `size-4`
  optionIcon: {
    width: '1rem',
    height: '1rem',
  },

  // `font-medium`. No line height: the div inherits the label's `leading-none`
  // `1`, exactly as it does today.
  optionTitle: {
    fontWeight: 500,
  },
})

/**
 * Overrides handed to `Label`, which does expose an `sx` prop.
 *
 * `stylex.props` merges a property whole, so `optionLabel`'s `cursor` replaces
 * `Label`'s own `{ ':is(.peer:disabled ~ *)': 'not-allowed' }` — which is what
 * the `cursor-pointer` utility already did from the `utilities` layer, and no
 * radio item on this page is ever disabled. `display`, `alignItems` and `gap`
 * restate values `Label` already sets; they are kept because the source carried
 * the classes, and they cost no atomic class of their own.
 */
const labelSx = stylex.create({
  // `font-semibold`
  sectionLabel: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 600,
  },

  // `flex-1 cursor-pointer flex items-center gap-2`
  optionLabel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
})

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

function SettingsPage() {
  const { theme = 'system', setTheme } = useTheme()
  const [defaultEditor, setEditor] = useState(() => getDefaultEditor())
  const [customCmd, setCustomCmd] = useState(() => getCustomEditorCmd())
  const [skillView, setSkillView] = useState<SkillViewMode>(() => getDefaultSkillView())

  function handleSkillViewChange(value: string) {
    const mode = value as SkillViewMode
    setSkillView(mode)
    setDefaultSkillView(mode)
  }

  return (
    <div {...stylex.props(styles.page)}>
      <div>
        <H1>Settings</H1>
        <Lead>Manage your application preferences.</Lead>
      </div>

      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeading)}>
          <Label sx={labelSx.sectionLabel}>Default Editor</Label>
          <p {...stylex.props(styles.mutedText)}>
            The editor used when opening projects. Can be overridden per project.
          </p>
        </div>
        <EditorSelect
          value={defaultEditor}
          customCmd={customCmd}
          onChange={(editor, cmd) => {
            setDefaultEditor(editor)
            setCustomEditorCmd(cmd)
            setEditor(editor)
            setCustomCmd(cmd)
          }}
          triggerSx={routeStyles.editor}
          inputSx={routeStyles.editor}
        />
      </div>

      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeading)}>
          <Label sx={labelSx.sectionLabel}>Default Skills View</Label>
          <p {...stylex.props(styles.mutedText)}>
            The default display mode for skills in the Skill Library and project details.
          </p>
        </div>

        <RadioGroup
          value={skillView}
          onValueChange={handleSkillViewChange}
          sx={routeStyles.skillViewGroup}
        >
          <div {...stylex.props(styles.option)}>
            <RadioGroupItem value="list" id="skill-view-list" />
            <Label htmlFor="skill-view-list" sx={labelSx.optionLabel}>
              <LayoutListIcon {...stylex.props(styles.optionIcon)} />
              <div>
                <div {...stylex.props(styles.optionTitle)}>List</div>
                <div {...stylex.props(styles.mutedText)}>Compact rows with details</div>
              </div>
            </Label>
          </div>

          <div {...stylex.props(styles.option)}>
            <RadioGroupItem value="grid" id="skill-view-grid" />
            <Label htmlFor="skill-view-grid" sx={labelSx.optionLabel}>
              <LayoutGridIcon {...stylex.props(styles.optionIcon)} />
              <div>
                <div {...stylex.props(styles.optionTitle)}>Grid</div>
                <div {...stylex.props(styles.mutedText)}>Cards in a grid layout</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeading)}>
          <Label sx={labelSx.sectionLabel}>Color Mode</Label>
          <p {...stylex.props(styles.mutedText)}>Choose how SkillForge appears to you.</p>
        </div>

        <RadioGroup value={theme} onValueChange={setTheme} sx={routeStyles.colorModeGroup}>
          <div {...stylex.props(styles.option)}>
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" sx={labelSx.optionLabel}>
              <MonitorIcon {...stylex.props(styles.optionIcon)} />
              <div>
                <div {...stylex.props(styles.optionTitle)}>System</div>
                <div {...stylex.props(styles.mutedText)}>Match your system preference</div>
              </div>
            </Label>
          </div>

          <div {...stylex.props(styles.option)}>
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" sx={labelSx.optionLabel}>
              <SunIcon {...stylex.props(styles.optionIcon)} />
              <div>
                <div {...stylex.props(styles.optionTitle)}>Light</div>
                <div {...stylex.props(styles.mutedText)}>Light mode</div>
              </div>
            </Label>
          </div>

          <div {...stylex.props(styles.option)}>
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" sx={labelSx.optionLabel}>
              <MoonIcon {...stylex.props(styles.optionIcon)} />
              <div>
                <div {...stylex.props(styles.optionTitle)}>Dark</div>
                <div {...stylex.props(styles.mutedText)}>Dark mode</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

const routeStyles = stylex.create({
  editor: { width: '240px' },
  skillViewGroup: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  colorModeGroup: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
})
