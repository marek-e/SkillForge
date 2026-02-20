import { z } from 'zod'

export const SkillSourceSchema = z.enum(['manual', 'imported'])
export type SkillSource = z.infer<typeof SkillSourceSchema>

export const SourceToolSchema = z.enum(['cursor', 'claude', 'openai', 'gemini', 'generic'])
export type SourceTool = z.infer<typeof SourceToolSchema>

export const SkillScopeSchema = z.enum(['general', 'project-specific'])
export type SkillScope = z.infer<typeof SkillScopeSchema>

export const SkillSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string(),
  body: z.string().optional(),
  frontmatter: z.record(z.string(), z.string()).optional(),
  inputSchema: z.record(z.string(), z.unknown()).optional(),
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  implementationRef: z.string().optional(),
  source: SkillSourceSchema,
  originalTool: SourceToolSchema.optional(),
  tags: z.array(z.string()).default([]),
  scope: SkillScopeSchema.default('general'),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Skill = z.infer<typeof SkillSchema>

export const CreateSkillSchema = SkillSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateSkill = z.infer<typeof CreateSkillSchema>
