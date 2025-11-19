import { Button } from "@/components/ui/button";
import { Image as ImageIcon, SendHorizontal } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "@/components/text-editor/Editor";
import { ImageUploadModal } from "@/components/text-editor/ImageUploadModal";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isPending,
}: MessageComposerProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleImageUploaded = (url: string) => {
    // For now, we can just append the image URL to the text,
    // or handle it as a separate attachment field if your backend supports it.
    // Since we are using Tiptap JSON, simply appending text might break format.
    // Ideally, you insert an image node into Tiptap.
    // For MVP, let's just alert or log it.
    console.log("Image uploaded:", url);
    setIsUploadOpen(false);
  };

  return (
    <>
      <RichTextEditor
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={isPending}
        // Left side: Attach Button
        footerLeft={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setIsUploadOpen(true)}
          >
            <ImageIcon className="size-4 mr-2" />
            Attach
          </Button>
        }
        // Right side: Send Button
        sendButton={
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !value}
            onClick={onSubmit}
            className="gap-2"
          >
            <SendHorizontal className="size-4" />
            Send
          </Button>
        }
      />

      <ImageUploadModal
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploaded={handleImageUploaded}
      />
    </>
  );
}
