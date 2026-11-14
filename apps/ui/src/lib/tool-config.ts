import * as stylex from '@stylexjs/stylex'
import { colors, palette } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import type { Skill } from '@skillforge/core'

export const originalToolToName: Record<NonNullable<Skill['originalTool']>, string> = {
  claude: 'claude-code',
  cursor: 'cursor',
  openai: 'codex',
  gemini: 'gemini-cli',
  generic: 'opencode',
  copilot: 'copilot',
  vibe: 'vibe',
}

export interface ToolConfig {
  displayName: string
  logo: string
  accent: Sx
  invert?: boolean
  url?: string
}

const accents = stylex.create({
  orange: { backgroundColor: `color-mix(in oklab, ${palette.orange500} 15%, transparent)` },
  pink: { backgroundColor: `color-mix(in oklab, ${palette.pink500} 15%, transparent)` },
  stone: { backgroundColor: `color-mix(in oklab, ${palette.stone500} 15%, transparent)` },
  cyan: { backgroundColor: `color-mix(in oklab, ${palette.cyan500} 15%, transparent)` },
  purple: { backgroundColor: `color-mix(in oklab, ${palette.purple500} 15%, transparent)` },
  green: { backgroundColor: `color-mix(in oklab, ${palette.green500} 15%, transparent)` },
  amber: { backgroundColor: `color-mix(in oklab, ${palette.amber500} 15%, transparent)` },
  muted: { backgroundColor: colors.muted },
})

const toolConfig: Record<string, ToolConfig> = {
  'claude-code': {
    displayName: 'Claude Code',
    logo: '/tools/claude-color.svg',
    accent: accents.orange,
    invert: false,
    url: 'https://claude.com/product/claude-code',
  },
  cursor: {
    displayName: 'Cursor',
    logo: '/tools/cursor.svg',
    accent: accents.pink,
    invert: true,
    url: 'https://cursor.com/download',
  },
  codex: {
    displayName: 'Codex',
    logo: '/tools/openai.svg',
    accent: accents.stone,
    invert: true,
    url: 'https://developers.openai.com/codex/cli',
  },
  'gemini-cli': {
    displayName: 'Gemini CLI',
    logo: '/tools/gemini-color.svg',
    accent: accents.cyan,
    invert: false,
    url: 'https://geminicli.com/',
  },
  opencode: {
    displayName: 'OpenCode',
    logo: '/tools/opencode-logo-light.svg',
    accent: accents.purple,
    invert: true,
    url: 'https://opencode.ai/',
  },
  copilot: {
    displayName: 'Copilot',
    logo: '/tools/github-copilot.svg',
    accent: accents.green,
    invert: true,
    url: 'https://github.com/features/copilot',
  },
  vibe: {
    displayName: 'Mistral Vibe',
    logo: '/tools/mistral-color.svg',
    accent: accents.amber,
    invert: false,
    url: 'https://docs.mistral.ai/mistral-vibe/introduction',
  },
}

export const ALL_TOOL_NAMES = Object.keys(toolConfig)

export function getToolConfig(name: string): ToolConfig {
  return (
    toolConfig[name] ?? {
      displayName: name,
      logo: '',
      accent: accents.muted,
      invert: false,
      url: undefined,
    }
  )
}
