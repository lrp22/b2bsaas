import { MessageItem, type Message } from "./message/MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data aligning with our new schema structure
const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    content: "This is an old message from a few days ago to test the date formatting.",
    // 3 days ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), 
    user: {
      name: "Lucas Prasel",
      image: null, 
    },
  },
  {
    id: 2,
    content: "I'm working on the new dashboard layout. It's coming along nicely!",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    user: {
      name: "Sarah Engineer",
      image: null,
    },
  },
  {
    id: 3,
    content: "Can you check the sidebar width? I think it's a bit too wide on mobile.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    user: {
      name: "Lucas Prasel",
      image: null,
    },
  },
];

export function MessageList() {
  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
      <ScrollArea className="flex-1 h-full">
        <div className="flex flex-col justify-end min-h-full py-4">
          {MOCK_MESSAGES.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}