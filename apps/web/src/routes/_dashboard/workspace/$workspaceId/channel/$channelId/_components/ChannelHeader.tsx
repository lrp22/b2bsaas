import { ModeToggle } from "@/components/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Hash } from "lucide-react";

export function ChannelHeader() {
  // 1. Get BOTH IDs from the URL
  const { channelId, workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId/channel/$channelId/",
  });

  // 2. Fetch channel using the secure procedure
  const { data: channel, isLoading } = useQuery(
    orpc.channel.getById.queryOptions({
      input: {
        channelId,
        workspaceId, // Pass the workspaceId here
      },
    })
  );

  return (
    <div className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="flex items-center gap-2 font-semibold">
        <Hash className="size-5 text-muted-foreground" />
        {isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : (
          <h1 className="text-lg truncate">{channel?.name}</h1>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <ModeToggle />
      </div>
    </div>
  );
}
