import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { Placeholder } from "@tiptap/extensions";

const lowlight = createLowlight(all);

export const baseExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Placeholder.configure({
    placeholder: "Type a message...",
    emptyEditorClass: "is-editor-empty text-muted-foreground",
  }),
];

export const editorExtensions = [
  ...baseExtensions,
];