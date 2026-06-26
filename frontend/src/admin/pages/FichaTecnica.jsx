import React, { useMemo, useState } from "react";
import { Plus, X, FlaskConical, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, FormRow, fieldClass, KpiCard } from "../components/Bits";
import { StatusBadge } from "../components/DataTable";
import { useAdmin } from "../context/AdminContext";
import { getInsumo, lineCost, recipeMargin } from "../data/mockErp";
import { formatEUR, formatEUR3 } from "../../lib/format";

let rowSeq = 0;
const newRow = (insumos) => {
  const first = insumos[0];
  rowSeq += 1;
  return { id: `nr${Date.now()}-${rowSeq}`, insumoId: first?.id || "", qty: 0, unit: first?.unit || "un" };
};

export const FichaTecnica = () => {
  const { products, insumos, recipes, setRecipes } = useAdmin();
  const [selectedId, setSelectedId] = useState(products[0]?.id || null);
  const [lines, setLines] = useState(() => recipes[products[0]?.id]?.lines?.map((l) => ({ ...l })) || []);

  const product = products.find((p) => p.id === selectedId);

  const selectProduct = (id) => {
    setSelectedId(id);
    setLines(recipes[id]?.lines?.map((l) => ({ ...l })) || []);
  };

  const addLine = () => setLines((prev) => [...prev, newRow(insumos)]);
  const removeLine = (id) => setLines((prev) => prev.filter((l) => l.id !== id));
  const updateLine = (id, patch) => setLines((prev) => prev.map((l) => {
    if (l.id !== id) return l;
    const next = { ...l, ...patch };
    if (patch.insumoId) next.unit = getInsumo(insumos, patch.insumoId)?.unit || next.unit;
    return next;
  }));

  const { custo, margemEur, margemPct } = useMemo(
    () => recipeMargin({ lines }, insumos, product?.price || 0),
    [lines, insumos, product]
  );

  const marginTone = margemPct < 20 ? "negative" : "positive";

  const save = () => {
    if (lines.length === 0) { toast.error("Adiciona pelo menos um insumo à ficha."); return; }
    setRecipes((prev) => ({
      ...prev,
      [selectedId]: { updatedAt: new Date().toISOString(), lines: lines.map((l) => ({ ...l })) },
    }));
    toast.success(`Ficha técnica de "${product.name}" guardada.`);
  };

  return (
    <div data-testid="admin-ficha-tecnica">
      <PageHeader
        title="Ficha Técnica"
        subtitle="Receita de produção de cada produto (insumos e quantidades)."
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* lista de produtos */}
        <aside className="bg-white border hairline rounded-2xl p-4 h-fit" data-testid="ficha-product-list">
          <SectionTitle eyebrow="catálogo" title="Produtos" />
          <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
            {products.map((p) => {
              const has = !!recipes[p.id];
              const active = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => selectProduct(p.id)}
                    data-testid={`ficha-product-${p.id}`}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition ${active ? "bg-[var(--da-leaf)] text-white" : "hover:bg-[var(--da-cream-2)]/60"}`}
                  >
                    <span className="font-body text-sm truncate">{p.name}</span>
                    {has
                      ? <Check size={15} className={active ? "text-white shrink-0" : "text-[var(--da-leaf)] shrink-0"} />
                      : <span className={`text-[10px] uppercase tracking-[0.14em] shrink-0 ${active ? "text-white/80" : "text-[var(--da-muted)]"}`}>sem ficha</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* editor */}
        <div className="space-y-6">
          {!product ? (
            <div className="bg-white border hairline rounded-2xl p-10 text-center font-body text-sm text-[var(--da-muted)]">
              Seleciona um produto à esquerda.
            </div>
          ) : (
            <>
              <div className="bg-white border hairline rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.22em] uppercase text-[var(--da-leaf)]">ficha técnica</p>
                    <h2 className="text-xl sm:text-2xl text-[var(--da-forest)] font-serif-display tracking-[0.06em]">{product.name}</h2>
                    <p className="font-body text-xs text-[var(--da-muted)] mt-1">
                      Preço de venda: {formatEUR(product.price)} · {recipes[selectedId] ? <StatusBadge tone="green">Com ficha</StatusBadge> : <StatusBadge tone="muted">Sem ficha</StatusBadge>}
                    </p>
                  </div>
                  <button onClick={save} data-testid="ficha-save" className="btn-da btn-da-primary text-xs">Guardar ficha</button>
                </div>

                {/* linhas */}
                <div className="space-y-2" data-testid="ficha-lines">
                  <div className="grid grid-cols-[1fr_120px_70px_120px_40px] gap-3 px-1 pb-1 text-[10px] uppercase tracking-[0.16em] text-[var(--da-forest)]">
                    <span>Insumo</span><span>Quantidade</span><span>Unid.</span><span className="text-right">Custo</span><span />
                  </div>
                  {lines.length === 0 && (
                    <p className="font-body text-sm text-[var(--da-muted)] py-4">Sem insumos. Adiciona o primeiro.</p>
                  )}
                  {lines.map((l) => (
                    <div key={l.id} className="grid grid-cols-[1fr_120px_70px_120px_40px] gap-3 items-center" data-testid={`ficha-line-${l.id}`}>
                      <select className={fieldClass + " mt-0"} value={l.insumoId} onChange={(e) => updateLine(l.id, { insumoId: e.target.value })} data-testid={`ficha-line-insumo-${l.id}`}>
                        {insumos.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}
                      </select>
                      <input type="number" step="0.1" min="0" className={fieldClass + " mt-0"} value={l.qty} onChange={(e) => updateLine(l.id, { qty: parseFloat(e.target.value) || 0 })} data-testid={`ficha-line-qty-${l.id}`} />
                      <span className="font-body text-sm text-[var(--da-muted)] uppercase">{l.unit}</span>
                      <span className="font-body text-sm text-right">{formatEUR3(lineCost(l, insumos))}</span>
                      <button onClick={() => removeLine(l.id)} className="text-[var(--da-muted)] hover:text-red-600 flex justify-center" aria-label="Remover linha" data-testid={`ficha-line-remove-${l.id}`}><X size={15} /></button>
                    </div>
                  ))}
                  <button onClick={addLine} data-testid="ficha-line-add" className="mt-2 inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">
                    <Plus size={13} /> Adicionar insumo
                  </button>
                </div>
              </div>

              {/* resumo de custos / margem ao vivo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard testid="ficha-kpi-custo" label="Custo de produção" value={formatEUR(custo)} icon={FlaskConical} />
                <KpiCard testid="ficha-kpi-preco" label="Preço de venda" value={formatEUR(product.price)} />
                <KpiCard testid="ficha-kpi-margem" label="Margem" value={`${margemPct.toFixed(1)}%`} delta={`${formatEUR(margemEur)} por unidade`} deltaTone={marginTone} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
