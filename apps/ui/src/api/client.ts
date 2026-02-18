import { agentsApi } from './agents'
import { healthApi } from './health'
import { projectsApi } from './projects'
import { skillsApi } from './skills'
import { toolsApi } from './tools'

export const api = {
  health: healthApi.check,
  agents: agentsApi,
  skills: skillsApi,
  projects: projectsApi,
  tools: toolsApi,
}

export { queryKeys } from './query-keys'
