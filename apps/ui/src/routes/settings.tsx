import { createRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { rootRoute } from './__root'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MonitorIcon, SunIcon, MoonIcon } from 'lucide-react'
import { H1, Lead } from '@/components/typography'
import { KNOWN_EDITORS, getDefaultEditor, setDefaultEditor } from '@/lib/editor-settings'

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

function SettingsPage() {
  const { theme = 'system', setTheme } = useTheme()
  const [defaultEditor, setEditor] = useState(() => getDefaultEditor())

  return (
    <div className="space-y-6">
      <div>
        <H1>Settings</H1>
        <Lead>Manage your application preferences.</Lead>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Default Editor</Label>
          <p className="text-sm text-muted-foreground">
            The editor used when opening projects. Can be overridden per project.
          </p>
        </div>
        <Select
          value={defaultEditor}
          onValueChange={(v) => {
            setDefaultEditor(v)
            setEditor(v)
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KNOWN_EDITORS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Color Mode</Label>
          <p className="text-sm text-muted-foreground">Choose how SkillForge appears to you.</p>
        </div>

        <RadioGroup value={theme} onValueChange={setTheme} className="grid-cols-3">
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex-1 cursor-pointer flex items-center gap-2">
              <MonitorIcon className="size-4" />
              <div>
                <div className="font-medium">System</div>
                <div className="text-sm text-muted-foreground">Match your system preference</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex-1 cursor-pointer flex items-center gap-2">
              <SunIcon className="size-4" />
              <div>
                <div className="font-medium">Light</div>
                <div className="text-sm text-muted-foreground">Light mode</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex-1 cursor-pointer flex items-center gap-2">
              <MoonIcon className="size-4" />
              <div>
                <div className="font-medium">Dark</div>
                <div className="text-sm text-muted-foreground">Dark mode</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
