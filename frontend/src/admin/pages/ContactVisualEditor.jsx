import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../context/AdminContext";
import { HeaderSection, InfoSection, FormSection } from "../../components/contact/ContactSections";
import { HEADER_FIELDS, FIELD_TYPES, SECTIONS_WITH_BODY, makeFormField, initialContactContent } from "../data/mockContactContent";
import { EDITABLE_PAGES } from "../data/editablePages";
import { FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { TitleStyleFields, TextStyleFields } from "../components/contentEditor/ContentFieldEditors";
import { EditorTopBar } from "../components/contentEditor/EditorTopBar";
import { SelectableSection } from "../components/contentEditor/SelectableSection";
import { useContentDraft } from "../hooks/useContentDraft";

const SECTIONS = [
  { key: "header", label: "Cabeçalho" },
  { key: "form", label: "Formulário" },
  { key: "info", label: "Informações de contacto" },
];

export const ContactVisualEditor = () => {
  const { contactContent, saveContactContent } = useAdmin();
  const { draft, updateField, save, saving, resetToDefaults, isDirty } = useContentDraft(contactContent, saveContactContent, initialContactContent);
  const [selectedKey, setSelectedKey] = useState(null);

  const updateFormField = (id, key, value) =>
    updateField("form", "fields", draft.form.fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  const addFormField = () => updateField("form", "fields", [...draft.form.fields, makeFormField()]);
  const removeFormField = (id) => updateField("form", "fields", draft.form.fields.filter((f) => f.id !== id));

  const updateInfoCard = (i, key, value) =>
    updateField("info", "cards", draft.info.cards.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));

  const previewSubmit = (e) => {
    e.preventDefault();
    toast("Pré-visualização — o formulário não é submetido aqui.");
  };

  const selected = SECTIONS.find((s) => s.key === selectedKey);

  return (
    <div data-testid="admin-contact-editor" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      <EditorTopBar title="Conteúdo da Página Contacto" onReset={resetToDefaults} onSave={save} saving={saving} isDirty={isDirty} pages={EDITABLE_PAGES.filter((p) => p.path !== "/admin/conteudo-contacto")} />

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40 p-6" onClick={() => setSelectedKey(null)}>
          <div className="bg-white rounded-2xl p-6 mb-6">
            <SelectableSection label="Cabeçalho" selected={selectedKey === "header"} onSelect={() => setSelectedKey("header")} testid="contact-editor-section-header">
              <HeaderSection content={draft.header} />
            </SelectableSection>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <SelectableSection label="Formulário" selected={selectedKey === "form"} onSelect={() => setSelectedKey("form")} testid="contact-editor-section-form">
              <FormSection content={draft.form} values={{}} onChange={() => {}} onSubmit={previewSubmit} interactive={false} />
            </SelectableSection>
            <SelectableSection label="Informações de contacto" selected={selectedKey === "info"} onSelect={() => setSelectedKey("info")} testid="contact-editor-section-info">
              <InfoSection content={draft.info} />
            </SelectableSection>
          </div>
        </main>

        <aside className="w-[340px] shrink-0 border-l hairline bg-white overflow-y-auto p-4" data-testid="contact-editor-properties">
          {!selected ? (
            <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8">Clica numa secção da página para editar o seu conteúdo.</p>
          ) : (
            <div className="space-y-4">
              <SectionTitle eyebrow="secção" title={selected.label} />

              {selected.key === "header" && (
                <>
                  {HEADER_FIELDS.map((f) => (
                    <FormRow key={f.key} label={f.label}>
                      {f.type === "textarea" ? (
                        <textarea rows={3} className={fieldClass} value={draft.header[f.key]} onChange={(e) => updateField("header", f.key, e.target.value)} data-testid={`contact-header-${f.key}`} />
                      ) : (
                        <input className={fieldClass} value={draft.header[f.key]} onChange={(e) => updateField("header", f.key, e.target.value)} data-testid={`contact-header-${f.key}`} />
                      )}
                    </FormRow>
                  ))}
                  <TextStyleFields content={draft.header} sectionKey="header" updateField={updateField} prefix="eyebrow" label="Estilo do texto de abertura" testidPrefix="contact-eyebrow" />
                  <TitleStyleFields content={draft.header} sectionKey="header" updateField={updateField} testidPrefix="contact-title" />
                  {SECTIONS_WITH_BODY.includes("header") && (
                    <TextStyleFields content={draft.header} sectionKey="header" updateField={updateField} prefix="body" label="Estilo do subtítulo" testidPrefix="contact-body" />
                  )}
                </>
              )}

              {selected.key === "form" && (
                <>
                  <FormRow label="Texto do botão">
                    <input className={fieldClass} value={draft.form.submitText} onChange={(e) => updateField("form", "submitText", e.target.value)} data-testid="contact-form-submit-text" />
                  </FormRow>
                  <FormRow label="E-mail de notificação" hint="Guardado para quando ligarmos o envio de e-mail real, na fase de back-end — por agora não envia nada.">
                    <input className={fieldClass} value={draft.form.notifyEmail} onChange={(e) => updateField("form", "notifyEmail", e.target.value)} data-testid="contact-form-notify-email" />
                  </FormRow>

                  <div className="border-t hairline pt-4">
                    <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Campos do formulário</p>
                    <div className="space-y-3">
                      {draft.form.fields.map((f) => (
                        <div key={f.id} className="border hairline rounded-lg p-3 space-y-2" data-testid={`contact-field-editor-${f.id}`}>
                          <div className="flex justify-end">
                            <button onClick={() => removeFormField(f.id)} className="text-[var(--da-muted)] hover:text-red-600" aria-label="Remover campo" data-testid={`contact-field-remove-${f.id}`}><Trash2 size={13} /></button>
                          </div>
                          <FormRow label="Rótulo">
                            <input className={fieldClass} value={f.label} onChange={(e) => updateFormField(f.id, "label", e.target.value)} data-testid={`contact-field-label-${f.id}`} />
                          </FormRow>
                          <FormRow label="Tipo">
                            <select className={fieldClass} value={f.type} onChange={(e) => updateFormField(f.id, "type", e.target.value)} data-testid={`contact-field-type-${f.id}`}>
                              {FIELD_TYPES.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
                            </select>
                          </FormRow>
                          <label className="flex items-center gap-2 font-body text-sm">
                            <input type="checkbox" checked={f.required} onChange={(e) => updateFormField(f.id, "required", e.target.checked)} data-testid={`contact-field-required-${f.id}`} />
                            Obrigatório
                          </label>
                        </div>
                      ))}
                    </div>
                    <button onClick={addFormField} data-testid="contact-field-add" className="mt-3 inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"><Plus size={13} /> Adicionar campo</button>
                  </div>
                </>
              )}

              {selected.key === "info" && (
                <div className="space-y-4">
                  <TextStyleFields content={draft.info} sectionKey="info" updateField={updateField} prefix="itemTitle" label="Estilo do título dos cartões" testidPrefix="contact-item-title" />
                  <TextStyleFields content={draft.info} sectionKey="info" updateField={updateField} prefix="itemText" label="Estilo do texto dos cartões" testidPrefix="contact-item-text" />
                  {draft.info.cards.map((card, i) => (
                    <div key={i} className="border hairline rounded-lg p-3 space-y-2" data-testid={`contact-info-${i}`}>
                      <FormRow label="Título">
                        <input className={fieldClass} value={card.title} onChange={(e) => updateInfoCard(i, "title", e.target.value)} data-testid={`contact-info-${i}-title`} />
                      </FormRow>
                      <FormRow label="Linhas" hint="Uma por linha.">
                        <textarea rows={2} className={fieldClass} value={card.lines.join("\n")} onChange={(e) => updateInfoCard(i, "lines", e.target.value.split("\n"))} data-testid={`contact-info-${i}-lines`} />
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
