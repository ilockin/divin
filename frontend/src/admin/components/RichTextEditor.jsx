import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Image as ImageIcon,
  Undo2, Redo2, Code2, Eye,
} from "lucide-react";

const ToolbarButton = ({ onClick, active, disabled, label, Icon }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={label}
    data-testid={`rte-${label.toLowerCase()}`}
    className={`w-8 h-8 rounded flex items-center justify-center text-[var(--da-forest)] disabled:opacity-30 ${active ? "bg-white shadow-sm" : "hover:bg-white"}`}
  >
    <Icon size={14} />
  </button>
);

// Editor de artigo real (TipTap): WYSIWYG com formatação de verdade, mais alternância para HTML.
export const RichTextEditor = ({ value, onChange }) => {
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value || "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // sincroniza o conteúdo se mudar de fora (ex.: ao trocar de artigo)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !htmlMode) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL do link:", "https://");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  const addImage = () => {
    const url = window.prompt("URL da imagem:", "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=70");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const toggleHtmlMode = () => {
    if (!htmlMode) {
      setHtmlDraft(editor.getHTML());
      setHtmlMode(true);
    } else {
      editor.commands.setContent(htmlDraft, false);
      onChange(htmlDraft);
      setHtmlMode(false);
    }
  };

  return (
    <div data-testid="rich-text-editor">
      <div className="bg-[var(--da-cream-2)]/50 border hairline rounded-t-lg flex items-center gap-1 p-1.5 flex-wrap" data-testid="rte-toolbar">
        <ToolbarButton label="Negrito" Icon={Bold} disabled={htmlMode} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="Itálico" Icon={Italic} disabled={htmlMode} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="Título2" Icon={Heading2} disabled={htmlMode} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="Título3" Icon={Heading3} disabled={htmlMode} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton label="Lista" Icon={List} disabled={htmlMode} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="Numerada" Icon={ListOrdered} disabled={htmlMode} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Citação" Icon={Quote} disabled={htmlMode} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label="Link" Icon={Link2} disabled={htmlMode} active={editor.isActive("link")} onClick={addLink} />
        <ToolbarButton label="Imagem" Icon={ImageIcon} disabled={htmlMode} onClick={addImage} />
        <ToolbarButton label="Desfazer" Icon={Undo2} disabled={htmlMode} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="Refazer" Icon={Redo2} disabled={htmlMode} onClick={() => editor.chain().focus().redo().run()} />
        <div className="ml-auto">
          <ToolbarButton label={htmlMode ? "Visual" : "Codigo2"} Icon={htmlMode ? Eye : Code2} onClick={toggleHtmlMode} active={htmlMode} />
        </div>
      </div>

      {htmlMode ? (
        <textarea
          rows={14}
          value={htmlDraft}
          onChange={(e) => setHtmlDraft(e.target.value)}
          data-testid="rte-html-source"
          className="w-full border-t-0 border hairline rounded-b-lg px-4 py-3 font-mono text-xs focus:outline-none focus:border-[var(--da-leaf)] bg-white"
        />
      ) : (
        <EditorContent
          editor={editor}
          data-testid="rte-content"
          className="article-content border-t-0 border hairline rounded-b-lg px-4 py-3 bg-white min-h-[280px] focus-within:border-[var(--da-leaf)] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[260px]"
        />
      )}
    </div>
  );
};
