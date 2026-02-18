import { agentsStore } from './agents-store'
import { projectsStore } from './projects-store'
import { skillsStore } from './skills-store'

export const store = {
  agents: agentsStore,
  skills: skillsStore,
  projects: projectsStore,
}
