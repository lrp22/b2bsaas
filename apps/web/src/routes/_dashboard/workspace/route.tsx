import { createFileRoute, Outlet } from "@tanstack/react-router";
import { WorkspaceList } from "../_components/WorkspaceList";
import { CreateWorkspace } from "../_components/CreateWorkspace";
import UserMenu from "@/components/user-menu";
import { orpc } from "@/utils/orpc";
import { getQueryClient } from "@/lib/query/hydration";;

export const Route = createFileRoute("/_dashboard/workspace")({
  component: WorkspaceLayout,
  // --- FIX STARTS HERE ---
  // This loader function runs on the server before the page is rendered
  loader: async ({ context }) => {
    // We pre-fetch the workspace data. The page will not render
    // until this data is fetched.
    await context.queryClient.prefetchQuery(orpc.workspace.getAll.queryOptions());
  },
  // --- FIX ENDS HERE ---
});

function WorkspaceLayout() {
  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 flex-col items-center bg-secondary py-3 px-2 border-r border-border">
        <WorkspaceList/>
        <div className="mt-4">
            <CreateWorkspace/>
        </div>
        <div className="mt-auto">
          <UserMenu/>
        </div>
      </div>
      <Outlet/>
    </div>
  );
}
