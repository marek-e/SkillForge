import { createRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { rootRoute } from "./__root";
import { api } from "../api/client";
import { ToolCardCompact } from "../components/ToolCardCompact";
import { ErrorContainer } from "../components/ErrorContainer";
import { H1 } from "../components/typography";
import { Lead } from "../components/typography";
import { Skeleton } from "../components/ui/skeleton";

function HomePage() {
  const {
    data: tools,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tools"],
    queryFn: api.tools.list,
  });

  if (error) {
    return (
      <ErrorContainer
        title="Failed to load tools"
        message={(error as Error).message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const connectedCount = tools?.filter((t) => t.detected).length ?? 0;
  const totalSkills = tools?.reduce((sum, t) => sum + t.skillCount, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <H1>Your AI Tools</H1>
        <Lead>Visualize, manage, and normalize agent skills across tools.</Lead>
        {tools && (
          <p className="text-sm text-muted-foreground">
            {connectedCount} connected · {totalSkills} total skill
            {totalSkills !== 1 && "s"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-wrap justify-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-36 w-full rounded-xl sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {tools?.map((tool) => (
            <div
              key={tool.name}
              className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
            >
              <ToolCardCompact tool={tool} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
