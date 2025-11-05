import { createFileRoute, Outlet } from "@tanstack/react-router";
import { WorkspaceList } from "../_components/WorkspaceList";
import { CreateWorkspace } from "../_components/CreateWorkspace";

export const Route = createFileRoute("/_dashboard/workspace")({
  component: WorkspaceLayout,
});
function WorkspaceLayout() {
  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 flex-col items-center bg-secondary py-3 px-2 border-r border-border">
        <WorkspaceList/>
        <div className="mt-4">
            <CreateWorkspace/>
        </div>
      </div>
    </div>
  );
}
