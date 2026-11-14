import type { ClaudeCodeCommand, Project, Skill, SkillItem, ToolStatus } from '@skillforge/core'

/**
 * Inline sample data for the test-only gallery.
 *
 * Kept in step with `visual/fixtures/populated/*.json` so a gallery case and a
 * route case show the same strings.
 */
export const FIXED_DATE = '2025-01-15T10:00:00.000Z'

export const LONG_TEXT =
  'A deliberately long description used to exercise wrapping, clamping and truncation in list rows, grid cards and detail headers. It keeps going past the point where any reasonable card would clip it.'

export const sampleToolDetected: ToolStatus = {
  name: 'claude-code',
  detected: true,
  paths: {
    globalDir: '/Users/fixture/.claude',
    projectDir: '/Users/fixture/projects/alpha/.claude',
  },
  commandCount: 3,
  skillCount: 4,
}

export const sampleToolUndetected: ToolStatus = {
  name: 'gemini-cli',
  detected: false,
  paths: {},
  commandCount: 0,
  skillCount: 0,
}

export const sampleCommands: ClaudeCodeCommand[] = [
  {
    name: 'commit',
    description: 'Create atomic conventional commits ordered by dependency layers',
    allowedTools: 'Bash, Read, Edit',
    argumentHint: '[scope]',
    filePath: '/Users/fixture/.claude/commands/commit.md',
  },
  {
    name: 'verify',
    description: 'Run the full verification pipeline',
    filePath: '/Users/fixture/.claude/commands/verify.md',
  },
]

export const sampleToolSkills: SkillItem[] = [
  {
    name: 'summarize-pull-request',
    description: 'Reads a pull request diff and produces a reviewer-facing summary.',
    filePath: '/Users/fixture/.claude/skills/summarize-pull-request/SKILL.md',
    body: '# Summarize pull request\n',
  },
  {
    name: 'review-diff',
    description: 'Built-in Cursor review skill.',
    filePath: '/Users/fixture/.cursor/skills/review-diff/SKILL.md',
    isBuiltIn: true,
  },
]

export const sampleProject: Project = {
  id: 'project-alpha',
  name: 'Alpha Platform',
  path: '/Users/fixture/projects/alpha',
  iconPath: null,
  preferredEditor: 'cursor',
  customEditorCmd: null,
  isFavorite: true,
  detectedTools: [
    { name: 'claude-code', detected: true },
    { name: 'cursor', detected: true },
    { name: 'codex', detected: false },
  ],
  createdAt: FIXED_DATE,
  updatedAt: FIXED_DATE,
}

export const sampleProjectNoTools: Project = {
  ...sampleProject,
  id: 'project-gamma',
  name: 'Gamma Monorepo With A Deliberately Long Project Name',
  path: '/Users/fixture/projects/gamma/with/a/deliberately/long/nested/path/that/should/truncate',
  isFavorite: false,
  preferredEditor: null,
  detectedTools: [{ name: 'claude-code', detected: false }],
}

export const sampleProjectCustomIcon: Project = {
  ...sampleProject,
  id: 'project-beta',
  name: 'Beta Service',
  path: '/Users/fixture/projects/beta',
  iconPath:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNGY0NmU1Ii8+PC9zdmc+',
  isFavorite: false,
}

export const sampleSkill: Skill = {
  id: 'skill-alpha',
  name: 'summarize-pull-request',
  description: 'Reads a pull request diff and produces a reviewer-facing summary.',
  body: '# Summarize pull request\n',
  implementationRef: '/Users/fixture/.claude/skills/summarize-pull-request/SKILL.md',
  source: 'imported',
  originalTool: 'claude',
  tags: ['review', 'git', 'automation'],
  scope: 'general',
  createdAt: FIXED_DATE,
  updatedAt: FIXED_DATE,
}

export const sampleProjectSkillsByTool: Record<string, SkillItem[]> = {
  'claude-code': [
    {
      name: 'summarize-pull-request',
      description: 'Reads a pull request diff and produces a reviewer-facing summary.',
      filePath: '/Users/fixture/.claude/skills/summarize-pull-request/SKILL.md',
      body: '# Summarize pull request\n',
    },
    {
      name: 'multi-file-skill',
      description: 'A skill whose implementation spans a directory.',
      filePath: '/Users/fixture/.claude/skills/multi-file-skill/SKILL.md',
    },
  ],
  cursor: [
    {
      name: 'write-migration',
      description: 'Generates a reversible SQL migration from a schema diff.',
      filePath: '/Users/fixture/.cursor/skills/write-migration/SKILL.md',
      body: '# Write migration\n',
    },
  ],
}
