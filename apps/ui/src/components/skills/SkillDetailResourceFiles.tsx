import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { FileIcon, FileTextIcon } from 'lucide-react'
import { colors, fonts, motion, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSkillFile } from '@/hooks/use-skill-detail'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8, as `input.tsx`). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/** `bg-muted/50`, shared by the hover rule and the selected row. */
const MUTED_50 = 'color-mix(in oklab, var(--muted) 50%, transparent)'

/**
 * The three class lists that stay Tailwind (PR 32).
 *
 * `space-y-2` and `divide-y` are child rules — `:where(& > :not(:last-child))` —
 * over elements this component wraps rather than styles, so they keep the
 * specificity they have today. The `Textarea` list is a caller override on a
 * component that takes no `sx` prop, and `text-xs` is the live half of it:
 * `textarea.tsx` keeps its own `md:text-sm` as a utility precisely so this
 * class keeps losing to it above 48rem, which is why the editor renders at 14px
 * on desktop and 12px below (`textarea.tsx`, `CONTESTED_CLASSES`).
 */
const SECTION_CLASSES = 'space-y-2'
const LIST_CLASSES = 'divide-y'
const TEXTAREA_CLASSES = 'font-mono text-xs min-h-48'

const styles = stylex.create({
  // `border rounded-md`
  list: {
    // `border`: the width and the style only. The colour keeps coming from the
    // `*` rule in `@layer base`, which no StyleX layer contests.
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: radius.md,
  },

  // `w-full flex items-center gap-2 px-3 py-2 text-sm text-left
  //  hover:bg-muted/50 transition-colors`
  row: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '0.5rem',
    paddingInline: '0.75rem',
    paddingBlock: '0.5rem',
    textAlign: 'left',
    // A row renders one icon and one `text-xs` span, both with a size of their
    // own, so the paired line height is written as the length it resolves to.
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': MUTED_50 },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },

  // `bg-muted/50` on the open row. The hover branch is restated because
  // `stylex.props` keeps only the last object's entry for a property, with all
  // of its conditions (`conventions.md`).
  rowSelected: {
    backgroundColor: {
      default: MUTED_50,
      '@media (hover: hover)': { default: MUTED_50, ':hover': MUTED_50 },
    },
  },

  // `size-4 text-muted-foreground shrink-0`
  icon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    color: colors.mutedForeground,
  },

  // `font-mono text-xs`
  fileName: {
    fontFamily: fonts.mono,
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `px-3 pb-3`
  editor: {
    // `px-*` is logical and `pb-*` physical, as Tailwind writes each of them.
    paddingInline: '0.75rem',
    paddingBottom: '0.75rem',
  },
})

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'md') return FileTextIcon
  return FileIcon
}

interface SkillDetailResourceFilesProps {
  skillId: string
  files: string[]
  fileDrafts: Record<string, string>
  loadedFileContentsRef: { current: Record<string, string> }
  onFileDraftChange: (file: string, content: string) => void
}

export function SkillDetailResourceFiles({
  skillId,
  files,
  fileDrafts,
  loadedFileContentsRef,
  onFileDraftChange,
}: SkillDetailResourceFilesProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const list = stylex.props(styles.list)

  const { data: selectedFileData } = useSkillFile(skillId, selectedFile)

  // Cache original content for change detection in the parent form hook
  if (
    selectedFile &&
    selectedFileData?.content !== undefined &&
    !(selectedFile in loadedFileContentsRef.current)
  ) {
    loadedFileContentsRef.current[selectedFile] = selectedFileData.content
  }

  return (
    <div className={SECTION_CLASSES}>
      <Label>Resource files</Label>
      <div className={cn(LIST_CLASSES, list.className)} style={list.style}>
        {files.map((file) => {
          const Icon = getFileIcon(file)
          const isSelected = selectedFile === file
          return (
            <div key={file}>
              <button
                type="button"
                onClick={() => setSelectedFile(isSelected ? null : file)}
                {...stylex.props(styles.row, isSelected && styles.rowSelected)}
              >
                <Icon {...stylex.props(styles.icon)} />
                <span {...stylex.props(styles.fileName)}>{file}</span>
              </button>
              {isSelected && (
                <div {...stylex.props(styles.editor)}>
                  <Textarea
                    value={fileDrafts[file] ?? selectedFileData?.content ?? ''}
                    onChange={(e) => onFileDraftChange(file, e.target.value)}
                    className={TEXTAREA_CLASSES}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
