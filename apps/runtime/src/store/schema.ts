import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  body: text('body'),
  frontmatter: text('frontmatter'),
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

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  path: text('path').notNull().unique(),
  iconPath: text('icon_path'),
  preferredEditor: text('preferred_editor'),
  customEditorCmd: text('custom_editor_cmd'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  detectedTools: text('detected_tools').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
