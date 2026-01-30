"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { Bold, Italic, List, ListOrdered, Quote, Redo, Undo, Code, Heading1, Heading2, Strikethrough } from "lucide-react";

export interface TextareaProps {
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  rows?: number;
  disabled?: boolean;
}

const MenuBar = ({ editor, disabled }: { editor: any; disabled?: boolean }) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Bold className="h-4 w-4" />,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      icon: <List className="h-4 w-4" />,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: <Code className="h-4 w-4" />,
      title: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      icon: <Undo className="h-4 w-4" />,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
    },
    {
      icon: <Redo className="h-4 w-4" />,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
    },
  ];

  return (
    <div className="flex flex-wrap gap-0.5 p-1 border-b bg-muted/20 backdrop-blur-sm sticky top-0 z-10 transition-colors">
      {buttons.map((btn, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={btn.action}
          className={cn(
            "p-2 rounded-lg transition-all hover:bg-muted active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
            btn.isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
          )}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, value, onChange, placeholder, rows = 5, disabled }, ref) => {
    const textareaId = id || React.useId();
    const isInternallyUpdating = React.useRef(false);

    const editor = useEditor({
      extensions: [StarterKit],
      content: value || "",
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: cn("prose prose-sm dark:prose-invert focus:outline-none max-w-none px-4 py-3 min-h-[inherit]", className),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (onChange) {
          isInternallyUpdating.current = true;
          const event = {
            target: {
              value: html,
              id: textareaId,
              name: textareaId,
            },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(event);

          setTimeout(() => {
            isInternallyUpdating.current = false;
          }, 0);
        }
      },
    });

    // Handle initial placeholder if needed (Tiptap Placeholder extension would be better but this works too)
    // we can skip placeholder for now as it requires another extension or custom CSS

    React.useEffect(() => {
      if (editor && value !== undefined && value !== editor.getHTML() && !isInternallyUpdating.current) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    React.useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [disabled, editor]);

    const minHeight = rows ? `${rows * 1.5 + 2}rem` : "10rem";

    return (
      <div className="flex w-full flex-col gap-2 group">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold tracking-tight text-foreground/80 transition-colors group-focus-within:text-primary"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex flex-col w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden shadow-sm hover:border-muted-foreground/30",
            error && "border-destructive focus-within:ring-destructive/20 focus-within:border-destructive",
            disabled && "opacity-60 cursor-not-allowed bg-muted",
          )}
        >
          <MenuBar editor={editor} disabled={disabled} />
          <div style={{ minHeight }} className="relative flex-1 cursor-text">
            <EditorContent editor={editor} className="min-h-full" />
          </div>
        </div>

        {error ? (
          <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground/70">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
