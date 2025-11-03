"use client";

import { cn } from "@/lib/utils";
import { Bold, Italic, List, Redo2, Underline, Undo2 } from "lucide-react";

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const buttonClass =
    "flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 cursor-pointer transition-colors";
  const activeClass = "bg-muted";

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(buttonClass, {
          [activeClass]: editor.isActive("bold"),
        })}
        title="Bold"
      >
        <Bold className="size-4" />
      </button>

      <button
        onClick={() => editor.chain().focus()?.toggleItalic()?.run()}
        className={cn(buttonClass, {
          [activeClass]: editor.isActive("italic"),
        })}
        title="Italic"
      >
        <Italic className="size-4" />
      </button>

      <button
        onClick={() => editor.chain().focus()?.toggleUnderline()?.run()}
        className={cn(buttonClass, {
          [activeClass]: editor.isActive("strike"),
        })}
        title="Strike"
      >
        <Underline className="size-4" />
      </button>

      <div className="bg-muted mx-1 h-6 w-px" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(buttonClass, {
          [activeClass]: editor.isActive("bulletList"),
        })}
        title="Bullet List"
      >
        <List className="size-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(buttonClass, {
          [activeClass]: editor.isActive("orderedList"),
        })}
        title="Numbered List"
      >
        <List className="size-4" />
      </button>

      <div className="bg-muted mx-1 h-6 w-px" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={cn(buttonClass, {
          "cursor-not-allowed opacity-50": !editor.can().undo(),
        })}
        title="Undo"
      >
        <Undo2 className="size-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={cn(buttonClass, {
          "cursor-not-allowed opacity-50": !editor.can().redo(),
        })}
        title="Redo"
      >
        <Redo2 className="size-4" />
      </button>
    </>
  );
};

export default EditorToolbar;
