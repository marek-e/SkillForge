const VIEW_KEY = 'skillforge:defaultSkillView'

export type SkillViewMode = 'list' | 'grid'

export function getDefaultSkillView(): SkillViewMode {
  return (localStorage.getItem(VIEW_KEY) as SkillViewMode) ?? 'list'
}

export function setDefaultSkillView(value: SkillViewMode): void {
  localStorage.setItem(VIEW_KEY, value)
}
