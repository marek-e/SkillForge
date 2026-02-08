import type { ToolStatus, ClaudeCodeCommand, ClaudeCodeSkill, CursorSkill } from '@skillforge/core'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'
import { TerminalIcon, WrenchIcon, MousePointer2Icon, type LucideIcon } from 'lucide-react'

type SkillItem = ClaudeCodeSkill | CursorSkill

interface ToolCardProps {
  tool: ToolStatus
  icon?: LucideIcon
  displayName?: string
  commands?: ClaudeCodeCommand[]
  skills?: SkillItem[]
  showCommands?: boolean
}

function isBuiltInSkill(skill: SkillItem): skill is CursorSkill {
  return 'isBuiltIn' in skill && skill.isBuiltIn
}

export function ToolCard({
  tool,
  icon: Icon = TerminalIcon,
  displayName,
  commands = [],
  skills = [],
  showCommands = true,
}: ToolCardProps) {
  const name = displayName || tool.name
  const defaultTab = showCommands ? 'commands' : 'skills'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5" />
          {name}
        </CardTitle>
        <CardDescription>{tool.detected ? tool.paths.globalDir : 'Not detected'}</CardDescription>
        <CardAction>
          <Badge variant={tool.detected ? 'default' : 'secondary'}>
            {tool.detected ? 'Ready' : 'Not Detected'}
          </Badge>
        </CardAction>
      </CardHeader>

      {tool.detected && (
        <CardContent>
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              {showCommands && (
                <TabsTrigger value="commands">Commands ({commands.length})</TabsTrigger>
              )}
              <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
            </TabsList>

            {showCommands && (
              <TabsContent value="commands">
                {commands.length === 0 ? (
                  <p className="text-muted-foreground py-4">No commands found</p>
                ) : (
                  <Accordion type="single" collapsible className="mt-2">
                    {commands.map((cmd) => (
                      <AccordionItem key={cmd.name} value={cmd.name}>
                        <AccordionTrigger>
                          <span className="flex items-center gap-2">
                            <TerminalIcon className="size-4 text-muted-foreground" />
                            <code className="text-sm font-mono">/{cmd.name}</code>
                            <span className="text-muted-foreground">- {cmd.description}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-6">
                            {cmd.allowedTools && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Tools:</span>{' '}
                                {cmd.allowedTools}
                              </p>
                            )}
                            {cmd.argumentHint && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Args:</span>{' '}
                                <code>{cmd.argumentHint}</code>
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">{cmd.filePath}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            )}

            <TabsContent value="skills">
              {skills.length === 0 ? (
                <p className="text-muted-foreground py-4">No skills found</p>
              ) : (
                <Accordion type="single" collapsible className="mt-2">
                  {skills.map((skill) => (
                    <AccordionItem key={skill.name} value={skill.name}>
                      <AccordionTrigger>
                        <span className="flex items-center gap-2">
                          <WrenchIcon className="size-4 text-muted-foreground" />
                          <span className="font-medium">{skill.name}</span>
                          {isBuiltInSkill(skill) && (
                            <Badge variant="outline" className="text-xs">
                              Built-in
                            </Badge>
                          )}
                          <span className="text-muted-foreground">- {skill.description}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-6">
                          <p className="text-xs text-muted-foreground">{skill.filePath}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}

// Pre-configured tool cards
export function ClaudeCodeCard({
  tool,
  commands,
  skills,
}: {
  tool: ToolStatus
  commands?: ClaudeCodeCommand[]
  skills?: ClaudeCodeSkill[]
}) {
  return (
    <ToolCard
      tool={tool}
      icon={TerminalIcon}
      displayName="Claude Code"
      commands={commands}
      skills={skills}
      showCommands={true}
    />
  )
}

export function CursorCard({ tool, skills }: { tool: ToolStatus; skills?: CursorSkill[] }) {
  return (
    <ToolCard
      tool={tool}
      icon={MousePointer2Icon}
      displayName="Cursor"
      skills={skills}
      showCommands={false}
    />
  )
}
