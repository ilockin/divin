import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { adminCategories, adminProducts } from "../data/mockAdmin";
import { COUPON_TYPES, COUPON_SCOPES } from "../data/mockMarketing";
import { formatEUR } from "../../lib/format";

const emptyCoupon = {
  id: null, code: "", type: "percentage", value: 0, minOrder: 0,
  validFrom: "", validUntil: "", usageLimit: 0, usedCount: 0,
  active: true, scope: "all", scopeIds: [],
};

const isExpired = (c) => c.validUntil && c.validUntil < new Date().toISOString().slice(0, 10);

export const Coupons = () => {
  const { coupons, setCoupons } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCoupon);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => { setForm(emptyCoupon); setOpen(true); };
  const startEdit = (row) => { setForm({ ...row }); setOpen(true); };

  const remove = (row) => {
    if (!window.confirm(`Remover o cupão "${row.code}"?`)) return;
    setCoupons((prev) => prev.filter((x) => x.id !== row.id));
    toast.success("Cupão removido.");
  };

  const toggleActive = (row) => {
    setCoupons((prev) => prev.map((x) => x.id === row.id ? { ...x, active: !x.active } : x));
    toast.success(row.active ? "Cupão desativado." : "Cupão ativado.");
  };

  const save = () => {
    if (!form.code.trim()) { toast.error("Indica o código do cupão."); return; }
    const code = form.code.trim().toUpperCase();
    const duplicate = coupons.some((c) => c.code === code && c.id !== form.id);
    if (duplicate) { toast.error("Já existe um cupão com esse código."); return; }
    const payload = {
      ...form, code,
      value: parseFloat(form.value) || 0,
      minOrder: parseFloat(form.minOrder) || 0,
      usageLimit: parseInt(form.usageLimit, 10) || 0,
    };
    if (form.id) {
      setCoupons((prev) => prev.map((x) => x.id === form.id ? payload : x));
      toast.success("Cupão atualizado.");
    } else {
      const newId = "cp" + String(coupons.length + 1).padStart(2, "0");
      setCoupons((prev) => [...prev, { ...payload, id: newId, usedCount: 0 }]);
      toast.success("Cupão criado.");
    }
    setOpen(false);
  };

  const columns = [
    { key: "code", label: "Código", sortable: true,
      render: (c) => <span className="font-semibold text-[var(--da-forest)]">{c.code}</span> },
    { key: "type", label: "Desconto",
      render: (c) => c.type === "percentage" ? `${c.value}%` : formatEUR(c.value) },
    { key: "minOrder", label: "Encomenda mín.",
      render: (c) => c.minOrder > 0 ? formatEUR(c.minOrder) : "—" },
    { key: "scope", label: "Aplica-se a",
      render: (c) => COUPON_SCOPES.find((s) => s.id === c.scope)?.label || c.scope },
    { key: "usedCount", label: "Usado",
      render: (c) => c.usageLimit > 0 ? `${c.usedCount}/${c.usageLimit}` : c.usedCount },
    { key: "validUntil", label: "Válido até",
      render: (c) => c.validUntil ? new Date(c.validUntil).toLocaleDateString("pt-PT") : "Sem limite" },
    { key: "active", label: "Estado",
      render: (c) => !c.active
        ? <StatusBadge tone="muted">Inativo</StatusBadge>
        : isExpired(c)
          ? <StatusBadge tone="red">Expirado</StatusBadge>
          : <StatusBadge tone="green">Ativo</StatusBadge> },
  ];

  return (
    <div data-testid="admin-coupons">
      <PageHeader
        title="Cupões de desconto"
        subtitle="Cria e gere os cupões disponíveis no checkout da loja."
        actions={
          <button onClick={startNew} data-testid="coupon-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Novo cupão
          </button>
        }
      />

      <DataTable
        testid="coupons-table"
        data={coupons}
        columns={columns}
        getRowId={(c) => c.id}
        searchKeys={["code"]}
        pageSize={10}
        rowActions={(c) => [
          { label: "Editar", onClick: () => startEdit(c) },
          { label: c.active ? "Desativar" : "Ativar", onClick: () => toggleActive(c) },
          { label: "Remover", onClick: () => remove(c), danger: true },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Editar cupão" : "Novo cupão"}
        testid="coupon-modal"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="coupon-save" className="btn-da btn-da-primary text-xs">{form.id ? "Guardar" : "Criar"}</button>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Código" required>
              <input className={fieldClass + " uppercase"} value={form.code} onChange={(e) => u("code", e.target.value)} data-testid="coupon-code" />
            </FormRow>
            <FormRow label="Estado">
              <select className={fieldClass} value={form.active ? "ativo" : "inativo"} onChange={(e) => u("active", e.target.value === "ativo")} data-testid="coupon-active">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </FormRow>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Tipo de desconto">
              <select className={fieldClass} value={form.type} onChange={(e) => u("type", e.target.value)} data-testid="coupon-type">
                {COUPON_TYPES.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
              </select>
            </FormRow>
            <FormRow label={form.type === "percentage" ? "Valor (%)" : "Valor (€)"}>
              <input type="number" step="0.1" min="0" className={fieldClass} value={form.value} onChange={(e) => u("value", e.target.value)} data-testid="coupon-value" />
            </FormRow>
          </div>
          <FormRow label="Encomenda mínima (€)" hint="0 = sem mínimo.">
            <input type="number" step="1" min="0" className={fieldClass} value={form.minOrder} onChange={(e) => u("minOrder", e.target.value)} data-testid="coupon-min-order" />
          </FormRow>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Válido a partir de">
              <input type="date" className={fieldClass} value={form.validFrom} onChange={(e) => u("validFrom", e.target.value)} data-testid="coupon-valid-from" />
            </FormRow>
            <FormRow label="Válido até">
              <input type="date" className={fieldClass} value={form.validUntil} onChange={(e) => u("validUntil", e.target.value)} data-testid="coupon-valid-until" />
            </FormRow>
          </div>
          <FormRow label="Limite de utilizações" hint="0 = sem limite.">
            <input type="number" step="1" min="0" className={fieldClass} value={form.usageLimit} onChange={(e) => u("usageLimit", e.target.value)} data-testid="coupon-usage-limit" />
          </FormRow>

          <div className="border-t hairline pt-4">
            <FormRow label="Aplica-se a">
              <select className={fieldClass} value={form.scope} onChange={(e) => u("scope", e.target.value)} data-testid="coupon-scope">
                {COUPON_SCOPES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </FormRow>
            {form.scope === "category" && (
              <div className="mt-3 space-y-2" data-testid="coupon-scope-categories">
                {adminCategories.map((c) => (
                  <label key={c.slug} className="flex items-center gap-2 font-body text-sm">
                    <input
                      type="checkbox"
                      checked={form.scopeIds.includes(c.slug)}
                      onChange={(e) => u("scopeIds", e.target.checked ? [...form.scopeIds, c.slug] : form.scopeIds.filter((x) => x !== c.slug))}
                      data-testid={`coupon-scope-cat-${c.slug}`}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
            {form.scope === "product" && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto" data-testid="coupon-scope-products">
                {adminProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 font-body text-sm">
                    <input
                      type="checkbox"
                      checked={form.scopeIds.includes(p.id)}
                      onChange={(e) => u("scopeIds", e.target.checked ? [...form.scopeIds, p.id] : form.scopeIds.filter((x) => x !== p.id))}
                      data-testid={`coupon-scope-prod-${p.id}`}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
