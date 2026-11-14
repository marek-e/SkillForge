import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as stylex from '@stylexjs/stylex'
import { motion } from '@/styles/tokens.stylex'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const styles = stylex.create({
  icon: {
    width: '1.2rem',
    height: '1.2rem',
    transitionProperty: 'all',
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
  },
  sun: {
    scale: { default: '100% 100%', ':is(.dark *)': '0% 0%' },
    // Keep the zero angle explicit; the CSS optimizer otherwise changes it to none.
    rotate: { default: 'var(--shell-zero-rotation, 0deg)', ':is(.dark *)': '-90deg' },
  },
  moon: {
    position: 'absolute',
    scale: { default: '0% 0%', ':is(.dark *)': '100% 100%' },
    rotate: { default: '90deg', ':is(.dark *)': 'var(--shell-zero-rotation, 0deg)' },
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
})

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun {...stylex.props(styles.icon, styles.sun)} />
          <Moon {...stylex.props(styles.icon, styles.moon)} />
          <span {...stylex.props(styles.srOnly)}>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
