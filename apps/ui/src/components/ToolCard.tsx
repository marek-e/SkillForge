import * as stylex from '@stylexjs/stylex'
import type { ToolStatus, ClaudeCodeCommand, CursorSkill, SkillItem } from '@skillforge/core'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'
import { TerminalIcon, WrenchIcon, type LucideIcon } from 'lucide-react'
import { colors, fonts } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `size-5`
  titleIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  // `text-muted-foreground py-4`; `py-4` is `padding-block`, as Tailwind writes
  // it, so a physical `pt-*`/`pb-*` keeps resolving over it.
  emptyText: {
    color: colors.mutedForeground,
    paddingBlock: '1rem',
  },
  // `flex items-center gap-2`
  itemLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // `size-4`
  itemIcon: {
    width: '1rem',
    height: '1rem',
  },
  // `text-muted-foreground`
  muted: {
    color: colors.mutedForeground,
  },
  // `text-sm font-mono`. The paired line height is written as the length it
  // resolves to; it is the same 20px the inherited `calc(1.25 / 0.875)` ratio
  // produces here, because the element's own font size is `text-sm`'s.
  commandName: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontFamily: fonts.mono,
  },
  // `font-medium`
  skillName: {
    fontWeight: 500,
  },
  // `space-y-2 pl-6`.
  //
  // `space-y-*` is a child rule (`:where(& > :not(:last-child))`), and the
  // children are the paragraphs below, which this file renders. Tailwind emits
  // both margins, the start one at zero (`tailwind-values.md` §7).
  //
  // They keep losing to `AccordionContent`'s `[&_p:not(:last-child)]:mb-4`, as
  // they did before: that rule is a utility, and a utility outranks a StyleX
  // rule in a `priorityN` layer whatever the selector. (The compiler emits
  // these two as the physical `margin-top`/`margin-bottom` rather than the
  // block-logical pair Tailwind writes, which changes nothing here — the
  // utility wins either way, and the 16px gap between command rows is
  // unchanged and pre-existing.)
  detailList: {
    paddingLeft: '1.5rem',
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },
  // `text-sm`; same length-versus-ratio note as `commandName` — the `<code>`
  // inside inherits it at its own `1em`, which is this font size.
  detailLine: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  // `text-xs text-muted-foreground`
  filePath: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: colors.mutedForeground,
  },
})

/**
 * `text-xs` on the built-in `Badge`, same reason: `Badge` has no `sx` prop
 * (PR 32).
 */

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
        <CardTitle sx={overrideStyles.CARD_TITLE_CLASSES}>
          <Icon {...stylex.props(styles.titleIcon)} />
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
                  <p {...stylex.props(styles.emptyText)}>No commands found</p>
                ) : (
                  <Accordion type="single" collapsible sx={overrideStyles.ACCORDION_CLASSES}>
                    {commands.map((cmd) => (
                      <AccordionItem key={cmd.name} value={cmd.name}>
                        <AccordionTrigger>
                          <span {...stylex.props(styles.itemLabel)}>
                            <TerminalIcon {...stylex.props(styles.itemIcon, styles.muted)} />
                            <code {...stylex.props(styles.commandName)}>/{cmd.name}</code>
                            <span {...stylex.props(styles.muted)}>- {cmd.description}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div {...stylex.props(styles.detailList)}>
                            {cmd.allowedTools && (
                              <p {...stylex.props(styles.detailLine)}>
                                <span {...stylex.props(styles.muted)}>Tools:</span>{' '}
                                {cmd.allowedTools}
                              </p>
                            )}
                            {cmd.argumentHint && (
                              <p {...stylex.props(styles.detailLine)}>
                                <span {...stylex.props(styles.muted)}>Args:</span>{' '}
                                <code>{cmd.argumentHint}</code>
                              </p>
                            )}
                            <p {...stylex.props(styles.filePath)}>{cmd.filePath}</p>
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
                <p {...stylex.props(styles.emptyText)}>No skills found</p>
              ) : (
                <Accordion type="single" collapsible sx={overrideStyles.ACCORDION_CLASSES}>
                  {skills.map((skill) => (
                    <AccordionItem key={skill.name} value={skill.name}>
                      <AccordionTrigger>
                        <span {...stylex.props(styles.itemLabel)}>
                          <WrenchIcon {...stylex.props(styles.itemIcon, styles.muted)} />
                          <span {...stylex.props(styles.skillName)}>{skill.name}</span>
                          {isBuiltInSkill(skill) && (
                            <Badge variant="outline" sx={overrideStyles.BADGE_CLASSES}>
                              Built-in
                            </Badge>
                          )}
                          <span {...stylex.props(styles.muted)}>- {skill.description}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div {...stylex.props(styles.detailList)}>
                          <p {...stylex.props(styles.filePath)}>{skill.filePath}</p>
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

const overrideStyles = stylex.create({
  CARD_TITLE_CLASSES: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  ACCORDION_CLASSES: { marginTop: '0.5rem' },
  BADGE_CLASSES: { fontSize: '0.75rem', lineHeight: '1rem' },
})
