import { createFileRoute, Outlet } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
import { WorkspaceHeader } from "./_components/WorkspaceHeader";
import { CreateNewChannel } from "./_components/CreateNewChannel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { ChannelList } from "./_components/ChannelList";

export const Route = createFileRoute("/_dashboard/workspace/$workspaceId")({
  component: WorkspaceLayout,
  loader: async ({ context }) => {
    // Changed from getAll to list to match the router method
    await context.queryClient.prefetchQuery(orpc.workspace.list.queryOptions());
  },
});

function WorkspaceLayout() {
  return (
    <>
      <div className="flex h-full w-80 flex-col bg-secondary border-r border-border">
        <div className="flex items-center px-4 h-14 border-b border-boder">
          <WorkspaceHeader />
        </div>
        <div className="px-4 py-2"></div>
          <CreateNewChannel/>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
					<Collapsible>
						<CollapsibleTrigger className="[&[data-state=open]>svg]:rotate-90 flex items-center w-full justify-between px-2 py-1 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
							Main
							<ChevronRight className="size-4 transition-transform duration-200" />
						</CollapsibleTrigger>

						<CollapsibleContent>
							<ChannelList />
						</CollapsibleContent>
					</Collapsible>
				</div>
      <Outlet />
    </>
  );
}
