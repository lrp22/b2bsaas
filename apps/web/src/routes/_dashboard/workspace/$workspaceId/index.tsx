import { createFileRoute, redirect } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
// We reuse the CreateWorkspace trigger logic here
import { CreateWorkspace } from "../../_components/CreateWorkspace";

export const Route = createFileRoute("/_dashboard/workspace/$workspaceId/")({
  component: WorkspaceListIndexPage,
  // Logic: Redirect to the first workspace if one exists
  beforeLoad: async ({ context }) => {
    try {
      // Fetch user's workspaces
      const workspaces = await context.queryClient.fetchQuery(
        orpc.workspace.list.queryOptions()
      );

      // If they have at least one, go to it immediately
      if (workspaces.length > 0) {
        throw redirect({
          to: "/workspace/$workspaceId",
          params: { workspaceId: workspaces[0].id },
        });
      }
    } catch (e) {
      // Allow the redirect to happen
      if (e instanceof Response || (typeof e === 'object' && e !== null && 'isRedirect' in e)) {
         throw e;
      }
      // If fetch fails or no workspaces, show the empty page below
    }
  },
});

function WorkspaceListIndexPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-muted/10 p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutGrid className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No Workspaces Found</EmptyTitle>
          <EmptyDescription>
            You are not a member of any workspace yet. Create one to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
           {/* Use the CreateWorkspace Dialog but with a big primary button */}
           <CreateWorkspace 
             trigger={
               <Button size="lg">
                 <Plus className="mr-2 size-4" />
                 Create New Workspace
               </Button>
             } 
           />
        </EmptyContent>
      </Empty>
    </div>
  );
}