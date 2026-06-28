import React from "react";
import { Link } from "react-router-dom";
import { FileEdit } from "lucide-react";
import { canEditContent } from "../lib/adminSession";

// Botão flutuante visível para admin/super_admin na página pública de um artigo, para
// entrar diretamente no editor desse artigo (/admin/blog/:slug).
export const EditArticleButton = ({ slug }) => {
  if (!canEditContent()) return null;

  return (
    <Link
      to={`/admin/blog/${slug}`}
      data-testid="edit-article-button"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--da-forest)] text-white font-body text-xs uppercase tracking-[0.16em] shadow-lg hover:bg-[var(--da-leaf)] transition"
    >
      <FileEdit size={14} /> Editar artigo
    </Link>
  );
};
