import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceHeader() {
  // 1. Get workspaceId from URL params
  const { workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId",
  });

  // 2. Fetch workspace details securely
  const { data: workspace, isLoading } = useQuery(
    orpc.workspace.get.queryOptions({
      input: { id: workspaceId },
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 -ml-2 font-semibold text-lg gap-2 hover:bg-accent/50 h-auto py-1"
        >
          <div className="size-6 bg-primary rounded-md flex items-center justify-center text-xs text-primary-foreground font-bold">
            {workspace?.name?.[0]?.toUpperCase()}
          </div>
          <span className="truncate max-w-[140px]">{workspace?.name}</span>
          <ChevronDown className="size-4 text-muted-foreground/50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem disabled>Settings (Coming Soon)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
