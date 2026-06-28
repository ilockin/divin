import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../context/AdminContext";
import { CartContext } from "../../context/CartContext";
import { HOME_SECTIONS } from "../../components/home/HomeSections";
import { HOME_FIELDS, SECTION_BUTTONS, SECTION_LINKS, initialHomeContent } from "../data/mockHomeContent";
import { FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { TitleStyleFields, ButtonFields, LinkFields } from "../components/contentEditor/ContentFieldEditors";
import { EditorTopBar } from "../components/contentEditor/EditorTopBar";
import { SelectableSection } from "../components/contentEditor/SelectableSection";
import { useContentDraft } from "../hooks/useContentDraft";

// O admin não tem CartProvider (só a loja pública tem); aqui simulamos um contexto
// inerte só para a secção "Produtos em destaque" (ProductCard) conseguir renderizar
// na pré-visualização, sem tocar no carrinho real do cliente.
const previewCart = {
  addItem: () => toast("Pré-visualização — \"Adicionar\" não tem efeito aqui."),
};

export const HomeVisualEditor = () => {
  const { homeContent, setHomeContent } = useAdmin();
  const { draft, updateField, save, resetToDefaults } = useContentDraft(homeContent, setHomeContent, initialHomeContent);
  const [selectedKey, setSelectedKey] = useState(null);

  const updateTrustLabel = (i, value) =>
    updateField("trust", "labels", draft.trust.labels.map((l, idx) => (idx === i ? value : l)));

  const updateBullet = (i, value) =>
    updateField("story", "bullets", draft.story.bullets.map((b, idx) => (idx === i ? value : b)));
  const addBullet = () => updateField("story", "bullets", [...draft.story.bullets, ""]);
  const removeBullet = (i) => updateField("story", "bullets", draft.story.bullets.filter((_, idx) => idx !== i));

  const selected = HOME_SECTIONS.find((s) => s.key === selectedKey);

  return (
    <div data-testid="admin-home-editor" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      <EditorTopBar title="Conteúdo da Página Inicial" onReset={resetToDefaults} onSave={save} />

      <div className="flex-1 flex min-h-0">
        {/* tela — a Home real, secção a secção */}
        <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40" onClick={() => setSelectedKey(null)}>
          {HOME_SECTIONS.map(({ key, label, Component }) => (
            <SelectableSection key={key} label={label} selected={selectedKey === key} onSelect={() => setSelectedKey(key)} testid={`home-editor-section-${key}`}>
              <CartContext.Provider value={previewCart}>
                <Component content={draft[key]} />
              </CartContext.Provider>
            </SelectableSection>
          ))}
        </main>

        {/* propriedades */}
        <aside className="w-[320px] shrink-0 border-l hairline bg-white overflow-y-auto p-4" data-testid="home-editor-properties">
          {!selected ? (
            <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8">Clica numa secção da página para editar o seu conteúdo.</p>
          ) : (
            <div className="space-y-4">
              <SectionTitle eyebrow="secção" title={selected.label} />

              {(HOME_FIELDS[selected.key] || []).map((f) => (
                <FormRow key={f.key} label={f.label}>
                  {f.type === "textarea" ? (
                    <textarea rows={4} className={fieldClass} value={draft[selected.key][f.key]} onChange={(e) => updateField(selected.key, f.key, e.target.value)} data-testid={`home-field-${f.key}`} />
                  ) : (
                    <input className={fieldClass} value={draft[selected.key][f.key]} onChange={(e) => updateField(selected.key, f.key, e.target.value)} data-testid={`home-field-${f.key}`} />
                  )}
                </FormRow>
              ))}

              {selected.key !== "trust" && (
                <TitleStyleFields content={draft[selected.key]} sectionKey={selected.key} updateField={updateField} testidPrefix="home-title" />
              )}

              {(SECTION_BUTTONS[selected.key] || []).map(({ prefix, label }) => (
                <ButtonFields key={prefix} content={draft[selected.key]} sectionKey={selected.key} prefix={prefix} label={label} updateField={updateField} testidPrefix="home" />
              ))}

              {SECTION_LINKS[selected.key] && (
                <LinkFields content={draft[selected.key]} sectionKey={selected.key} prefix={SECTION_LINKS[selected.key].prefix} label={SECTION_LINKS[selected.key].label} updateField={updateField} testidPrefix="home-link" />
              )}

              {selected.key === "trust" && (
                <div className="space-y-3">
                  {draft.trust.labels.map((label, i) => (
                    <FormRow key={i} label={`Selo ${i + 1}`}>
                      <input className={fieldClass} value={label} onChange={(e) => updateTrustLabel(i, e.target.value)} data-testid={`home-trust-${i}`} />
                    </FormRow>
                  ))}
                </div>
              )}

              {selected.key === "story" && (
                <div className="border-t hairline pt-4">
                  <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Lista de pontos</p>
                  <div className="space-y-2">
                    {draft.story.bullets.map((bullet, i) => (
                      <div key={i} className="flex gap-2">
                        <input className={fieldClass + " mt-0"} value={bullet} onChange={(e) => updateBullet(i, e.target.value)} data-testid={`home-bullet-${i}`} />
                        <button onClick={() => removeBullet(i)} className="text-[var(--da-muted)] hover:text-red-600 px-2" aria-label="Remover" data-testid={`home-bullet-remove-${i}`}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addBullet} data-testid="home-bullet-add" className="mt-3 inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"><Plus size={13} /> Adicionar ponto</button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
