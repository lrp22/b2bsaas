import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChannelList() {
  // 1. Strictly get workspaceId from the parent route (this is guaranteed to exist)
  const { workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId",
  });

  // 2. Loosely get channelId for highlighting (it might be undefined if on the home page)
  // We cast it because strict: false returns unknown/generic types
  const params = useParams({ strict: false }) as { channelId?: string };
  const activeChannelId = params.channelId;

  const { data: channels, isLoading } = useQuery(
    orpc.channel.listByWorkspace.queryOptions({ input: { workspaceId } })
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!channels?.length) {
    return (
      <div className="px-4 py-2 text-sm text-muted-foreground">
        No channels found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-2">
      {channels.map((channel) => {
        const isActive = activeChannelId === channel.id;
        return (
          <Link
            key={channel.id}
            to="/workspace/$workspaceId/channel/$channelId"
            params={{ workspaceId, channelId: channel.id }}
            className="block"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-2 font-normal text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                isActive && "bg-accent text-foreground font-medium"
              )}
              size="sm"
            >
              <Hash className="size-4 shrink-0 text-muted-foreground/50" />
              <span className="truncate">{channel.name}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
