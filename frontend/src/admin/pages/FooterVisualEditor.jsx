import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { NewsletterBar, FooterColumns, BottomBar } from "../../components/footer/FooterSections";
import { NEWSLETTER_FIELDS, BOTTOM_BAR_FIELDS, makeFooterColumn, initialFooterContent } from "../data/mockFooterContent";
import { rebalanceColumns } from "../data/mockPages";
import { EDITABLE_PAGES } from "../data/editablePages";
import { FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { ColorField, TextStyleFields, TitleStyleFields } from "../components/contentEditor/ContentFieldEditors";
import { EditorTopBar } from "../components/contentEditor/EditorTopBar";
import { SelectableSection } from "../components/contentEditor/SelectableSection";
import { useContentDraft } from "../hooks/useContentDraft";

export const FooterVisualEditor = () => {
  const { footerContent, saveFooterContent } = useAdmin();
  const { draft, setDraft, updateField, save, saving, resetToDefaults, isDirty } = useContentDraft(footerContent, saveFooterContent, initialFooterContent);
  const [selectedKey, setSelectedKey] = useState(null);

  const updateRoot = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateColumns = (updater) => setDraft((prev) => ({ ...prev, columns: updater(prev.columns) }));
  const updateColumnField = (colId, key, value) => updateColumns((cols) => cols.map((c) => (c.id === colId ? { ...c, [key]: value } : c)));
  const changeColumnType = (colId, type) =>
    updateColumns((cols) => cols.map((c) => (c.id === colId ? { ...makeFooterColumn(type), id: c.id, width: c.width, widthUnit: c.widthUnit } : c)));
  const addColumn = () => updateColumns((cols) => rebalanceColumns([...cols, makeFooterColumn("links")]));
  const removeColumn = (colId) => updateColumns((cols) => rebalanceColumns(cols.filter((c) => c.id !== colId)));
  const addColumnLink = (colId) => updateColumns((cols) => cols.map((c) => (c.id === colId ? { ...c, links: [...c.links, { label: "Novo link", url: "#" }] } : c)));
  const removeColumnLink = (colId, i) => updateColumns((cols) => cols.map((c) => (c.id === colId ? { ...c, links: c.links.filter((_, idx) => idx !== i) } : c)));
  const updateColumnLink = (colId, i, key, value) =>
    updateColumns((cols) => cols.map((c) => (c.id === colId ? { ...c, links: c.links.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)) } : c)));

  return (
    <div data-testid="admin-footer-editor" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      <EditorTopBar title="Conteúdo do Rodapé" onReset={resetToDefaults} onSave={save} saving={saving} isDirty={isDirty} pages={EDITABLE_PAGES.filter((p) => p.path !== "/admin/conteudo-rodape")} />

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40" onClick={() => setSelectedKey(null)}>
          <div className="bg-[var(--da-pine)] text-[#F7F4EC]" style={{ background: draft.bg || undefined, color: draft.textColor || undefined }}>
            <SelectableSection label="Barra de Newsletter" selected={selectedKey === "newsletter"} onSelect={() => setSelectedKey("newsletter")} testid="footer-editor-section-newsletter">
              <NewsletterBar content={draft.newsletter} />
            </SelectableSection>
            <SelectableSection label="Colunas de Links" selected={selectedKey === "columns"} onSelect={() => setSelectedKey("columns")} testid="footer-editor-section-columns">
              <FooterColumns columns={draft.columns} />
            </SelectableSection>
            <SelectableSection label="Barra Inferior" selected={selectedKey === "bottomBar"} onSelect={() => setSelectedKey("bottomBar")} testid="footer-editor-section-bottombar">
              <BottomBar content={draft.bottomBar} />
            </SelectableSection>
          </div>
        </main>

        <aside className="w-[340px] shrink-0 border-l hairline bg-white overflow-y-auto p-4 space-y-4" data-testid="footer-editor-properties">
          <div className="space-y-3">
            <SectionTitle eyebrow="rodapé" title="Aparência geral" />
            <FormRow label="Cor de fundo">
              <ColorField value={draft.bg} onChange={(v) => updateRoot("bg", v)} testid="footer-bg" />
            </FormRow>
            <FormRow label="Cor do texto">
              <ColorField value={draft.textColor} onChange={(v) => updateRoot("textColor", v)} testid="footer-text-color" />
            </FormRow>
          </div>

          {selectedKey === "newsletter" && (
            <div className="border-t hairline pt-4 space-y-4">
              <SectionTitle eyebrow="secção" title="Barra de Newsletter" />
              {NEWSLETTER_FIELDS.map((f) => (
                <FormRow key={f.key} label={f.label}>
                  {f.type === "textarea" ? (
                    <textarea rows={3} className={fieldClass} value={draft.newsletter[f.key]} onChange={(e) => updateField("newsletter", f.key, e.target.value)} data-testid={`footer-newsletter-${f.key}`} />
                  ) : (
                    <input className={fieldClass} value={draft.newsletter[f.key]} onChange={(e) => updateField("newsletter", f.key, e.target.value)} data-testid={`footer-newsletter-${f.key}`} />
                  )}
                </FormRow>
              ))}
              <FormRow label="Cor de fundo da barra">
                <ColorField value={draft.newsletter.bg} onChange={(v) => updateField("newsletter", "bg", v)} testid="footer-newsletter-bg" />
              </FormRow>
              <TextStyleFields content={draft.newsletter} sectionKey="newsletter" updateField={updateField} prefix="eyebrow" label="Estilo do texto de abertura" testidPrefix="footer-newsletter-eyebrow" />
              <TitleStyleFields content={draft.newsletter} sectionKey="newsletter" updateField={updateField} testidPrefix="footer-newsletter-title" />
              <TextStyleFields content={draft.newsletter} sectionKey="newsletter" updateField={updateField} prefix="body" label="Estilo do texto" testidPrefix="footer-newsletter-body" />
            </div>
          )}

          {selectedKey === "columns" && (
            <div className="border-t hairline pt-4 space-y-4">
              <SectionTitle eyebrow="secção" title="Colunas de Links" />
              {draft.columns.map((col, i) => (
                <div key={col.id} className="border hairline rounded-lg p-3 space-y-3" data-testid={`footer-column-${col.id}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">Coluna {i + 1}</p>
                    <button onClick={() => removeColumn(col.id)} disabled={draft.columns.length <= 1} className="text-[var(--da-muted)] hover:text-red-600 disabled:opacity-30" aria-label="Remover coluna" data-testid={`footer-column-${col.id}-remove`}><Trash2 size={13} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormRow label="Largura">
                      <input type="number" min="1" className={fieldClass} value={col.width} onChange={(e) => updateColumnField(col.id, "width", parseInt(e.target.value, 10) || 0)} data-testid={`footer-column-${col.id}-width`} />
                    </FormRow>
                    <FormRow label="Unidade">
                      <select className={fieldClass} value={col.widthUnit} onChange={(e) => updateColumnField(col.id, "widthUnit", e.target.value)} data-testid={`footer-column-${col.id}-unit`}>
                        <option value="%">%</option>
                        <option value="px">px</option>
                      </select>
                    </FormRow>
                  </div>
                  <FormRow label="Tipo de coluna">
                    <select className={fieldClass} value={col.type} onChange={(e) => changeColumnType(col.id, e.target.value)} data-testid={`footer-column-${col.id}-type`}>
                      <option value="brand">Marca (logo + texto + redes sociais)</option>
                      <option value="links">Lista de links</option>
                    </select>
                  </FormRow>

                  {col.type === "brand" ? (
                    <div className="space-y-3 border-t hairline pt-3">
                      <FormRow label="Texto">
                        <textarea rows={3} className={fieldClass} value={col.text} onChange={(e) => updateColumnField(col.id, "text", e.target.value)} data-testid={`footer-column-${col.id}-text`} />
                      </FormRow>
                      <label className="flex items-center gap-2 font-body text-sm">
                        <input type="checkbox" checked={col.showSocial} onChange={(e) => updateColumnField(col.id, "showSocial", e.target.checked)} data-testid={`footer-column-${col.id}-show-social`} />
                        Mostrar ícones de redes sociais
                      </label>
                      <FormRow label="Cor do texto">
                        <ColorField value={col.textColor} onChange={(v) => updateColumnField(col.id, "textColor", v)} testid={`footer-column-${col.id}-text-color`} />
                      </FormRow>
                    </div>
                  ) : (
                    <div className="space-y-3 border-t hairline pt-3">
                      <FormRow label="Título da coluna">
                        <input className={fieldClass} value={col.heading} onChange={(e) => updateColumnField(col.id, "heading", e.target.value)} data-testid={`footer-column-${col.id}-heading`} />
                      </FormRow>
                      <FormRow label="Cor do título">
                        <ColorField value={col.headingColor} onChange={(v) => updateColumnField(col.id, "headingColor", v)} testid={`footer-column-${col.id}-heading-color`} />
                      </FormRow>
                      <FormRow label="Cor dos links">
                        <ColorField value={col.linkColor} onChange={(v) => updateColumnField(col.id, "linkColor", v)} testid={`footer-column-${col.id}-link-color`} />
                      </FormRow>
                      <div className="space-y-2">
                        <p className="font-body text-[11px] tracking-[0.18em] uppercase text-[var(--da-muted)]">Links</p>
                        {col.links.map((link, i2) => (
                          <div key={i2} className="flex items-center gap-2" data-testid={`footer-column-${col.id}-link-${i2}`}>
                            <input className={fieldClass + " mt-0"} placeholder="Texto" value={link.label} onChange={(e) => updateColumnLink(col.id, i2, "label", e.target.value)} data-testid={`footer-column-${col.id}-link-${i2}-label`} />
                            <input className={fieldClass + " mt-0"} placeholder="URL" value={link.url} onChange={(e) => updateColumnLink(col.id, i2, "url", e.target.value)} data-testid={`footer-column-${col.id}-link-${i2}-url`} />
                            <button onClick={() => removeColumnLink(col.id, i2)} className="text-[var(--da-muted)] hover:text-red-600 shrink-0" aria-label="Remover link" data-testid={`footer-column-${col.id}-link-${i2}-remove`}><Trash2 size={13} /></button>
                          </div>
                        ))}
                        <button onClick={() => addColumnLink(col.id)} data-testid={`footer-column-${col.id}-link-add`} className="inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"><Plus size={13} /> Adicionar link</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addColumn} data-testid="footer-column-add" className="inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"><Plus size={13} /> Adicionar coluna</button>
            </div>
          )}

          {selectedKey === "bottomBar" && (
            <div className="border-t hairline pt-4 space-y-4">
              <SectionTitle eyebrow="secção" title="Barra Inferior" />
              {BOTTOM_BAR_FIELDS.map((f) => (
                <FormRow key={f.key} label={f.label} hint={f.key === "text" ? 'Usa "{ano}" para inserir o ano atual automaticamente.' : undefined}>
                  <input className={fieldClass} value={draft.bottomBar[f.key]} onChange={(e) => updateField("bottomBar", f.key, e.target.value)} data-testid={`footer-bottombar-${f.key}`} />
                </FormRow>
              ))}
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" checked={draft.bottomBar.showPaymentBadges} onChange={(e) => updateField("bottomBar", "showPaymentBadges", e.target.checked)} data-testid="footer-bottombar-show-badges" />
                Mostrar selos de pagamento
              </label>
              <FormRow label="Cor de fundo">
                <ColorField value={draft.bottomBar.bg} onChange={(v) => updateField("bottomBar", "bg", v)} testid="footer-bottombar-bg" />
              </FormRow>
              <FormRow label="Cor do texto">
                <ColorField value={draft.bottomBar.textColor} onChange={(v) => updateField("bottomBar", "textColor", v)} testid="footer-bottombar-text-color" />
              </FormRow>
            </div>
          )}

          {!selectedKey && (
            <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8 border-t hairline pt-8">Clica numa secção do rodapé para editar o seu conteúdo.</p>
          )}
        </aside>
      </div>
    </div>
  );
};
