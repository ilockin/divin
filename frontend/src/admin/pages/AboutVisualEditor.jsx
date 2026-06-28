import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { ABOUT_SECTIONS } from "../../components/about/AboutSections";
import { ABOUT_FIELDS, SECTION_BUTTONS, initialAboutContent } from "../data/mockAboutContent";
import { FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { TitleStyleFields, ButtonFields } from "../components/contentEditor/ContentFieldEditors";
import { EditorTopBar } from "../components/contentEditor/EditorTopBar";
import { SelectableSection } from "../components/contentEditor/SelectableSection";
import { useContentDraft } from "../hooks/useContentDraft";

export const AboutVisualEditor = () => {
  const { aboutContent, setAboutContent } = useAdmin();
  const { draft, updateField, save, resetToDefaults } = useContentDraft(aboutContent, setAboutContent, initialAboutContent);
  const [selectedKey, setSelectedKey] = useState(null);

  const updateValueItem = (i, key, value) =>
    updateField("values", "items", draft.values.items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));

  const selected = ABOUT_SECTIONS.find((s) => s.key === selectedKey);

  return (
    <div data-testid="admin-about-editor" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      <EditorTopBar title="Conteúdo da Página Sobre" onReset={resetToDefaults} onSave={save} />

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40" onClick={() => setSelectedKey(null)}>
          {ABOUT_SECTIONS.map(({ key, label, Component }) => (
            <SelectableSection key={key} label={label} selected={selectedKey === key} onSelect={() => setSelectedKey(key)} testid={`about-editor-section-${key}`}>
              <Component content={draft[key]} />
            </SelectableSection>
          ))}
        </main>

        <aside className="w-[320px] shrink-0 border-l hairline bg-white overflow-y-auto p-4" data-testid="about-editor-properties">
          {!selected ? (
            <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8">Clica numa secção da página para editar o seu conteúdo.</p>
          ) : (
            <div className="space-y-4">
              <SectionTitle eyebrow="secção" title={selected.label} />

              {(ABOUT_FIELDS[selected.key] || []).map((f) => (
                <FormRow key={f.key} label={f.label}>
                  {f.type === "textarea" ? (
                    <textarea rows={4} className={fieldClass} value={draft[selected.key][f.key]} onChange={(e) => updateField(selected.key, f.key, e.target.value)} data-testid={`about-field-${f.key}`} />
                  ) : (
                    <input className={fieldClass} value={draft[selected.key][f.key]} onChange={(e) => updateField(selected.key, f.key, e.target.value)} data-testid={`about-field-${f.key}`} />
                  )}
                </FormRow>
              ))}

              <TitleStyleFields content={draft[selected.key]} sectionKey={selected.key} updateField={updateField} testidPrefix="about-title" />

              {(SECTION_BUTTONS[selected.key] || []).map(({ prefix, label }) => (
                <ButtonFields key={prefix} content={draft[selected.key]} sectionKey={selected.key} prefix={prefix} label={label} updateField={updateField} testidPrefix="about" />
              ))}

              {selected.key === "values" && (
                <div className="border-t hairline pt-4 space-y-4">
                  <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">Cartões de valores</p>
                  {draft.values.items.map((item, i) => (
                    <div key={i} className="border hairline rounded-lg p-3 space-y-2" data-testid={`about-value-${i}`}>
                      <FormRow label="Título">
                        <input className={fieldClass} value={item.title} onChange={(e) => updateValueItem(i, "title", e.target.value)} data-testid={`about-value-${i}-title`} />
                      </FormRow>
                      <FormRow label="Texto">
                        <textarea rows={2} className={fieldClass} value={item.text} onChange={(e) => updateValueItem(i, "text", e.target.value)} data-testid={`about-value-${i}-text`} />
                      </FormRow>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
