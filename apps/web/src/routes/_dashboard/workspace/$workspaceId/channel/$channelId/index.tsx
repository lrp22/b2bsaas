import { createFileRoute } from "@tanstack/react-router";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageList } from "./_components/MessageList";
import { MessageInputForm } from "./_components/message/MessageInputForm";

export const Route = createFileRoute(
  "/_dashboard/workspace/$workspaceId/channel/$channelId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-full w-full">
      <ChannelHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList />
      </div>
      <div className="border-t bg-background p-4">
        <MessageInputForm />
      </div>
    </div>
  );
}
