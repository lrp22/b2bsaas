import { useInfiniteQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageItem } from "./message/MessageItem";

export function MessageList() {
  const { channelId } = useParams({
    from: "/_dashboard/workspace/$workspaceId/channel/$channelId/",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery(
      orpc.message.list.infiniteOptions({
        input: (pageParam: string | undefined) => ({
          channelId,
          limit: 20,
          cursor: pageParam,
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      })
    );

  const messages = useMemo(() => {
    if (!data) return [];
    return [...data.pages].reverse().flatMap((page) => page.items);
  }, [data]);

  const scrollToBottom = (instant = false) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: instant ? "auto" : "smooth",
        block: "end",
      });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 100;

    setShowScrollButton(!isAtBottom);
    setShouldAutoScroll(isAtBottom);

    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      const oldScrollHeight = scrollHeight;
      fetchNextPage().then(() => {
        if (scrollContainerRef.current) {
          const newScrollHeight = scrollContainerRef.current.scrollHeight;
          scrollContainerRef.current.scrollTop =
            newScrollHeight - oldScrollHeight;
        }
      });
    }
  };

  useLayoutEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [channelId]);

  useEffect(() => {
    if (messages.length > 0 && shouldAutoScroll) {
      scrollToBottom(false);
    }
  }, [messages.length, shouldAutoScroll]);

  if (isPending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        // FIX: Reduced spacing from space-y-6 to space-y-0.5 for compact chat look
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <p>No messages yet.</p>
            <p className="text-sm">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}

        <div ref={bottomAnchorRef} className="h-px w-full" />
      </div>

      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 rounded-full shadow-lg z-10 animate-in fade-in"
          onClick={() => {
            setShouldAutoScroll(true);
            scrollToBottom(false);
          }}
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
    </div>
  );
}
