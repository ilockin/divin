import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Save, RotateCcw, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../context/AdminContext";
import { CartContext } from "../../context/CartContext";
import { HOME_SECTIONS } from "../../components/home/HomeSections";
import { HOME_FIELDS, FONT_OPTIONS, FONT_SIZE_OPTIONS, SECTION_BUTTONS, SECTION_LINKS, initialHomeContent } from "../data/mockHomeContent";
import { FormRow, fieldClass, SectionTitle } from "../components/Bits";

const cloneContent = (c) => JSON.parse(JSON.stringify(c));

const RADIUS_PRESETS = [
  { label: "Quadrado", value: 0 },
  { label: "Arredondado", value: 12 },
  { label: "Pílula", value: 999 },
];

// Input duplo cor (color picker) + hex em texto — mesmo padrão já usado no PageBuilder para blocos.
const ColorField = ({ value, onChange, testid }) => (
  <div className="flex items-center gap-2 mt-2">
    <input type="color" value={value || "#ffffff"} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="w-10 h-9 rounded border hairline" />
    <input className={fieldClass + " mt-0"} value={value} placeholder="vazio = cor original" onChange={(e) => onChange(e.target.value)} data-testid={`${testid}-hex`} />
  </div>
);

const RadiusField = ({ value, onChange, testid }) => (
  <div>
    <div className="flex gap-2 mt-2">
      {RADIUS_PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => onChange(p.value)}
          data-testid={`${testid}-preset-${p.value}`}
          className={`text-xs font-body px-3 py-1.5 rounded-full border hairline ${value === p.value ? "bg-[var(--da-leaf)] text-white border-transparent" : "hover:bg-[var(--da-cream-2)]/60"}`}
        >
          {p.label}
        </button>
      ))}
    </div>
    <input type="number" min="0" max="999" className={fieldClass} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} data-testid={testid} />
  </div>
);

// O admin não tem CartProvider (só a loja pública tem); aqui simulamos um contexto
// inerte só para a secção "Produtos em destaque" (ProductCard) conseguir renderizar
// na pré-visualização, sem tocar no carrinho real do cliente.
const previewCart = {
  addItem: () => toast("Pré-visualização — \"Adicionar\" não tem efeito aqui."),
};

export const HomeVisualEditor = () => {
  const { homeContent, setHomeContent } = useAdmin();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => cloneContent(homeContent));
  const [selectedKey, setSelectedKey] = useState(null);

  const updateField = (sectionKey, fieldKey, value) =>
    setDraft((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [fieldKey]: value } }));

  const updateTrustLabel = (i, value) =>
    setDraft((prev) => ({ ...prev, trust: { ...prev.trust, labels: prev.trust.labels.map((l, idx) => (idx === i ? value : l)) } }));

  const updateBullet = (i, value) =>
    setDraft((prev) => ({ ...prev, story: { ...prev.story, bullets: prev.story.bullets.map((b, idx) => (idx === i ? value : b)) } }));
  const addBullet = () => setDraft((prev) => ({ ...prev, story: { ...prev.story, bullets: [...prev.story.bullets, ""] } }));
  const removeBullet = (i) => setDraft((prev) => ({ ...prev, story: { ...prev.story, bullets: prev.story.bullets.filter((_, idx) => idx !== i) } }));

  const save = () => {
    setHomeContent(draft);
    toast.success("Página inicial atualizada.");
  };

  const resetToDefaults = () => {
    if (!window.confirm("Repor os textos predefinidos da página inicial? (só passa a valer depois de Guardar)")) return;
    setDraft(cloneContent(initialHomeContent));
    toast("Predefinições aplicadas — clica em Guardar para confirmar.");
  };

  const selected = HOME_SECTIONS.find((s) => s.key === selectedKey);

  return (
    <div data-testid="admin-home-editor" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      {/* barra superior */}
      <div className="bg-white border-b hairline px-4 py-3 flex items-center gap-3 flex-wrap">
        <p className="font-serif-display text-lg text-[var(--da-forest)] px-1">Conteúdo da Página Inicial</p>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => navigate("/admin")} data-testid="home-editor-cancel" className="btn-da btn-da-ghost text-xs">
            <X size={14} /> Cancelar
          </button>
          <button onClick={resetToDefaults} data-testid="home-editor-reset" className="btn-da btn-da-outline text-xs">
            <RotateCcw size={14} /> Repor predefinições
          </button>
          <button onClick={save} data-testid="home-editor-save" className="btn-da btn-da-primary text-xs">
            <Save size={14} /> Guardar
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* tela — a Home real, secção a secção */}
        <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40" onClick={() => setSelectedKey(null)}>
          {HOME_SECTIONS.map(({ key, label, Component }) => (
            <div
              key={key}
              onClick={(e) => { e.stopPropagation(); setSelectedKey(key); }}
              data-testid={`home-editor-section-${key}`}
              className={`relative group ${selectedKey === key ? "ring-2 ring-[var(--da-leaf)]" : "ring-1 ring-transparent hover:ring-[var(--da-line)]"}`}
            >
              <div className={`absolute z-10 top-3 right-3 transition ${selectedKey === key ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--da-forest)] text-white font-body text-xs shadow-sm">
                  <Pencil size={12} /> {label}
                </span>
              </div>
              <CartContext.Provider value={previewCart}>
                <Component content={draft[key]} />
              </CartContext.Provider>
            </div>
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
                <div className="border-t hairline pt-4 space-y-4">
                  <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">Estilo do título</p>
                  <FormRow label="Fonte">
                    <select className={fieldClass} value={draft[selected.key].titleFont} onChange={(e) => updateField(selected.key, "titleFont", e.target.value)} data-testid="home-title-font">
                      {FONT_OPTIONS.map((f) => (<option key={f.id} value={f.id}>{f.label}</option>))}
                    </select>
                  </FormRow>
                  <FormRow label="Tamanho">
                    <select className={fieldClass} value={draft[selected.key].titleSize} onChange={(e) => updateField(selected.key, "titleSize", e.target.value)} data-testid="home-title-size">
                      {FONT_SIZE_OPTIONS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
                    </select>
                  </FormRow>
                  <FormRow label="Cor do título">
                    <ColorField value={draft[selected.key].titleColor} onChange={(v) => updateField(selected.key, "titleColor", v)} testid="home-title-color" />
                  </FormRow>
                </div>
              )}

              {(SECTION_BUTTONS[selected.key] || []).map(({ prefix, label }) => (
                <div key={prefix} className="border-t hairline pt-4 space-y-4">
                  <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">{label}</p>
                  <FormRow label="Texto">
                    <input className={fieldClass} value={draft[selected.key][`${prefix}Text`]} onChange={(e) => updateField(selected.key, `${prefix}Text`, e.target.value)} data-testid={`home-${prefix}-text`} />
                  </FormRow>
                  <FormRow label="Link">
                    <input className={fieldClass} value={draft[selected.key][`${prefix}Link`]} onChange={(e) => updateField(selected.key, `${prefix}Link`, e.target.value)} data-testid={`home-${prefix}-link`} />
                  </FormRow>
                  <FormRow label="Cor de fundo" hint="Vazio mantém a cor e o efeito hover originais.">
                    <ColorField value={draft[selected.key][`${prefix}Bg`]} onChange={(v) => updateField(selected.key, `${prefix}Bg`, v)} testid={`home-${prefix}-bg`} />
                  </FormRow>
                  <FormRow label="Raio da borda (px)">
                    <RadiusField value={draft[selected.key][`${prefix}Radius`]} onChange={(v) => updateField(selected.key, `${prefix}Radius`, v)} testid={`home-${prefix}-radius`} />
                  </FormRow>
                </div>
              ))}

              {SECTION_LINKS[selected.key] && (
                <div className="border-t hairline pt-4 space-y-4">
                  <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">{SECTION_LINKS[selected.key].label}</p>
                  <FormRow label="Texto">
                    <input className={fieldClass} value={draft[selected.key][`${SECTION_LINKS[selected.key].prefix}Text`]} onChange={(e) => updateField(selected.key, `${SECTION_LINKS[selected.key].prefix}Text`, e.target.value)} data-testid="home-link-text" />
                  </FormRow>
                  <FormRow label="Link">
                    <input className={fieldClass} value={draft[selected.key][`${SECTION_LINKS[selected.key].prefix}Href`]} onChange={(e) => updateField(selected.key, `${SECTION_LINKS[selected.key].prefix}Href`, e.target.value)} data-testid="home-link-href" />
                  </FormRow>
                </div>
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
