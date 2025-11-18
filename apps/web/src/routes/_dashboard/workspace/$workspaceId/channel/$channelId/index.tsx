import { createFileRoute } from "@tanstack/react-router";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageList } from "./_components/MessageList";
import { MessageInputForm } from "./_components/MessageInputForm";

export const Route = createFileRoute(
  "/_dashboard/workspace/$workspaceId/channel/$channelId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        <ChannelHeader />
      </div>
    </div>
  );
}
