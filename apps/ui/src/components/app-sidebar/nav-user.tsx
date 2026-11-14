import * as stylex from '@stylexjs/stylex'
import { colors, radius } from '@/styles/tokens.stylex'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  ChevronsUpDownIcon,
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
} from 'lucide-react'

const ACTIVE =
  ':is(:where([data-state="active"]), :where([data-active]:not([data-active="false"])))'

const styles = stylex.create({
  menuButton: {
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccent },
      ':active': colors.sidebarAccent,
      [ACTIVE]: colors.sidebarAccent,
      '[data-state="open"]': colors.sidebarAccent,
    },
    color: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.sidebarAccentForeground },
      ':active': colors.sidebarAccentForeground,
      [ACTIVE]: colors.sidebarAccentForeground,
      '[data-state="open"]': colors.sidebarAccentForeground,
    },
  },
  avatar: { width: '2rem', height: '2rem', borderRadius: radius.lg },
  avatarFallback: { borderRadius: radius.lg },
  userText: {
    display: 'grid',
    flex: '1',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: 1.25,
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  email: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  chevron: { marginLeft: 'auto', width: '1rem', height: '1rem' },
  content: {
    width: 'var(--radix-dropdown-menu-trigger-width)',
    minWidth: '14rem',
    borderRadius: radius.lg,
  },
  label: { padding: '0rem', fontWeight: 400 },
  labelContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingInline: '0.25rem',
    paddingBlock: '0.375rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" sx={styles.menuButton}>
              <Avatar sx={styles.avatar}>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback sx={styles.avatarFallback}>CN</AvatarFallback>
              </Avatar>
              <div {...stylex.props(styles.userText)}>
                <span {...stylex.props(styles.name)}>{user.name}</span>
                <span {...stylex.props(styles.email)}>{user.email}</span>
              </div>
              <ChevronsUpDownIcon {...stylex.props(styles.chevron)} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sx={styles.content}
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel sx={styles.label}>
              <div {...stylex.props(styles.labelContent)}>
                <Avatar sx={styles.avatar}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback sx={styles.avatarFallback}>CN</AvatarFallback>
                </Avatar>
                <div {...stylex.props(styles.userText)}>
                  <span {...stylex.props(styles.name)}>{user.name}</span>
                  <span {...stylex.props(styles.email)}>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparklesIcon />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
