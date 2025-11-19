import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChannelList() {
  const { workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId",
  });

  const params = useParams({ strict: false });
  const currentChannelId = (params as any)?.channelId;

  const { data: channels } = useSuspenseQuery(
    orpc.channel.listByWorkspace.queryOptions({
      // FIX: Wrap arguments in 'input'
      input: {
        workspaceId,
      },
    })
  );

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {channels.map((channel) => (
        <Link
          key={channel.id}
          to="/workspace/$workspaceId/channel/$channelId"
          params={{
            workspaceId,
            channelId: channel.id,
          }}
          className="w-full"
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2 px-2 h-9 font-normal",
              currentChannelId === channel.id
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Hash className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{channel.name}</span>
          </Button>
        </Link>
      ))}
    </div>
  );
}
