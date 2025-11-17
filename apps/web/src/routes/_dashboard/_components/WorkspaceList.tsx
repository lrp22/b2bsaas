import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const switchWorkspace = useMutation(
    orpc.workspace.switch.mutationOptions({
      onSuccess: () => {
        toast.success("Switched workspace");
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryOptions().queryKey,
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to switch workspace");
      },
    })
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {workspaces.map((ws) => {
          const isActive = currentWorkspace.id === ws.id;

          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    if (!isActive) {
                      switchWorkspace.mutate({ organizationId: ws.id });
                    }
                  }}
                  className={cn(
                    "size-12 transition-all duration-200",
                    getWorkspaceColor(ws.id),
                    isActive ? "rounded-lg" : "rounded-xl hover:rounded-lg"
                  )}
                  size="icon"
                  disabled={isActive || switchWorkspace.isPending}
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
