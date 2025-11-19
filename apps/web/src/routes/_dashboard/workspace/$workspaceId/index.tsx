import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Hash } from "lucide-react";
import { CreateNewChannel } from "./_components/CreateNewChannel";

export const Route = createFileRoute("/_dashboard/workspace/$workspaceId/")({
  loader: async ({ context, params }) => {
    const channels = await context.queryClient.fetchQuery(
      context.orpc.channel.listByWorkspace.queryOptions({
        // FIX: Wrap in input here as well
        input: {
          workspaceId: params.workspaceId,
        },
      })
    );

    if (channels.length > 0) {
      throw redirect({
        to: "/workspace/$workspaceId/channel/$channelId",
        params: {
          workspaceId: params.workspaceId,
          channelId: channels[0].id,
        },
      });
    }

    return { hasChannels: false };
  },
  component: WorkspaceHome,
});

function WorkspaceHome() {
  return (
    <div className="h-full flex-1 flex flex-col items-center justify-center bg-muted/10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Hash className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No Channels Found</EmptyTitle>
          <EmptyDescription>
            This workspace doesn't have any channels yet. Create one to start
            chatting.
          </EmptyDescription>
        </EmptyHeader>
        <div className="mt-4">
          <CreateNewChannel />
        </div>
      </Empty>
    </div>
  );
}
