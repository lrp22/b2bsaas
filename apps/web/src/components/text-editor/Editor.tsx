import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import { MenuBar } from "./MenuBar";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  footerLeft?: React.ReactNode;
  sendButton?: React.ReactNode;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type a message...",
  className,
  footerLeft,
  sendButton,
}: RichTextEditorProps) {
  const extensions = useMemo(() => {
    const base = editorExtensions.filter((ext) => ext.name !== "placeholder");
    return [
      ...base,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "is-editor-empty text-muted-foreground/50 before:content-[attr(data-placeholder)] before:float-left before:h-0 before:pointer-events-none",
      }),
    ];
  }, [placeholder]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions,
    content: value ? JSON.parse(value) : "",
    editorProps: {
      attributes: {
        // UI FIX:
        // - max-w-none: allows text to take full width
        // - min-h-[80px]: minimum height to look substantial
        // - prose-p:leading-relaxed: nicer line height
        // - prose: standard typography
        class:
          "max-w-none min-h-[100px] focus:outline-none px-4 py-3 prose prose-sm dark:prose-invert marker:text-primary leading-normal",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(JSON.stringify(json));
    },
  });

  useEffect(() => {
    if (editor && (value === "" || value === "{}") && !editor.isEmpty) {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  return (
    // UI FIX: One border around everything, rounded-lg, bg-card
    <div
      className={cn(
        "flex flex-col w-full border border-input rounded-lg overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary/20 transition-colors",
        className
      )}
    >
      {/* Toolbar: Subtle background separation */}
      <div className="border-b px-2 py-1.5 bg-muted/10">
        <MenuBar editor={editor} />
      </div>

      {/* Editor: White/Dark background */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto max-h-[400px]"
      />

      {/* Footer: Actions area */}
      {(footerLeft || sendButton) && (
        <div className="flex items-center justify-between p-2 pt-1">
          <div className="flex items-center gap-2">{footerLeft}</div>
          <div>{sendButton}</div>
        </div>
      )}
    </div>
  );
}
