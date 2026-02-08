import { Link, useLocation } from "@tanstack/react-router";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BotIcon, BookOpenIcon, SettingsIcon } from "lucide-react";
import { ComponentProps } from "react";

const navItems = [
  {
    title: "Agents",
    url: "/agents",
    icon: <BotIcon />,
  },
  {
    title: "Skills",
    url: "/skills",
    icon: <BookOpenIcon />,
  },
];

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link to="/" className="flex items-center">
          <div className="flex items-center justify-center p-1 size-8 group-data-[collapsible=icon]:hover:bg-sidebar-accent rounded-md">
            <img src="/logo.svg" alt="SkillForge" className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-semibold font-serif text-lg truncate">
              SkillForge
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              isActive={location.pathname === "/settings"}
            >
              <Link to="/settings">
                <SettingsIcon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
