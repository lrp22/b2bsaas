import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SafeContent } from "@/components/text-editor/SafeContext"; // Import the new component

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
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex gap-3 py-1 hover:bg-muted/40 px-2 rounded-lg group transition-colors">
      <Avatar className="size-9 mt-0.5">
        <AvatarImage src={message.user.image || undefined} />
        <AvatarFallback className="bg-sky-500 text-white font-medium text-xs">
          {message.user.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col w-full min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{message.user.name}</span>
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        </div>
        
        {/* USE SafeContent HERE */}
        <SafeContent 
            content={message.content} 
            className="text-foreground"
        />
      </div>
    </div>
  );
}