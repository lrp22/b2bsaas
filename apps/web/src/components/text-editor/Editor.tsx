import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { MenuBar } from "./MenuBar";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  footerLeft?: React.ReactNode;
  sendButton?: React.ReactNode;
  onSubmit?: () => void;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  footerLeft,
  sendButton,
  onSubmit,
  disabled,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Type a message...",
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "min-h-[60px] w-full bg-transparent px-3 py-2 text-sm focus-visible:outline-none prose prose-sm dark:prose-invert max-w-none",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && !event.shiftKey && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Return JSON string for rich text support
      const content = editor.getText() ? JSON.stringify(editor.getJSON()) : "";
      onChange(content);
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (editor && value === "") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  return (
    <div className={cn(
      "flex flex-col w-full border rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring transition-all overflow-hidden",
      className
    )}>
      {/* Top Bar */}
      <div className="border-b bg-muted/30 px-1">
        <MenuBar editor={editor} />
      </div>

      {/* Editor Area */}
      <EditorContent 
        editor={editor} 
        className="flex-1 overflow-y-auto max-h-[300px]" 
      />

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/10">
        <div className="flex items-center gap-2">
          {footerLeft}
        </div>
        <div>
          {sendButton}
        </div>
      </div>
    </div>
  );
}