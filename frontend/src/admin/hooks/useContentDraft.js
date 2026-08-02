import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const clone = (c) => JSON.parse(JSON.stringify(c));

// Estado de rascunho partilhado pelos editores visuais de conteúdo (Home, Sobre, Contacto, ...).
// `content` vem do AdminContext e `persist` é o gravador respetivo (`saveHomeContent`, ...),
// que escreve no Supabase; `initialContent` é o valor de fábrica do respetivo mock*Content.js,
// usado por "Repor predefinições".
export const useContentDraft = (content, persist, initialContent) => {
  const [draft, setDraft] = useState(() => clone(content));
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(content);

  // O conteúdo chega do Supabase depois da primeira renderização: sem isto o rascunho ficava
  // preso aos valores de fábrica e a primeira gravação apagava o que já estava guardado.
  // Só sincroniza quando não há edições por gravar, para não deitar fora trabalho em curso.
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;
  useEffect(() => {
    if (!dirtyRef.current) setDraft(clone(content));
  }, [content]);

  const updateField = (sectionKey, fieldKey, value) =>
    setDraft((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [fieldKey]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      await persist(draft);
      toast.success("Conteúdo atualizado.");
    } catch (e) {
      toast.error("Erro ao guardar", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!window.confirm("Repor os textos predefinidos desta página? (só passa a valer depois de Guardar)")) return;
    setDraft(clone(initialContent));
    toast("Predefinições aplicadas — clica em Guardar para confirmar.");
  };

  return { draft, setDraft, updateField, save, saving, resetToDefaults, isDirty };
};
