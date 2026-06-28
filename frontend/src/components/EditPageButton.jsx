import React from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { isSuperAdmin } from "../lib/adminSession";

// Botão flutuante visível só para o super_admin nas páginas públicas editáveis (Home/Sobre/Contacto/Blog),
// para entrar diretamente no editor visual daquela página.
export const EditPageButton = ({ editorPath }) => {
  if (!isSuperAdmin()) return null;

  return (
    <Link
      to={editorPath}
      data-testid="edit-page-button"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--da-forest)] text-white font-body text-xs uppercase tracking-[0.16em] shadow-lg hover:bg-[var(--da-leaf)] transition"
    >
      <Pencil size={14} /> Editar página
    </Link>
  );
};
