import type { Agent, Skill } from '@skillforge/core'
import { randomUUID } from 'crypto'

const agents: Map<string, Agent> = new Map()
const skills: Map<string, Skill> = new Map()

// Seed with sample data
const sampleSkill: Skill = {
  id: randomUUID(),
  name: 'file-read',
  description: 'Read contents of a file from the filesystem',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path to read' },
    },
    required: ['path'],
  },
  source: 'manual',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
skills.set(sampleSkill.id, sampleSkill)

const sampleAgent: Agent = {
  id: randomUUID(),
  name: 'Default Agent',
  sourceTool: 'generic',
  enabledSkills: [{ skillId: sampleSkill.id, enabled: true }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
agents.set(sampleAgent.id, sampleAgent)

export const store = {
  agents: {
    getAll: () => Array.from(agents.values()),
    getById: (id: string) => agents.get(id),
    create: (agent: Agent) => {
      agents.set(agent.id, agent)
      return agent
    },
    update: (id: string, updates: Partial<Agent>) => {
      const existing = agents.get(id)
      if (!existing) return null
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
      agents.set(id, updated)
      return updated
    },
    delete: (id: string) => agents.delete(id),
  },
  skills: {
    getAll: () => Array.from(skills.values()),
    getById: (id: string) => skills.get(id),
    create: (skill: Skill) => {
      skills.set(skill.id, skill)
      return skill
    },
    update: (id: string, updates: Partial<Skill>) => {
      const existing = skills.get(id)
      if (!existing) return null
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
      skills.set(id, updated)
      return updated
    },
    delete: (id: string) => skills.delete(id),
  },
}
