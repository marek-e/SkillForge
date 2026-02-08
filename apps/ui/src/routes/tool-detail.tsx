import { createRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { rootRoute } from "./__root";
import { api } from "../api/client";
import { getToolConfig } from "../components/ToolCardCompact";
import { ToolCard } from "../components/ToolCard";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import type { SkillItem } from "@skillforge/core";

const skillsQueryMap: Record<string, () => Promise<SkillItem[]>> = {
  "claude-code": api.tools.claudeCodeSkills,
  cursor: api.tools.cursorSkills,
  codex: api.tools.codexSkills,
  "gemini-cli": api.tools.geminiCliSkills,
  opencode: api.tools.openCodeSkills,
};

function ToolDetailPage() {
  const { name } = toolDetailRoute.useParams();
  const config = getToolConfig(name);

  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: api.tools.list,
  });

  const { data: commands } = useQuery({
    queryKey: ["tools", name, "commands"],
    queryFn: api.tools.claudeCodeCommands,
    enabled: name === "claude-code",
  });

  const { data: skills } = useQuery({
    queryKey: ["tools", name, "skills"],
    queryFn: skillsQueryMap[name],
    enabled: !!skillsQueryMap[name],
  });

  const tool = tools?.find((t) => t.name === name);

  if (toolsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to tools
        </Link>
        <p className="text-destructive">Tool "{name}" not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            config.accent,
          )}
        >
          <img
            src={config.logo}
            alt={config.displayName}
            className={cn("size-6", config.invert && "dark:invert")}
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {config.displayName}
        </h1>
      </div>

      <ToolCard
        tool={tool}
        displayName={config.displayName}
        commands={commands}
        skills={skills}
        showCommands={name === "claude-code"}
      />
    </div>
  );
}

export const toolDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tools/$name",
  component: ToolDetailPage,
});
