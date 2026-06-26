import React, { useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, SectionTitle, FormRow, fieldClass, KpiCard } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { PRODUCTION_STATES, getInsumo, recipeCost } from "../data/mockErp";
import { formatEUR } from "../../lib/format";

const stateOf = (id) => PRODUCTION_STATES.find((s) => s.id === id);

const nextOrderId = (orders) => {
  const year = new Date().getFullYear();
  const nums = orders
    .map((o) => parseInt(String(o.id).split("-").pop(), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `OP-${year}-${String(next).padStart(3, "0")}`;
};

export const OrdensProducao = () => {
  const { productionOrders, setProductionOrders, products } = useAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: products[0]?.id || "", qty: 1, notes: "" });

  const productName = (id) => products.find((p) => p.id === id)?.name || "—";

  const create = () => {
    if (!form.productId || !form.qty) { toast.error("Escolhe o produto e a quantidade."); return; }
    const id = nextOrderId(productionOrders);
    setProductionOrders((prev) => [
      { id, productId: form.productId, qty: parseInt(form.qty, 10), status: "planeada", date: new Date().toISOString().slice(0, 10), notes: form.notes },
      ...prev,
    ]);
    setOpen(false);
    setForm({ productId: products[0]?.id || "", qty: 1, notes: "" });
    toast.success(`Ordem ${id} criada.`);
    navigate(`/admin/ordens-producao/${id}`);
  };

  const remove = (row) => {
    if (!window.confirm(`Remover a ordem ${row.id}?`)) return;
    setProductionOrders((prev) => prev.filter((x) => x.id !== row.id));
    toast.success("Ordem removida.");
  };

  const columns = [
    { key: "id", label: "Nº", sortable: true,
      render: (o) => <Link to={`/admin/ordens-producao/${o.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{o.id}</Link> },
    { key: "productId", label: "Produto",
      render: (o) => productName(o.productId) },
    { key: "qty", label: "Quantidade", sortable: true,
      render: (o) => <span>{o.qty} un.</span> },
    { key: "status", label: "Estado",
      render: (o) => { const s = stateOf(o.status); return <StatusBadge tone={s?.tone}>{s?.label}</StatusBadge>; } },
    { key: "date", label: "Data", sortable: true,
      render: (o) => <span className="text-[var(--da-muted)]">{o.date}</span> },
  ];

  return (
    <div data-testid="admin-ordens-producao">
      <PageHeader
        title="Ordens de Produção"
        subtitle="Planeamento e execução dos lotes de produção."
        actions={
          <button onClick={() => setOpen(true)} data-testid="ordem-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Nova ordem
          </button>
        }
      />

      <DataTable
        testid="ordens-table"
        data={productionOrders}
        columns={columns}
        getRowId={(o) => o.id}
        searchKeys={["id"]}
        pageSize={10}
        rowActions={(o) => [
          { label: "Ver detalhe", onClick: () => navigate(`/admin/ordens-producao/${o.id}`) },
          { label: "Remover", onClick: () => remove(o), danger: true },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova ordem de produção"
        testid="ordem-modal"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={create} data-testid="ordem-create" className="btn-da btn-da-primary text-xs">Criar ordem</button>
          </>
        )}
      >
        <div className="space-y-4">
          <FormRow label="Produto" required>
            <select className={fieldClass} value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} data-testid="ordem-product">
              {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </FormRow>
          <FormRow label="Quantidade a produzir" required>
            <input type="number" min="1" step="1" className={fieldClass} value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} data-testid="ordem-qty" />
          </FormRow>
          <FormRow label="Notas (opcional)">
            <textarea rows={2} className={fieldClass} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} data-testid="ordem-notes" />
          </FormRow>
        </div>
      </Modal>
    </div>
  );
};

// ------------ Detail ------------
export const OrdemProducaoDetail = () => {
  const { id } = useParams();
  const { productionOrders, setProductionOrders, products, recipes, insumos } = useAdmin();
  const order = productionOrders.find((o) => o.id === id);

  if (!order) return <Navigate to="/admin/ordens-producao" replace />;

  const product = products.find((p) => p.id === order.productId);
  const recipe = recipes[order.productId];
  const unitCost = recipeCost(recipe, insumos);
  const orderCost = unitCost * order.qty;

  const requirements = (recipe?.lines || []).map((l) => {
    const ins = getInsumo(insumos, l.insumoId);
    const required = l.qty * order.qty;
    const available = ins?.stock ?? 0;
    return { id: l.id, name: ins?.name || "—", unit: l.unit, required, available, shortage: required > available };
  });
  const hasShortage = requirements.some((r) => r.shortage);

  const setStatus = (status) => {
    setProductionOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status } : o));
    toast.success(`Estado atualizado: ${stateOf(status)?.label}.`);
  };

  return (
    <div data-testid="admin-ordem-detail">
      <PageHeader
        title={`Ordem ${order.id}`}
        subtitle={product ? product.name : "Produto removido"}
        actions={<Link to="/admin/ordens-producao" className="btn-da btn-da-ghost text-xs">Voltar</Link>}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* insumos necessários */}
          <div className="bg-white border hairline rounded-2xl p-6">
            <SectionTitle eyebrow="materiais" title="Insumos necessários" />
            {!recipe ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-[var(--da-muted)]">Este produto ainda não tem ficha técnica.</p>
                <Link to="/admin/fichas-tecnicas" className="inline-block mt-3 btn-da btn-da-outline text-xs">Criar ficha técnica</Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body" data-testid="ordem-requirements">
                    <thead className="bg-[var(--da-cream-2)]/40 border-b hairline">
                      <tr>
                        {["Insumo", "Necessário", "Disponível", "Estado"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {requirements.map((r) => (
                        <tr key={r.id} className="border-b hairline last:border-b-0">
                          <td className="px-4 py-3">{r.name}</td>
                          <td className="px-4 py-3">{r.required} {r.unit}</td>
                          <td className={`px-4 py-3 ${r.shortage ? "text-red-700 font-semibold" : ""}`}>{r.available} {r.unit}</td>
                          <td className="px-4 py-3">
                            {r.shortage
                              ? <StatusBadge tone="red">Em falta</StatusBadge>
                              : <StatusBadge tone="green">Suficiente</StatusBadge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hasShortage && (
                  <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800" data-testid="ordem-shortage">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    Stock de insumos insuficiente para esta quantidade. Reforça o stock antes de produzir.
                  </div>
                )}
              </>
            )}
            <p className="font-body text-[11px] text-[var(--da-muted)] italic mt-4">
              Ao concluir a ordem, os insumos são consumidos do stock e os produtos acabados são adicionados ao stock. (Lógica tratada numa fase posterior.)
            </p>
          </div>
        </div>

        {/* lado direito */}
        <aside className="space-y-6">
          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="dados" title="Resumo" />
            <div className="flex items-center justify-between font-body text-sm">
              <span className="text-[var(--da-muted)]">Quantidade</span><span>{order.qty} un.</span>
            </div>
            <div className="flex items-center justify-between font-body text-sm">
              <span className="text-[var(--da-muted)]">Data</span><span>{order.date}</span>
            </div>
            <div className="flex items-center justify-between font-body text-sm">
              <span className="text-[var(--da-muted)]">Custo unitário</span><span>{formatEUR(unitCost)}</span>
            </div>
            {order.notes && (
              <div className="border-t hairline pt-3">
                <p className="font-body text-[11px] uppercase tracking-[0.16em] text-[var(--da-forest)] mb-1">Notas</p>
                <p className="font-body text-sm text-[var(--da-muted)]">{order.notes}</p>
              </div>
            )}
          </div>

          <KpiCard testid="ordem-kpi-custo" label="Custo total da ordem" value={formatEUR(orderCost)} />

          <div className="bg-white border hairline rounded-2xl p-6 space-y-3">
            <SectionTitle eyebrow="fluxo" title="Estado" />
            <div className="mb-1"><StatusBadge tone={stateOf(order.status)?.tone}>{stateOf(order.status)?.label}</StatusBadge></div>
            <div className="grid grid-cols-1 gap-2">
              {PRODUCTION_STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  disabled={s.id === order.status}
                  data-testid={`ordem-status-${s.id}`}
                  className={`text-left px-3 py-2 rounded-lg font-body text-sm border hairline transition ${s.id === order.status ? "bg-[var(--da-cream-2)]/60 text-[var(--da-muted)] cursor-default" : "hover:bg-[var(--da-cream-2)]/60"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
