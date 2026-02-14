import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  inputSchema: text('input_schema'),
  outputSchema: text('output_schema'),
  implementationRef: text('implementation_ref'),
  source: text('source').notNull(),
  originalTool: text('original_tool'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sourceTool: text('source_tool').notNull(),
  enabledSkills: text('enabled_skills').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
