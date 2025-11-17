import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";

export function ChannelList() {
  // 1. Fetch the list of channels for the current active workspace.
  // The backend procedure 'listByWorkspace' automatically knows which workspace is active from the session.
  const { data: channels, isLoading } = useQuery(
    orpc.channel.listByWorkspace.queryOptions()
  );

  // 2. Handle the loading state while the channels are being fetched.
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    );
  }

  // 3. Handle the empty state when no channels have been created yet.
  if (!channels || channels.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground border-2 border-dashed rounded-md">
        <p>No channels yet.</p>
        <p className="text-sm">Create one to start collaborating!</p>
      </div>
    );
  }

  // 4. Render the list of channels.
  return (
    <div className="flex flex-col gap-2">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className="p-3 border rounded-lg hover:bg-accent transition-colors"
        >
          # {channel.name}
        </div>
      ))}
    </div>
  );
}
