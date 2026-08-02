import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { makeMenuItem, initialMenuContent } from "../data/mockMenuContent";

const clone = (c) => JSON.parse(JSON.stringify(c));

export const MenuVisualEditor = () => {
  const { menuContent, saveMenuContent } = useAdmin();
  const [draft, setDraft] = useState(() => clone(menuContent));
  const [saving, setSaving] = useState(false);

  // O menu chega do Supabase depois da primeira renderização — sincronizar o rascunho
  // enquanto não houver edições por gravar.
  const dirtyRef = useRef(false);
  dirtyRef.current = JSON.stringify(draft) !== JSON.stringify(menuContent);
  useEffect(() => {
    if (!dirtyRef.current) setDraft(clone(menuContent));
  }, [menuContent]);

  const updateItem = (id, key, value) =>
    setDraft((prev) => ({ ...prev, items: prev.items.map((it) => (it.id === id ? { ...it, [key]: value } : it)) }));
  const addItem = () => setDraft((prev) => ({ ...prev, items: [...prev.items, makeMenuItem()] }));
  const removeItem = (id) => {
    if (!window.confirm("Remover este item do menu?")) return;
    setDraft((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  };

  const updateChild = (itemId, childId, key, value) =>
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id !== itemId ? it : { ...it, children: it.children.map((c) => (c.id === childId ? { ...c, [key]: value } : c)) })),
    }));
  const addChild = (itemId) =>
    setDraft((prev) => ({ ...prev, items: prev.items.map((it) => (it.id !== itemId ? it : { ...it, children: [...it.children, makeMenuItem()] })) }));
  const removeChild = (itemId, childId) =>
    setDraft((prev) => ({ ...prev, items: prev.items.map((it) => (it.id !== itemId ? it : { ...it, children: it.children.filter((c) => c.id !== childId) })) }));

  const save = async () => {
    setSaving(true);
    try {
      await saveMenuContent(draft);
      toast.success("Menu atualizado.");
    } catch (e) {
      toast.error("Erro ao guardar", { description: e.message });
    } finally {
      setSaving(false);
    }
  };
  const resetToDefaults = () => {
    if (!window.confirm("Repor o menu predefinido? (só passa a valer depois de Guardar)")) return;
    setDraft(clone(initialMenuContent));
    toast("Predefinições aplicadas — clica em Guardar para confirmar.");
  };

  return (
    <div data-testid="admin-menu-editor">
      <PageHeader
        title="Menu Principal"
        subtitle="Itens do menu de navegação do site, com submenus (abrem ao passar o rato)."
        actions={(
          <>
            <button onClick={resetToDefaults} data-testid="menu-reset" className="btn-da btn-da-outline text-xs"><RotateCcw size={14} /> Repor predefinições</button>
            <button onClick={save} disabled={saving} data-testid="menu-save" className="btn-da btn-da-primary text-xs disabled:opacity-60"><Save size={14} /> {saving ? "A guardar…" : "Guardar"}</button>
          </>
        )}
      />

      <div className="space-y-5">
        {draft.items.map((item) => (
          <div key={item.id} className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid={`menu-item-${item.id}`}>
            <div className="flex items-center justify-between">
              <SectionTitle eyebrow="item do menu" title={item.label || "—"} />
              <button onClick={() => removeItem(item.id)} className="text-[var(--da-muted)] hover:text-red-600 px-2" aria-label="Remover item" data-testid={`menu-item-remove-${item.id}`}><Trash2 size={16} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormRow label="Rótulo">
                <input className={fieldClass} value={item.label} onChange={(e) => updateItem(item.id, "label", e.target.value)} data-testid={`menu-item-${item.id}-label`} />
              </FormRow>
              <FormRow label="Link" hint="Caminho interno (/loja) ou URL externo (https://...).">
                <input className={fieldClass} value={item.link} onChange={(e) => updateItem(item.id, "link", e.target.value)} data-testid={`menu-item-${item.id}-link`} />
              </FormRow>
            </div>

            <div className="border-t hairline pt-4">
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Submenu</p>
              <div className="space-y-2">
                {item.children.map((child) => (
                  <div key={child.id} className="flex gap-2 items-start" data-testid={`menu-child-${child.id}`}>
                    <input className={fieldClass + " mt-0"} placeholder="Rótulo" value={child.label} onChange={(e) => updateChild(item.id, child.id, "label", e.target.value)} data-testid={`menu-child-${child.id}-label`} />
                    <input className={fieldClass + " mt-0"} placeholder="Link" value={child.link} onChange={(e) => updateChild(item.id, child.id, "link", e.target.value)} data-testid={`menu-child-${child.id}-link`} />
                    <button onClick={() => removeChild(item.id, child.id)} className="text-[var(--da-muted)] hover:text-red-600 px-2 shrink-0" aria-label="Remover sub-item" data-testid={`menu-child-remove-${child.id}`}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addChild(item.id)} data-testid={`menu-item-${item.id}-add-child`} className="mt-3 inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"><Plus size={13} /> Adicionar sub-item</button>
            </div>
          </div>
        ))}

        <button onClick={addItem} data-testid="menu-item-add" className="btn-da btn-da-outline text-xs"><Plus size={14} /> Adicionar item ao menu</button>
      </div>
    </div>
  );
};
