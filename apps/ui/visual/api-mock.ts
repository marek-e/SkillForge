import fs from 'node:fs'
import path from 'node:path'
import type { Page } from '@playwright/test'

/**
 * Deterministic stand-in for the local runtime API (`http://localhost:4321/api`).
 *
 * Every endpoint the UI can call is served from the JSON fixtures in
 * `visual/fixtures/<mode>/`. Nothing here talks to a real runtime, a real
 * database or the real filesystem, so the frozen originals only depend on the
 * fixtures and the UI code.
 */
export type DataMode = 'populated' | 'empty' | 'loading' | 'error'

type FixtureMode = 'populated' | 'empty'

const FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures')

const fixtureCache = new Map<string, unknown>()

function fixture<T>(mode: FixtureMode, name: string): T | undefined {
  const file = path.join(FIXTURE_ROOT, mode, `${name}.json`)
  if (!fixtureCache.has(file)) {
    fixtureCache.set(
      file,
      fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as unknown) : undefined
    )
  }
  return fixtureCache.get(file) as T | undefined
}

interface WithId {
  id: string
}

function byId<T extends WithId>(list: T[] | undefined, id: string): T | null {
  return list?.find((item) => item.id === id) ?? null
}

/** Resolves an `/api`-relative endpoint to the payload that goes inside `{ data }`. */
function resolveEndpoint(mode: FixtureMode, endpoint: string, search: URLSearchParams): unknown {
  const segments = endpoint.split('/').filter(Boolean)

  if (segments[0] === 'health') return fixture(mode, 'health') ?? null

  if (segments[0] === 'agents') {
    const agents = fixture<WithId[]>(mode, 'agents') ?? []
    if (segments.length === 1) return agents
    return byId(agents, segments[1])
  }

  if (segments[0] === 'skills') {
    const skills = fixture<WithId[]>(mode, 'skills') ?? []
    if (segments.length === 1) return skills
    const id = segments[1]
    const detailOverride = fixture<WithId>(mode, 'skill-detail')
    const skill = detailOverride && detailOverride.id === id ? detailOverride : byId(skills, id)
    if (segments.length === 2) return skill
    const files = fixture<Record<string, Record<string, string>>>(mode, 'skill-files') ?? {}
    if (segments[2] === 'content') return { content: files[id]?.['SKILL.md'] ?? '' }
    if (segments[2] === 'directory') {
      const directories =
        fixture<Record<string, { directory: string; files: string[] }>>(mode, 'skill-directory') ??
        {}
      return directories[id] ?? { directory: '', files: [] }
    }
    if (segments[2] === 'file') {
      const requested = search.get('path') ?? ''
      return { content: files[id]?.[requested] ?? '' }
    }
    return null
  }

  if (segments[0] === 'projects') {
    const projects = fixture<WithId[]>(mode, 'projects') ?? []
    if (segments.length === 1) return projects
    const id = segments[1]
    const detailOverride = fixture<WithId>(mode, 'project-detail')
    const project = detailOverride && detailOverride.id === id ? detailOverride : byId(projects, id)
    if (segments.length === 2) return project
    if (segments[2] === 'skills') {
      const bySkillTool =
        fixture<Record<string, Record<string, unknown[]>>>(mode, 'project-skills') ?? {}
      return bySkillTool[id] ?? {}
    }
    if (segments[2] === 'favorite') return project
    return null
  }

  if (segments[0] === 'tools') {
    if (segments.length === 1) return fixture(mode, 'tools') ?? []
    const toolSkills = fixture<Record<string, unknown[]>>(mode, 'tool-skills') ?? {}
    if (segments[2] === 'commands') return fixture(mode, 'claude-code-commands') ?? []
    if (segments[2] === 'skills') return toolSkills[segments[1]] ?? []
    return null
  }

  return null
}

interface ApiTraffic {
  lastRequestAt: number
  requestCount: number
}

const traffic = new WeakMap<Page, ApiTraffic>()

export function apiTraffic(page: Page): ApiTraffic {
  return traffic.get(page) ?? { lastRequestAt: 0, requestCount: 0 }
}

/**
 * Serves every runtime API request from fixtures.
 *
 * - `populated` / `empty`: 200 with `{ data }`
 * - `error`: 500 with `{ error: { message, code } }`
 * - `loading`: the route is never fulfilled, so the UI stays in its pending state
 */
/**
 * Only the runtime origin is intercepted. A `**\/api\/**` glob would also match
 * the dev server's own module URLs such as `/src/api/client.ts`.
 */
const RUNTIME_API = /^https?:\/\/(localhost|127\.0\.0\.1):4321\/api(\/|$)/

export async function installApiMock(page: Page, mode: DataMode): Promise<void> {
  traffic.set(page, { lastRequestAt: Date.now(), requestCount: 0 })

  await page.route(RUNTIME_API, async (route) => {
    const state = traffic.get(page)
    if (state) {
      state.lastRequestAt = Date.now()
      state.requestCount += 1
    }

    if (mode === 'loading') {
      // Deliberately never settled: the UI keeps rendering its pending state.
      return
    }

    if (mode === 'error') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'Fixture runtime is unavailable.', code: 'FIXTURE_ERROR' },
        }),
      })
      return
    }

    const url = new URL(route.request().url())
    const endpoint = url.pathname.slice(url.pathname.indexOf('/api') + '/api'.length)
    const resolved = resolveEndpoint(mode, endpoint, url.searchParams)
    const isMutation = route.request().method() !== 'GET'
    const data = resolved === null && isMutation ? { success: true } : resolved

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    })
  })
}
