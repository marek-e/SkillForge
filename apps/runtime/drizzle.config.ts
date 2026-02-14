import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/store/schema.ts',
  dialect: 'sqlite',
  out: './drizzle',
})
