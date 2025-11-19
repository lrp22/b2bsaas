import { createFileRoute } from "@tanstack/react-router";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageList } from "./_components/MessageList";
import { MessageInputForm } from "./_components/message/MessageInputForm";

export const Route = createFileRoute(
  "/_dashboard/workspace/$workspaceId/channel/$channelId/"
)({
  component: ChannelPage,
});

function ChannelPage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Fixed Header */}
      <ChannelHeader />

      {/* Scrollable List - flex-1 makes it take all remaining space */}
      <MessageList />

      {/* Fixed Input */}
      <MessageInputForm />
    </div>
  );
}
