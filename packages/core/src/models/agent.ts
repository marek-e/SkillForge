import { z } from 'zod'
import { SourceToolSchema } from './skill'

export const SkillRefSchema = z.object({
  skillId: z.uuid(),
  enabled: z.boolean().default(true),
})
export type SkillRef = z.infer<typeof SkillRefSchema>

export const AgentSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  sourceTool: SourceToolSchema,
  enabledSkills: z.array(SkillRefSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Agent = z.infer<typeof AgentSchema>

export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateAgent = z.infer<typeof CreateAgentSchema>
