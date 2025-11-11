import { createFileRoute, Outlet } from "@tanstack/react-router";
import { WorkspaceList } from "../_components/WorkspaceList";
import { CreateWorkspace } from "../_components/CreateWorkspace";
import UserMenu from "@/components/user-menu";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_dashboard/workspace")({
  component: WorkspaceLayout,
  loader: async ({ context }) => {
    // Changed from getAll to list to match the router method
    await context.queryClient.prefetchQuery(orpc.workspace.list.queryOptions());
  },
});

function WorkspaceLayout() {
  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 flex-col items-center bg-secondary py-3 px-2 border-r border-border">
        <WorkspaceList />
        <div className="mt-4">
          <CreateWorkspace />
        </div>
        <div className="mt-auto">
          <UserMenu />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
