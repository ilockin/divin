import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { SUPPLIERS, PURCHASE_STATES, getInsumo, purchaseTotal } from "../data/mockErp";
import { formatEUR, formatEUR3 } from "../../lib/format";

const supplierName = (id) => SUPPLIERS.find((s) => s.id === id)?.name || "—";
const stateOf = (id) => PURCHASE_STATES.find((s) => s.id === id);

const nextPurchaseId = (purchases) => {
  const year = new Date().getFullYear();
  const nums = purchases.map((p) => parseInt(String(p.id).split("-").pop(), 10)).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `CP-${year}-${String(next).padStart(3, "0")}`;
};

let lineSeq = 0;
const newLine = (insumos) => {
  const first = insumos[0];
  lineSeq += 1;
  return { key: `nl${Date.now()}-${lineSeq}`, insumoId: first?.id || "", qty: 0, cost: first?.cost || 0 };
};

const emptyPurchase = (insumos) => ({
  id: null,
  supplierId: SUPPLIERS[0].id,
  date: new Date().toISOString().slice(0, 10),
  status: "rascunho",
  lines: [newLine(insumos)],
});

export const Compras = () => {
  const { purchases, setPurchases, insumos } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => emptyPurchase(insumos));

  const startNew = () => { setForm(emptyPurchase(insumos)); setOpen(true); };
  const startEdit = (row) => {
    setForm({ ...row, lines: row.lines.map((l, i) => ({ key: `e${i}`, ...l })) });
    setOpen(true);
  };

  const remove = (row) => {
    if (!window.confirm(`Remover a compra ${row.id}?`)) return;
    setPurchases((prev) => prev.filter((x) => x.id !== row.id));
    toast.success("Compra removida.");
  };

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, newLine(insumos)] }));
  const removeLine = (key) => setForm((f) => ({ ...f, lines: f.lines.filter((l) => l.key !== key) }));
  const updateLine = (key, patch) => setForm((f) => ({
    ...f,
    lines: f.lines.map((l) => {
      if (l.key !== key) return l;
      const next = { ...l, ...patch };
      if (patch.insumoId) next.cost = getInsumo(insumos, patch.insumoId)?.cost ?? next.cost;
      return next;
    }),
  }));

  const formTotal = purchaseTotal(form);

  const save = () => {
    if (form.lines.length === 0) { toast.error("Adiciona pelo menos uma linha de insumo."); return; }
    const payload = {
      ...form,
      lines: form.lines.map(({ insumoId, qty, cost }) => ({ insumoId, qty: parseFloat(qty) || 0, cost: parseFloat(cost) || 0 })),
    };
    if (form.id) {
      setPurchases((prev) => prev.map((x) => x.id === form.id ? payload : x));
      toast.success("Compra atualizada.");
    } else {
      const id = nextPurchaseId(purchases);
      setPurchases((prev) => [{ ...payload, id }, ...prev]);
      toast.success(`Compra ${id} registada.`);
    }
    setOpen(false);
  };

  const columns = [
    { key: "id", label: "Nº", sortable: true,
      render: (p) => <span className="font-semibold text-[var(--da-forest)]">{p.id}</span> },
    { key: "supplierId", label: "Fornecedor",
      render: (p) => supplierName(p.supplierId) },
    { key: "date", label: "Data", sortable: true,
      render: (p) => <span className="text-[var(--da-muted)]">{p.date}</span> },
    { key: "total", label: "Total",
      render: (p) => formatEUR(purchaseTotal(p)) },
    { key: "status", label: "Estado",
      render: (p) => { const s = stateOf(p.status); return <StatusBadge tone={s?.tone}>{s?.label}</StatusBadge>; } },
  ];

  return (
    <div data-testid="admin-compras">
      <PageHeader
        title="Compras"
        subtitle="Compras de insumos a fornecedores."
        actions={
          <button onClick={startNew} data-testid="compra-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Nova compra
          </button>
        }
      />

      <DataTable
        testid="compras-table"
        data={purchases}
        columns={columns}
        getRowId={(p) => p.id}
        searchKeys={["id"]}
        pageSize={10}
        rowActions={(p) => [
          { label: "Editar", onClick: () => startEdit(p) },
          { label: "Remover", onClick: () => remove(p), danger: true },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? `Editar compra ${form.id}` : "Nova compra"}
        size="xl"
        testid="compra-modal"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="compra-save" className="btn-da btn-da-primary text-xs">{form.id ? "Guardar" : "Registar"}</button>
          </>
        )}
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <FormRow label="Fornecedor">
              <select className={fieldClass} value={form.supplierId} onChange={(e) => u("supplierId", e.target.value)} data-testid="compra-supplier">
                {SUPPLIERS.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </FormRow>
            <FormRow label="Data">
              <input type="date" className={fieldClass} value={form.date} onChange={(e) => u("date", e.target.value)} data-testid="compra-date" />
            </FormRow>
            <FormRow label="Estado">
              <select className={fieldClass} value={form.status} onChange={(e) => u("status", e.target.value)} data-testid="compra-status">
                {PURCHASE_STATES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </FormRow>
          </div>

          <div>
            <div className="grid grid-cols-[1fr_110px_120px_120px_40px] gap-3 px-1 pb-1 text-[10px] uppercase tracking-[0.16em] text-[var(--da-forest)]">
              <span>Insumo</span><span>Quantidade</span><span>Custo / un.</span><span className="text-right">Subtotal</span><span />
            </div>
            <div className="space-y-2" data-testid="compra-lines">
              {form.lines.map((l) => (
                <div key={l.key} className="grid grid-cols-[1fr_110px_120px_120px_40px] gap-3 items-center" data-testid={`compra-line-${l.key}`}>
                  <select className={fieldClass + " mt-0"} value={l.insumoId} onChange={(e) => updateLine(l.key, { insumoId: e.target.value })} data-testid={`compra-line-insumo-${l.key}`}>
                    {insumos.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}
                  </select>
                  <input type="number" step="1" min="0" className={fieldClass + " mt-0"} value={l.qty} onChange={(e) => updateLine(l.key, { qty: e.target.value })} data-testid={`compra-line-qty-${l.key}`} />
                  <input type="number" step="0.001" min="0" className={fieldClass + " mt-0"} value={l.cost} onChange={(e) => updateLine(l.key, { cost: e.target.value })} data-testid={`compra-line-cost-${l.key}`} />
                  <span className="font-body text-sm text-right">{formatEUR3((parseFloat(l.qty) || 0) * (parseFloat(l.cost) || 0))}</span>
                  <button onClick={() => removeLine(l.key)} className="text-[var(--da-muted)] hover:text-red-600 flex justify-center" aria-label="Remover linha" data-testid={`compra-line-remove-${l.key}`}><X size={15} /></button>
                </div>
              ))}
            </div>
            <button onClick={addLine} data-testid="compra-line-add" className="mt-3 inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">
              <Plus size={13} /> Adicionar linha
            </button>
          </div>

          <div className="flex items-center justify-between border-t hairline pt-4">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Total</span>
            <span className="font-serif-display text-2xl text-[var(--da-forest)]" data-testid="compra-total">{formatEUR(formTotal)}</span>
          </div>

          <p className="font-body text-[11px] text-[var(--da-muted)] italic">
            Ao receber a compra, as quantidades alimentam o stock de insumos e atualizam o custo unitário. (Lógica tratada numa fase posterior.)
          </p>
        </div>
      </Modal>
    </div>
  );
};
