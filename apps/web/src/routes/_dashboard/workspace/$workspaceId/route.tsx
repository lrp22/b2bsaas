//
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
import { CreateNewChannel } from "./_components/CreateNewChannel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { ChannelList } from "./_components/ChannelList";
import { MembersList } from "./_components/MembersList";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

// A new component to display the workspace name, keeping our layout clean.
function WorkspaceHeader() {
  const { data: workspaceInfo, isLoading } = useQuery(
    orpc.workspace.list.queryOptions()
  );

  if (isLoading) {
    return <Skeleton className="h-6 w-3/4" />;
  }

  return (
    <h2 className="text-xl font-bold truncate">
      {workspaceInfo?.currentWorkspace?.name}
    </h2>
  );
}

export const Route = createFileRoute("/_dashboard/workspace/$workspaceId")({
  component: WorkspaceLayout,
  beforeLoad: async ({ params }) => {
    // Session check is still important
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }

    // You can add a loader here later to pre-fetch channels if you want
    // For now, the session check is enough.
  },
});

function WorkspaceLayout() {
  return (
    // Main flex container for the whole screen
    <div className="flex h-screen overflow-hidden">
      {/* Secondary Sidebar ("The Gray Box") */}
      <div className="w-72 bg-secondary flex flex-col p-4 border-r">
        <WorkspaceHeader />

        <hr className="my-4" />

        {/* Channels Section */}
        <Collapsible defaultOpen className="flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
              Channels
              <ChevronRight className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
            </CollapsibleTrigger>
            <CreateNewChannel />
          </div>
          <CollapsibleContent className="flex-grow overflow-y-auto">
            <ChannelList />
          </CollapsibleContent>
        </Collapsible>

        {/* Members Section */}
        <Collapsible defaultOpen className="flex-shrink-0">
          <CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground mt-4">
            Members
            <ChevronRight className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 overflow-y-auto max-h-48">
            <MembersList />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* The content from index.tsx will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}
