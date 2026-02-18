import type { HealthResponse } from '@skillforge/core'
import { fetchApi } from './http'

export const healthApi = {
  check: () => fetchApi<HealthResponse>('/health'),
}
