import { useState } from "react";
import { toast } from "sonner";

const clone = (c) => JSON.parse(JSON.stringify(c));

// Estado de rascunho partilhado pelos editores visuais de conteúdo (Home, Sobre, Contacto, ...).
// `content`/`setContent` vêm do AdminContext (já persistem em localStorage); `initialContent` é
// o valor de fábrica do respetivo mock*Content.js, usado por "Repor predefinições".
export const useContentDraft = (content, setContent, initialContent) => {
  const [draft, setDraft] = useState(() => clone(content));

  const updateField = (sectionKey, fieldKey, value) =>
    setDraft((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [fieldKey]: value } }));

  const save = () => {
    setContent(draft);
    toast.success("Conteúdo atualizado.");
  };

  const resetToDefaults = () => {
    if (!window.confirm("Repor os textos predefinidos desta página? (só passa a valer depois de Guardar)")) return;
    setDraft(clone(initialContent));
    toast("Predefinições aplicadas — clica em Guardar para confirmar.");
  };

  return { draft, setDraft, updateField, save, resetToDefaults };
};
