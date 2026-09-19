/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Mounts the test-only component gallery route. Never set in a shipped build. */
  readonly VITE_VISUAL_GALLERY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
