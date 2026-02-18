import type { ApiResult } from '@skillforge/core'

function getApiBase(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location?.protocol === 'skillforge:') {
    return `${window.location.origin}/api`
  }
  return 'http://localhost:4321/api'
}

const API_BASE = getApiBase()

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    if (result && 'error' in result && result.error) {
      throw new Error(result.error.message)
    }
    throw new Error(`API error: ${response.statusText}`)
  }
  const result: ApiResult<T> = await response.json()
  if ('error' in result && result.error) {
    throw new Error(result.error.message)
  }
  return result.data as T
}

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`)
  return handleApiResponse<T>(response)
}

export async function mutateApi<T>(
  endpoint: string,
  options: { method: string; body?: unknown }
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  return handleApiResponse<T>(response)
}
