import path from 'path'
import stylex from '@stylexjs/unplugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' skillforge: http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

export default defineConfig({
  plugins: [
    // StyleX must run before the React plugin: it needs the untransformed
    // `stylex.create` calls. `useCSSLayers` makes it emit `@layer priorityN`
    // blocks whose order is declared in `src/index.css`, which puts StyleX
    // between Tailwind's `base` and `utilities` layers.
    //
    // `before`/`after` make StyleX repeat that full order in its own output, so
    // the cascade is identical whether StyleX CSS is parsed before `index.css`
    // (the dev `<link>` the plugin injects) or after it (the production bundle).
    stylex.vite({
      // The compiler resolves `defineVars`/`defineConsts` through the *import
      // path*, with its own resolver, which knows nothing about Vite's
      // `resolve.alias`. Without these two options
      // `import … from '@/styles/tokens.stylex'` fails to compile ("Could not
      // resolve the path to the imported file"). `rootDir` is pinned rather
      // than left at `process.cwd()` so the hashed variable names do not depend
      // on the directory a command happens to be run from.
      unstable_moduleResolution: { type: 'commonJS', rootDir: __dirname },
      aliases: { '@/*': [path.resolve(__dirname, 'src', '*')] },
      useCSSLayers: {
        before: ['theme', 'base'],
        after: ['components', 'utilities'],
      },
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 4320,
    headers: {
      'Content-Security-Policy': csp,
    },
    watch: {
      // Playwright streams its trace, screencast and result artifacts into
      // `visual/results` while a test runs. Every write reaches Vite's watcher,
      // and the StyleX unplugin answers *any* file change with a
      // `stylex:css-update` message, which makes the page refetch
      // `/virtual:stylex.css`. Left alone, that keeps the network busy and no
      // visual test ever reaches `networkidle`. Vite merges this with its own
      // defaults (`.git`, `node_modules`).
      ignored: [
        '**/visual/results/**',
        '**/visual/report/**',
        '**/test-results/**',
        '**/playwright-report/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
