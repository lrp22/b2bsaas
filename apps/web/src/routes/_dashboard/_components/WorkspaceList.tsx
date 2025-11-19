import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { CreateWorkspace } from "./CreateWorkspace";

// Color generator
const COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
  "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
  "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-pink-500", 
  "bg-rose-500"
];

const getWorkspaceColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash % COLORS.length)];
};

export function WorkspaceList() {
  const params = useParams({ strict: false });
  const currentWorkspaceId = (params as any)?.workspaceId;

  const { data } = useSuspenseQuery(
    orpc.workspace.list.queryOptions()
  );
  const workspaces = data.workspaces;

  return (
    <nav className="flex flex-col items-center gap-3 py-4 w-full">
      <TooltipProvider delayDuration={0}>
        {workspaces.map((workspace) => {
          const isActive = currentWorkspaceId === workspace.id;
          const colorClass = getWorkspaceColor(workspace.id);

          return (
            <Link
              key={workspace.id}
              to="/workspace/$workspaceId"
              params={{ workspaceId: workspace.id }}
              className="contents"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      // Base styles matching CreateWorkspace dimensions
                      "flex items-center justify-center size-12 rounded-xl transition-all duration-200 overflow-hidden cursor-pointer text-white shadow-sm hover:shadow-md",
                      // Hover effect
                      "hover:rounded-lg",
                      // Dynamic Color
                      colorClass,
                      // Active State Ring
                      isActive && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                    )}
                  >
                    <span className="font-bold text-xl leading-none select-none">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium ml-2 z-50">
                  {workspace.name}
                </TooltipContent>
              </Tooltip>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-8 h-px bg-border my-1" />

        {/* Single Create Workspace Button */}
        <div className="flex justify-center w-full">
          <CreateWorkspace />
        </div>
      </TooltipProvider>
    </nav>
  );
}