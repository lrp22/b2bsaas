import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

// Define the extensions used to generate the HTML.
// This should match what you use in your Editor.
const extensions = [StarterKit];

interface SafeContentProps {
  content: string;
  className?: string;
}

export function SafeContent({ content, className }: SafeContentProps) {
  const htmlContent = useMemo(() => {
    try {
      // 1. Try to parse as JSON (Tiptap format)
      const json = JSON.parse(content);

      // 2. Convert JSON to HTML
      const rawHtml = generateHTML(json, extensions);

      // 3. Sanitize HTML (Security against XSS)
      return DOMPurify.sanitize(rawHtml);
    } catch (e) {
      // Fallback: If it's not JSON, just treat it as plain text/html
      // but still sanitize it to be safe.
      return DOMPurify.sanitize(content);
    }
  }, [content]);

  return (
    <div
      className={cn(
        // Prose classes make the HTML look good (headings, lists, etc.)
        "prose prose-sm dark:prose-invert max-w-none break-words leading-normal",
        // Remove default margins from the first/last elements to fit in the chat bubble
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        // Style paragraphs
        "[&>p]:m-0",
        className
      )}
    >
      {parse(htmlContent)}
    </div>
  );
}
