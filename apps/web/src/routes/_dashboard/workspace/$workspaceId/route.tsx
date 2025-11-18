import { createFileRoute, Outlet } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
import { CreateNewChannel } from "./_components/CreateNewChannel";
import { ChannelList } from "./_components/ChannelList";
import { MembersList } from "./_components/MembersList";
import { WorkspaceHeader } from "./_components/WorkspaceHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Route = createFileRoute("/_dashboard/workspace/$workspaceId")({
  component: WorkspaceLayout,
  beforeLoad: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      orpc.channel.listByWorkspace.queryOptions({
        input: { workspaceId: params.workspaceId },
      })
    );
  },
});

function WorkspaceLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r bg-muted/10">
        {/* Workspace Header */}
        <div className="flex h-14 shrink-0 items-center border-b px-4">
          <WorkspaceHeader />
        </div>

        {/* Main Content - Channels (Takes available space) */}
        <ScrollArea className="flex-1 py-4">
          {/* Add Channel Action */}
          <div className="px-2 mb-6">
            <CreateNewChannel />
          </div>

          {/* Channels Section */}
          <div className="mb-2">
            <Collapsible defaultOpen className="group/channels">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between px-4 mb-1 group cursor-pointer select-none">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                    Main
                  </h3>
                  <ChevronRight className="size-3 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]/channels:rotate-90" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ChannelList />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        {/* Members Section - Pinned to Bottom */}
        <div className="shrink-0 border-t bg-muted/5 py-4 max-h-[40vh] flex flex-col">
          <Collapsible defaultOpen className="group/members flex flex-col min-h-0">
            <CollapsibleTrigger asChild>
              <div className="px-4 mb-2 flex items-center justify-between group cursor-pointer shrink-0 select-none">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                  Members
                </h3>
                <ChevronRight className="size-3 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]/members:rotate-90" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <ScrollArea className="h-full max-h-[30vh] px-2">
                <MembersList />
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        <Outlet />
      </div>
    </div>
  );
}