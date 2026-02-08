import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: 'src/main.ts',
    preload: 'src/preload.ts',
  },
  format: ['cjs'],
  outExtension: () => ({ js: '.cjs' }),
  target: 'node24',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['electron'],
  noExternal: [
    '@skillforge/runtime',
    '@skillforge/connectors',
    '@skillforge/core',
    'hono',
    '@hono/node-server',
    'zod',
  ],
})
