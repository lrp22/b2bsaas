import { Editor, useEditorState } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Bold, Code, Italic, List, ListOrdered, Redo, Strikethrough, Undo } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface MenuBarProps {
  editor: Editor | null;
}

export function MenuBar({ editor }: MenuBarProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isCodeBlock: editor.isActive("codeBlock"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  if (!editor) return null;

  return (
    // UI FIX: No border, no background, just a flex row.
    // Using 'text-muted-foreground' to make icons subtle by default.
    <div className="flex flex-wrap gap-0.5 items-center">
      <TooltipProvider>
        <div className="flex flex-wrap gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editorState?.isBold}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <Bold className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editorState?.isItalic}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <Italic className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editorState?.isStrike}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <Strikethrough className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strike</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editorState?.isCodeBlock}
                onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <Code className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-4 mx-2 bg-border" />

        <div className="flex flex-wrap gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editorState?.isBulletList}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <List className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editorState?.isOrderedList}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <ListOrdered className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-4 mx-2 bg-border" />

        <div className="flex flex-wrap gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editorState?.canUndo}
              >
                <Undo className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editorState?.canRedo}
              >
                <Redo className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}