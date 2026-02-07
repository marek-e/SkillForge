import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Skill } from '@skillforge/core'

export function SkillList() {
  const {
    data: skills,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['skills'],
    queryFn: api.skills.list,
  })

  if (isLoading) return <div className="text-muted-foreground">Loading skills...</div>
  if (error) return <div className="text-destructive">Error: {(error as Error).message}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Skills</h2>
      <div className="grid gap-4">
        {skills?.map((skill: Skill) => (
          <div key={skill.id} className="bg-card p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-lg">{skill.name}</h3>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
            <p className="text-sm text-muted-foreground">Source: {skill.source}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
