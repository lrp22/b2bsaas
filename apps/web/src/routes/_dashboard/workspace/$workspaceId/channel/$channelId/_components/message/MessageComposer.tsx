import { RichTextEditor } from "@/components/text-editor/Editor";
import { ImageUploadModal } from "@/components/text-editor/ImageUploadModal";
import { Button } from "@/components/ui/button";
import { ImageIcon, SendHorizontal } from "lucide-react";
import { useState } from "react";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function MessageComposer({ value, onChange, onSubmit, isPending }: MessageComposerProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="relative">
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder="Type your message..."
        className="shadow-sm" // Add subtle shadow
        footerLeft={
          <>
             {/* UI FIX: 'Attach' button style */}
             <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground border-muted hover:bg-muted" 
                onClick={() => setIsUploadOpen(true)}
                type="button"
             >
                <ImageIcon className="size-3.5" />
                <span>Attach</span>
             </Button>
             
             <ImageUploadModal 
                isOpen={isUploadOpen} 
                onOpenChange={setIsUploadOpen}
                onUploaded={(url: string) => {
                    console.log("Uploaded (Stub):", url);
                    setIsUploadOpen(false);
                }}
             />
          </>
        }
        sendButton={
          // UI FIX: 'Send' button style
          <Button 
            onClick={onSubmit} 
            disabled={isPending || !value || value === "{}"} 
            size="sm"
            className="h-8 px-3 gap-2"
            type="submit"
          >
            <span className="sr-only sm:not-sr-only text-xs">Send</span>
            <SendHorizontal className="size-3.5" />
          </Button>
        }
      />
      <div className="flex justify-end px-1 mt-1">
        <span className="text-[10px] text-muted-foreground/60">
          <strong>Shift + Enter</strong> to add a new line
        </span>
      </div>
    </div>
  );
}