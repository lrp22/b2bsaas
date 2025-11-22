import { useInfiniteQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageItem } from "./message/MessageItem";
import { cn } from "@/lib/utils";

export function MessageList() {
  const { channelId } = useParams({
    from: "/_dashboard/workspace/$workspaceId/channel/$channelId/",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State to track if the user is at the bottom of the list
  const [isAtBottom, setIsAtBottom] = useState(true);
  // State to track if new messages arrived while scrolled up
  const [hasNewMessages, setHasNewMessages] = useState(false);
  // Track previous message count to detect new arrivals
  const prevMessageCountRef = useRef(0);

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

  // Scroll to bottom helper
  const scrollToBottom = (behavior: "auto" | "smooth" = "auto") => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior,
      });
    }
  };

  // 1. Handle Scroll Events (Infinite Load & "Sticky" state tracking)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    // Distance from the bottom of the scroll container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Threshold to consider "at bottom" (e.g., 100px)
    const isCloseToBottom = distanceFromBottom < 100;

    setIsAtBottom(isCloseToBottom);

    if (isCloseToBottom) {
      setHasNewMessages(false); // Clear notification if we are at bottom
    }

    // Load previous messages when reaching top
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      // Capture current scroll height before loading new data to maintain position
      const oldScrollHeight = scrollHeight;

      fetchNextPage().then(() => {
        // After render, adjust scroll to keep position stable
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop =
              newScrollHeight - oldScrollHeight;
          }
        });
      });
    }
  };

  // 2. Handle New Messages (Auto-scroll)
  useLayoutEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // If messages increased (new message arrived)
    if (currentCount > prevCount) {
      if (isAtBottom) {
        // If we were already at bottom, snap to new bottom
        scrollToBottom("auto");
      } else {
        // If we were scrolled up, show "New Messages" indicator
        setHasNewMessages(true);
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages.length, isAtBottom]);

  // 3. Initial Load Scroll
  useEffect(() => {
    if (messages.length > 0 && prevMessageCountRef.current === 0) {
      scrollToBottom("auto");
      // Initialize ref to avoid triggering "New Messages" on first load
      prevMessageCountRef.current = messages.length;
    }
  }, [channelId, messages.length]);

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
      </div>

      {/* Floating "Go to Bottom" Button */}
      <div
        className={cn(
          "absolute bottom-4 right-4 transition-all duration-300 transform",
          !isAtBottom
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        )}
      >
        <Button
          size="icon"
          variant={hasNewMessages ? "default" : "secondary"}
          className={cn(
            "rounded-full shadow-lg h-10 w-10",
            hasNewMessages && "animate-bounce"
          )}
          onClick={() => {
            scrollToBottom("smooth");
            setHasNewMessages(false);
          }}
        >
          <ArrowDown className="size-4" />
          {hasNewMessages && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
