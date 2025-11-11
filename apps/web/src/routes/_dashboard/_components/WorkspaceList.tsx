import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

const colorCombinations = [
  "bg-blue-500 hover:bg-blue-600 text-white",
  "bg-emerald-500 hover:bg-emerald-600 text-white",
  "bg-purple-500 hover:bg-purple-600 text-white",
  "bg-amber-500 hover:bg-amber-600 text-white",
  "bg-rose-500 hover:bg-rose-600 text-white",
  "bg-indigo-500 hover:bg-indigo-600 text-white",
  "bg-cyan-500 hover:bg-cyan-600 text-white",
  "bg-pink-500 hover:bg-pink-600 text-white",
];

const getWorkspaceColor = (id: string) => {
  const charSum = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const colorIndex = charSum % colorCombinations.length;

  return colorCombinations[colorIndex];
};

export function WorkspaceList() {
  const {
    data: { workspaces, currentWorspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {workspaces.map((ws) => {
          const isActive = currentWorspace.orgCode === ws.id;
          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    "size-12 transition-all duration-200",
                    getWorkspaceColor(ws.id),
                    isActive ? "rounded-lg" : "rounded-xl hover:rounded-lg"
                  )}
                  size="icon"
                >
                  <span className="text-sm font-semibold">{ws.avatar} </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {ws.name} {isActive && "(Current)"}{" "}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
