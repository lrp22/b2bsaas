import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"; // A nice loading state component

export const Route = createFileRoute("/_dashboard/workspace/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  // 1. Fetch the workspace data using the 'list' procedure
  const { data: workspaceInfo, isLoading: isWorkspaceLoading } = useQuery(
    orpc.workspace.list.queryOptions()
  );

  // You can keep this or remove it if not needed on this page
  const { data: privateData } = useQuery(orpc.privateData.queryOptions());

  // 2. While the workspace data is loading, show a nice skeleton UI
  if (isWorkspaceLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome {session.data?.user.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <p>This workspace is:</p>
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    );
  }

  // 3. Once loaded, render the data
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {privateData?.message}</p>
      <p>
        This workspace is:{" "}
        <span className="font-semibold">
          {/* Access the name from the 'currentWorkspace' object */}
          {workspaceInfo?.currentWorkspace?.name}
        </span>
      </p>
    </div>
  );
}
