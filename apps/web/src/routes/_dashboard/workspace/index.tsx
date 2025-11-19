import { createFileRoute, redirect } from "@tanstack/react-router";
import { CreateWorkspace } from "../_components/CreateWorkspace";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/_dashboard/workspace/")({
  loader: async ({ context }) => {
    // FIX: Use queryClient.fetchQuery + queryOptions
    const { workspaces } = await context.queryClient.fetchQuery(
      context.orpc.workspace.list.queryOptions()
    );

    // Redirect if workspaces exist
    if (workspaces.length > 0) {
      throw redirect({
        to: "/workspace/$workspaceId",
        params: { workspaceId: workspaces[0].id },
      });
    }

    return { workspaces };
  },
  component: WorkspaceIndex,
});

function WorkspaceIndex() {
  return (
    <div className="h-full flex-1 flex flex-col items-center justify-center bg-muted/10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <LayoutGrid className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No Workspaces</EmptyTitle>
          <EmptyDescription>
            You haven't created any workspaces yet. Create one to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateWorkspace />
        </EmptyContent>
      </Empty>
    </div>
  );
}
