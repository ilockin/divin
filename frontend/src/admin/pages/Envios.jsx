import React, { useState } from "react";
import { Plus, Pencil, Trash2, Globe, MapPin, Tags } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, SectionTitle, FormRow, fieldClass } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { PT_DISTRICTS, ES_REGIONS } from "../data/mockErp";
import { adminCategories } from "../data/mockAdmin";
import { formatEUR } from "../../lib/format";

// chips com os nomes dos métodos
const MethodChips = ({ ids, methods, fallback = "—" }) => {
  if (!ids || ids.length === 0) return <span className="font-body text-xs text-[var(--da-muted)] italic">{fallback}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const m = methods.find((x) => x.id === id);
        if (!m) return null;
        return <span key={id} className="inline-block text-[11px] font-body bg-[var(--da-cream-2)] text-[var(--da-forest)] rounded-full px-2.5 py-1">{m.name}</span>;
      })}
    </div>
  );
};

// seletor de métodos com override opcional de custo/prazo
const MethodPicker = ({ methods, methodIds, overrides, onToggle, withOverrides, onOverride }) => (
  <div className="space-y-2">
    {methods.map((m) => {
      const checked = methodIds.includes(m.id);
      const ov = overrides[m.id] || {};
      return (
        <div key={m.id} className="border hairline rounded-lg p-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="flex items-center gap-2 font-body text-sm">
              <input type="checkbox" checked={checked} onChange={() => onToggle(m.id)} data-testid={`picker-method-${m.id}`} /> {m.name}
            </span>
            <span className="font-body text-[11px] text-[var(--da-muted)]">{m.cost === 0 ? "Grátis" : formatEUR(m.cost)} · {m.eta}</span>
          </label>
          {withOverrides && checked && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t hairline">
              <FormRow label="Custo (override €)">
                <input type="number" step="0.1" min="0" className={fieldClass} placeholder={`predef. ${m.cost}`} value={ov.cost ?? ""} onChange={(e) => onOverride(m.id, "cost", e.target.value === "" ? undefined : parseFloat(e.target.value))} data-testid={`picker-cost-${m.id}`} />
              </FormRow>
              <FormRow label="Prazo (override)">
                <input className={fieldClass} placeholder={`predef. ${m.eta}`} value={ov.eta ?? ""} onChange={(e) => onOverride(m.id, "eta", e.target.value === "" ? undefined : e.target.value)} data-testid={`picker-eta-${m.id}`} />
              </FormRow>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const TABS = [
  { id: "zonas", label: "Zonas por País", icon: Globe },
  { id: "distritos", label: "Distritos (Portugal e Espanha)", icon: MapPin },
  { id: "categorias", label: "Regras por Categoria/Produto", icon: Tags },
];

export const Envios = () => {
  const {
    shippingMethods,
    shippingZones, setShippingZones,
    districtRules, setDistrictRules,
    categoryRules, setCategoryRules,
  } = useAdmin();

  const [tab, setTab] = useState("zonas");
  const [country, setCountry] = useState("PT");
  const [editor, setEditor] = useState(null); // descritor de edição

  // ---- abrir editores ----
  const openZone = (z) => setEditor({
    kind: "zone", isNew: !z, zoneId: z?.id, name: z?.name || "",
    methodIds: z ? [...z.methodIds] : [], overrides: z ? JSON.parse(JSON.stringify(z.overrides || {})) : {},
    active: z ? z.active : true,
  });

  const openDistrict = (name) => {
    const rule = districtRules[country]?.[name];
    setEditor({
      kind: "district", country, name,
      methodIds: rule ? [...rule.methodIds] : [], overrides: rule ? JSON.parse(JSON.stringify(rule.overrides || {})) : {},
    });
  };

  const openCategory = (slug, label, isDefault = false) => {
    const ids = isDefault ? categoryRules.default : categoryRules.bySlug[slug];
    setEditor({ kind: "category", slug, name: label, isDefault, methodIds: ids ? [...ids] : [] });
  };

  // ---- helpers do editor ----
  const toggleMethod = (id) => setEditor((e) => {
    const has = e.methodIds.includes(id);
    const methodIds = has ? e.methodIds.filter((x) => x !== id) : [...e.methodIds, id];
    const overrides = { ...e.overrides };
    if (has) delete overrides[id];
    return { ...e, methodIds, overrides };
  });
  const setOverride = (id, key, value) => setEditor((e) => {
    const cur = { ...(e.overrides[id] || {}) };
    if (value === undefined) delete cur[key]; else cur[key] = value;
    const overrides = { ...e.overrides };
    if (Object.keys(cur).length === 0) delete overrides[id]; else overrides[id] = cur;
    return { ...e, overrides };
  });

  // ---- guardar ----
  const saveEditor = () => {
    const e = editor;
    if (e.kind === "zone") {
      if (!e.name.trim()) { toast.error("Indica o nome da zona."); return; }
      if (e.isNew) {
        const id = "z-" + e.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        setShippingZones((prev) => [...prev, { id, name: e.name, active: e.active, methodIds: e.methodIds, overrides: e.overrides }]);
        toast.success("Zona adicionada.");
      } else {
        setShippingZones((prev) => prev.map((z) => z.id === e.zoneId ? { ...z, name: e.name, active: e.active, methodIds: e.methodIds, overrides: e.overrides } : z));
        toast.success("Zona atualizada.");
      }
    } else if (e.kind === "district") {
      setDistrictRules((prev) => {
        const next = { ...prev, [e.country]: { ...prev[e.country] } };
        if (e.methodIds.length === 0) delete next[e.country][e.name];
        else next[e.country][e.name] = { methodIds: e.methodIds, overrides: e.overrides };
        return next;
      });
      toast.success("Regra de distrito guardada.");
    } else if (e.kind === "category") {
      if (e.isDefault) {
        setCategoryRules((prev) => ({ ...prev, default: e.methodIds }));
      } else {
        setCategoryRules((prev) => {
          const bySlug = { ...prev.bySlug };
          if (e.methodIds.length === 0) delete bySlug[e.slug];
          else bySlug[e.slug] = e.methodIds;
          return { ...prev, bySlug };
        });
      }
      toast.success("Regra de categoria guardada.");
    }
    setEditor(null);
  };

  const removeZone = (z) => {
    if (!window.confirm(`Remover a zona "${z.name}"?`)) return;
    setShippingZones((prev) => prev.filter((x) => x.id !== z.id));
    toast.success("Zona removida.");
  };
  const clearDistrict = (name) => {
    setDistrictRules((prev) => {
      const next = { ...prev, [country]: { ...prev[country] } };
      delete next[country][name];
      return next;
    });
    toast.success("Regra removida — passa a herdar da zona.");
  };
  const clearCategory = (slug) => {
    setCategoryRules((prev) => {
      const bySlug = { ...prev.bySlug };
      delete bySlug[slug];
      return { ...prev, bySlug };
    });
    toast.success("Regra removida — passa a usar a predefinida.");
  };

  const districts = country === "PT" ? PT_DISTRICTS : ES_REGIONS;

  return (
    <div data-testid="admin-envios">
      <PageHeader title="Gestão de Envios" subtitle="Regras de envio por zona, distrito e categoria de produto." />

      {/* tabs */}
      <div className="flex flex-wrap gap-2 mb-6" data-testid="envios-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            data-testid={`envios-tab-${id}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm transition border hairline ${tab === id ? "bg-[var(--da-leaf)] text-white border-transparent" : "bg-white hover:bg-[var(--da-cream-2)]/60 text-[var(--da-forest)]"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* TAB 1 — Zonas por País */}
      {tab === "zonas" && (
        <section className="bg-white border hairline rounded-2xl p-6" data-testid="tab-zonas">
          <SectionTitle
            eyebrow="zonas"
            title="Zonas por país"
            action={<button onClick={() => openZone(null)} data-testid="zone-new" className="btn-da btn-da-primary text-xs"><Plus size={14} /> Adicionar país/zona</button>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-[var(--da-cream-2)]/40 border-y hairline">
                <tr>
                  {["País / Zona", "Métodos disponíveis", "Estado", ""].map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shippingZones.map((z) => (
                  <tr key={z.id} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30" data-testid={`zone-row-${z.id}`}>
                    <td className="px-3 py-3 font-semibold text-[var(--da-forest)]">{z.name}</td>
                    <td className="px-3 py-3"><MethodChips ids={z.methodIds} methods={shippingMethods} fallback="Sem métodos" /></td>
                    <td className="px-3 py-3"><StatusBadge tone={z.active ? "green" : "muted"}>{z.active ? "Ativo" : "Inativo"}</StatusBadge></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openZone(z)} data-testid={`zone-edit-${z.id}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center" aria-label="Editar"><Pencil size={14} /></button>
                        <button onClick={() => removeZone(z)} data-testid={`zone-remove-${z.id}`} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" aria-label="Remover"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2 — Distritos */}
      {tab === "distritos" && (
        <section className="bg-white border hairline rounded-2xl p-6" data-testid="tab-distritos">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <SectionTitle eyebrow="distritos" title="Distritos e regiões" />
            <div className="inline-flex rounded-lg border hairline overflow-hidden">
              {[{ id: "PT", label: "Portugal" }, { id: "ES", label: "Espanha" }].map((c) => (
                <button key={c.id} onClick={() => setCountry(c.id)} data-testid={`country-${c.id}`} className={`px-4 py-2 font-body text-sm ${country === c.id ? "bg-[var(--da-leaf)] text-white" : "bg-white text-[var(--da-forest)] hover:bg-[var(--da-cream-2)]/60"}`}>{c.label}</button>
              ))}
            </div>
          </div>
          <p className="font-body text-[13px] text-[var(--da-muted)] mb-4 bg-[var(--da-cream-2)]/50 border hairline rounded-xl px-4 py-2.5">
            Estas regras são mais específicas e têm prioridade sobre a zona do país.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-[var(--da-cream-2)]/40 border-y hairline">
                <tr>
                  {["Distrito / Região", "Métodos", ""].map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {districts.map((name) => {
                  const rule = districtRules[country]?.[name];
                  return (
                    <tr key={name} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30" data-testid={`district-row-${name}`}>
                      <td className="px-3 py-3 font-semibold text-[var(--da-forest)]">{name}</td>
                      <td className="px-3 py-3"><MethodChips ids={rule?.methodIds} methods={shippingMethods} fallback="Herda da zona do país" /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openDistrict(name)} data-testid={`district-edit-${name}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center" aria-label="Editar"><Pencil size={14} /></button>
                          {rule && <button onClick={() => clearDistrict(name)} data-testid={`district-clear-${name}`} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" aria-label="Remover regra"><Trash2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3 — Categorias */}
      {tab === "categorias" && (
        <section className="bg-white border hairline rounded-2xl p-6" data-testid="tab-categorias">
          <SectionTitle eyebrow="categorias" title="Regras por categoria/produto" />
          <p className="font-body text-[13px] text-[var(--da-muted)] mb-4 bg-[var(--da-cream-2)]/50 border hairline rounded-xl px-4 py-2.5">
            Define que tipos de produto podem usar que modos de envio.
          </p>

          {/* regra predefinida */}
          <div className="border hairline rounded-xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap bg-[var(--da-cream-2)]/30" data-testid="category-default">
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Regra predefinida</p>
              <MethodChips ids={categoryRules.default} methods={shippingMethods} fallback="Sem métodos" />
              <p className="font-body text-[11px] text-[var(--da-muted)] mt-2">Aplica-se às categorias sem regra específica.</p>
            </div>
            <button onClick={() => openCategory(null, "Regra predefinida", true)} data-testid="category-default-edit" className="btn-da btn-da-outline text-xs"><Pencil size={13} /> Editar</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-[var(--da-cream-2)]/40 border-y hairline">
                <tr>
                  {["Categoria", "Métodos permitidos", ""].map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminCategories.map((c) => {
                  const ids = categoryRules.bySlug[c.slug];
                  return (
                    <tr key={c.slug} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30" data-testid={`category-row-${c.slug}`}>
                      <td className="px-3 py-3 font-semibold text-[var(--da-forest)]">{c.name}</td>
                      <td className="px-3 py-3"><MethodChips ids={ids} methods={shippingMethods} fallback="Usa a regra predefinida" /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openCategory(c.slug, c.name)} data-testid={`category-edit-${c.slug}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center" aria-label="Editar"><Pencil size={14} /></button>
                          {ids && <button onClick={() => clearCategory(c.slug)} data-testid={`category-clear-${c.slug}`} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" aria-label="Remover regra"><Trash2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* editor partilhado */}
      <Modal
        open={!!editor}
        onClose={() => setEditor(null)}
        title={editor?.kind === "zone" ? (editor.isNew ? "Adicionar país/zona" : `Editar: ${editor.name}`)
          : editor?.kind === "district" ? `Distrito: ${editor?.name}`
          : editor?.isDefault ? "Regra predefinida" : `Categoria: ${editor?.name}`}
        size="lg"
        testid="envios-editor"
        footer={(
          <>
            <button onClick={() => setEditor(null)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={saveEditor} data-testid="envios-editor-save" className="btn-da btn-da-primary text-xs">Guardar</button>
          </>
        )}
      >
        {editor && (
          <div className="space-y-4">
            {editor.kind === "zone" && (
              <>
                <FormRow label="Nome do país/zona" required>
                  <input className={fieldClass} value={editor.name} onChange={(e) => setEditor((s) => ({ ...s, name: e.target.value }))} data-testid="zone-name" />
                </FormRow>
                <div className="flex items-center justify-between border hairline rounded-lg px-3 py-2.5">
                  <span className="font-body text-sm">Zona ativa</span>
                  <button type="button" onClick={() => setEditor((s) => ({ ...s, active: !s.active }))} data-testid="zone-active" className={`relative w-11 h-6 rounded-full transition ${editor.active ? "bg-[var(--da-leaf)]" : "bg-[var(--da-line)]"}`} role="switch" aria-checked={editor.active}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition transform ${editor.active ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </>
            )}

            {editor.kind === "category" && !editor.isDefault && (
              <p className="font-body text-[12px] text-[var(--da-muted)]">Deixa sem métodos para esta categoria usar a regra predefinida.</p>
            )}
            {editor.kind === "district" && (
              <p className="font-body text-[12px] text-[var(--da-muted)]">Deixa sem métodos para este distrito herdar da zona do país.</p>
            )}

            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Métodos disponíveis</p>
              <MethodPicker
                methods={shippingMethods}
                methodIds={editor.methodIds}
                overrides={editor.overrides || {}}
                onToggle={toggleMethod}
                onOverride={setOverride}
                withOverrides={editor.kind === "zone" || editor.kind === "district"}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
