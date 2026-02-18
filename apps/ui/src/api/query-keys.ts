export const queryKeys = {
  health: () => ['health'] as const,
  agents: {
    all: () => ['agents'] as const,
    lists: () => ['agents', 'list'] as const,
    detail: (id: string) => ['agents', 'detail', id] as const,
  },
  skills: {
    all: () => ['skills'] as const,
    lists: () => ['skills', 'list'] as const,
    detail: (id: string) => ['skills', 'detail', id] as const,
  },
  projects: {
    all: () => ['projects'] as const,
    lists: () => ['projects', 'list'] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  tools: {
    all: () => ['tools'] as const,
    lists: () => ['tools', 'list'] as const,
    detail: (name: string) => ['tools', 'detail', name] as const,
    commands: (name: string) => ['tools', 'commands', name] as const,
    skills: (name: string) => ['tools', 'skills', name] as const,
  },
} as const
