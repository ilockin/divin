import React, { useState } from "react";
import { Plus, Minus, ArrowDownUp } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { Modal } from "../components/Modal";
import { useAdmin } from "../context/AdminContext";

export const Stock = () => {
  const { products, setProducts, movements, setMovements } = useAdmin();
  const [modal, setModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ type: "entrada", qty: 1, reason: "" });

  const openAdjust = (p) => { setTarget(p); setForm({ type: "entrada", qty: 1, reason: "" }); setModal(true); };

  const save = () => {
    if (!form.qty || form.qty <= 0) { toast.error("Quantidade inválida."); return; }
    const delta = form.type === "entrada" ? form.qty : -form.qty;
    setProducts((prev) => prev.map((p) => p.id === target.id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
    setMovements((prev) => [
      { id: "m" + Math.random().toString(36).slice(2, 6), productId: target.id, productName: target.name, qty: delta, reason: form.reason || (form.type === "entrada" ? "Entrada manual" : "Saída manual"), date: new Date().toISOString(), type: form.type },
      ...prev,
    ]);
    toast.success("Stock ajustado.");
    setModal(false);
  };

  const stockState = (p) => {
    if (p.stock === 0) return { tone: "red", label: "Esgotado" };
    if (p.stock <= p.minStock) return { tone: "amber", label: "Baixo" };
    return { tone: "green", label: "OK" };
  };

  const cols = [
    { key: "name", label: "Produto", sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded bg-[var(--da-cream-2)]" />
          <div>
            <p className="font-semibold text-[var(--da-forest)]">{p.name}</p>
            <p className="font-body text-[11px] text-[var(--da-muted)]">{p.size}</p>
          </div>
        </div>
      ) },
    { key: "size", label: "Variante",
      render: (p) => <span className="text-[var(--da-muted)]">{p.size}</span> },
    { key: "stock", label: "Stock", sortable: true,
      render: (p) => <span className="font-serif-display text-lg text-[var(--da-forest)]">{p.stock}</span> },
    { key: "minStock", label: "Mínimo",
      render: (p) => <span className="text-[var(--da-muted)]">{p.minStock}</span> },
    { key: "status", label: "Estado",
      render: (p) => { const s = stockState(p); return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>; } },
  ];

  const moveCols = [
    { key: "date", label: "Data", sortable: true,
      render: (m) => <span className="text-[var(--da-muted)] font-body text-xs">{new Date(m.date).toLocaleString("pt-PT")}</span> },
    { key: "productName", label: "Produto", sortable: true },
    { key: "type", label: "Tipo",
      render: (m) => <StatusBadge tone={m.type === "entrada" ? "green" : "amber"}>{m.type === "entrada" ? "Entrada" : "Saída"}</StatusBadge> },
    { key: "qty", label: "Quantidade",
      render: (m) => <span className={`font-semibold ${m.qty > 0 ? "text-[var(--da-leaf)]" : "text-red-700"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</span> },
    { key: "reason", label: "Motivo",
      render: (m) => <span className="text-[var(--da-muted)] text-xs">{m.reason}</span> },
  ];

  return (
    <div data-testid="admin-stock">
      <PageHeader title="Stock" subtitle="Inventário em tempo real, com histórico de movimentos." />

      <SectionTitle eyebrow="produtos" title="Stock por produto" />
      <DataTable
        testid="stock-table"
        data={products}
        columns={cols}
        getRowId={(p) => p.id}
        searchKeys={["name"]}
        rowActions={(p) => [
          { label: "Ajustar stock", onClick: openAdjust },
        ]}
        toolbarRight={
          <button onClick={() => products[0] && openAdjust(products[0])} className="text-xs font-body px-3 py-2 rounded-full border hairline hover:bg-[var(--da-cream-2)]/60 inline-flex items-center gap-1.5">
            <ArrowDownUp size={12} /> Ajustar
          </button>
        }
      />

      <div className="mt-10">
        <SectionTitle eyebrow="movimentos" title="Histórico" />
        <DataTable
          testid="movements-table"
          data={movements}
          columns={moveCols}
          getRowId={(m) => m.id}
          searchKeys={["productName", "reason"]}
          pageSize={8}
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={`Ajustar stock — ${target?.name || ""}`}
        testid="stock-modal"
        footer={(
          <>
            <button onClick={() => setModal(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="stock-save" className="btn-da btn-da-primary text-xs">Aplicar</button>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-body text-[var(--da-muted)]">
            Stock atual: <span className="font-semibold text-[var(--da-forest)]">{target?.stock}</span> · Mínimo: {target?.minStock}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Tipo">
              <select className={fieldClass} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} data-testid="stock-input-type">
                <option value="entrada">Entrada (+)</option>
                <option value="saida">Saída (−)</option>
              </select>
            </FormRow>
            <FormRow label="Quantidade" required>
              <input type="number" min="1" className={fieldClass} value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: parseInt(e.target.value, 10) || 0 }))} data-testid="stock-input-qty" />
            </FormRow>
          </div>
          <FormRow label="Motivo">
            <input className={fieldClass} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Ex: Produção lote #37" data-testid="stock-input-reason" />
          </FormRow>
        </div>
      </Modal>
    </div>
  );
};
