import { z } from 'zod'

export const DetectedToolSchema = z.object({
  name: z.string(),
  detected: z.boolean(),
})
export type DetectedTool = z.infer<typeof DetectedToolSchema>

export const ProjectSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  path: z.string().min(1),
  iconPath: z.string().nullable(),
  isFavorite: z.boolean(),
  detectedTools: z.array(DetectedToolSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type Project = z.infer<typeof ProjectSchema>

export const CreateProjectSchema = ProjectSchema.pick({
  path: true,
})
export type CreateProject = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = ProjectSchema.pick({
  name: true,
  iconPath: true,
}).partial()
export type UpdateProject = z.infer<typeof UpdateProjectSchema>
