import { createFileRoute, Outlet } from "@tanstack/react-router";
import { WorkspaceList } from "../_components/WorkspaceList";
import { CreateWorkspace } from "../_components/CreateWorkspace";
import UserMenu from "@/components/user-menu";
import { orpc } from "@/utils/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export const Route = createFileRoute("/_dashboard/workspace")({
  component: WorkspaceLayout,
});
function WorkspaceLayout = async () => {

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.workspace.list.queryOptions())

  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 flex-col items-center bg-secondary py-3 px-2 border-r border-border">
      <HydrateClient client={queryClient}>
      <WorkspaceList/>
      </HydrateClient>
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
