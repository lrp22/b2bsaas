import { createFileRoute, Outlet } from "@tanstack/react-router";
import { WorkspaceList } from "../_components/WorkspaceList";
import UserMenu from "@/components/user-menu";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_dashboard/workspace")({
  // FIX: Use the queryClient from context + queryOptions from orpc
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(orpc.workspace.list.queryOptions()),
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Sidebar Navigation */}
      <aside className="flex h-full w-16 flex-col items-center border-r bg-secondary py-3">
        {/* Workspace List (Includes the Add Button) */}
        <WorkspaceList />

        {/* User Menu pinned to bottom */}
        <div className="mt-auto pb-4">
          <UserMenu />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
