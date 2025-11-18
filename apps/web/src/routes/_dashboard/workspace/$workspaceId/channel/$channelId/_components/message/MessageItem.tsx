import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Message {
  id: string | number;
  content: string;
  createdAt: string | Date;
  user: {
    name: string;
    image?: string | null;
  };
}

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const date = new Date(message.createdAt);
  const isToday = new Date().toDateString() === date.toDateString();
  
  // If today: "10:42 AM"
  // If older: "Nov 15, 10:42 AM"
  const formattedTime = isToday 
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const initials = message.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="group flex items-start gap-3 px-4 py-2 hover:bg-muted/50 transition-colors w-full">
      <Avatar className="size-8 rounded-md shrink-0 mt-0.5">
        <AvatarImage src={message.user.image || undefined} alt={message.user.name} />
        <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col w-full min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm hover:underline cursor-pointer">
            {message.user.name}
          </span>
          <span className="text-[10px] text-muted-foreground select-none">
            {formattedTime}
          </span>
        </div>
        
        <div className="text-sm text-foreground/90 leading-relaxed wrap-break-word whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}