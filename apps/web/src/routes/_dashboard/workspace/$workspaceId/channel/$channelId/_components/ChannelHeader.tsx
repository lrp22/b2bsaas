import { orpc } from "@/utils/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Hash } from "lucide-react";

export function ChannelHeader() {
  const { channelId, workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId/channel/$channelId/",
  });

  const { data: channel } = useSuspenseQuery(
    orpc.channel.getById.queryOptions({
      // FIX: Wrap arguments in 'input'
      input: {
        id: channelId,
        workspaceId: workspaceId
      }
    })
  );

  return (
    <div className="flex items-center h-14 border-b px-4 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 font-semibold">
        <Hash className="size-5 text-muted-foreground" />
        <span>{channel.name}</span>
      </div>
    </div>
  );
}