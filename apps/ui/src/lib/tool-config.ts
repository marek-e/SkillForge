export interface ToolConfig {
  displayName: string
  logo: string
  accent: string
  invert?: boolean
  url?: string
}

const toolConfig: Record<string, ToolConfig> = {
  'claude-code': {
    displayName: 'Claude Code',
    logo: '/tools/claude-color.svg',
    accent: 'bg-orange-500/15',
    invert: false,
    url: 'https://claude.com/product/claude-code',
  },
  cursor: {
    displayName: 'Cursor',
    logo: '/tools/cursor.svg',
    accent: 'bg-blue-500/15',
    invert: true,
    url: 'https://cursor.com/download',
  },
  codex: {
    displayName: 'Codex',
    logo: '/tools/openai.svg',
    accent: 'bg-purple-500/15',
    invert: true,
    url: 'https://developers.openai.com/codex/cli',
  },
  'gemini-cli': {
    displayName: 'Gemini CLI',
    logo: '/tools/gemini-color.svg',
    accent: 'bg-cyan-500/15',
    invert: false,
    url: 'https://geminicli.com/',
  },
  opencode: {
    displayName: 'OpenCode',
    logo: '/tools/opencode-logo-light.svg',
    accent: 'bg-green-500/15',
    invert: true,
    url: 'https://opencode.ai/',
  },
}

export const ALL_TOOL_NAMES = Object.keys(toolConfig)

export function getToolConfig(name: string): ToolConfig {
  return (
    toolConfig[name] ?? {
      displayName: name,
      logo: '',
      accent: 'bg-muted',
      invert: false,
      url: undefined,
    }
  )
}
