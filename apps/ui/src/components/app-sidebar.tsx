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
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
              <img src="/logo.svg" alt="SkillForge" className="size-6" />
            </div>
            <span className="font-semibold font-serif text-lg group-data-[collapsible=icon]:hidden">
              SkillForge
            </span>
          </Link>
        </div>
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
