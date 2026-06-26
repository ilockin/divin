import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { SUPPLIERS, INSUMO_CATEGORIES, INSUMO_UNITS } from "../data/mockErp";
import { formatEUR3 } from "../../lib/format";

const supplierName = (id) => SUPPLIERS.find((s) => s.id === id)?.name || "—";

const emptyInsumo = {
  id: null, name: "", category: INSUMO_CATEGORIES[0], unit: "ml",
  supplierId: SUPPLIERS[0].id, cost: 0, stock: 0, minStock: 0,
};

export const Insumos = () => {
  const { insumos, setInsumos } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyInsumo);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => { setForm(emptyInsumo); setOpen(true); };
  const startEdit = (row) => { setForm({ ...row }); setOpen(true); };

  const remove = (row) => {
    if (!window.confirm(`Remover o insumo "${row.name}"?`)) return;
    setInsumos((prev) => prev.filter((x) => x.id !== row.id));
    toast.success("Insumo removido.");
  };

  const save = () => {
    if (!form.name.trim()) { toast.error("Indica o nome do insumo."); return; }
    const payload = {
      ...form,
      cost: parseFloat(form.cost) || 0,
      stock: parseFloat(form.stock) || 0,
      minStock: parseFloat(form.minStock) || 0,
    };
    if (form.id) {
      setInsumos((prev) => prev.map((x) => x.id === form.id ? payload : x));
      toast.success("Insumo atualizado.");
    } else {
      const newId = "i" + String(insumos.length + 1).padStart(2, "0");
      setInsumos((prev) => [...prev, { ...payload, id: newId }]);
      toast.success("Insumo criado.");
    }
    setOpen(false);
  };

  const lowCount = insumos.filter((i) => i.stock <= i.minStock).length;

  const columns = [
    { key: "name", label: "Insumo", sortable: true,
      render: (i) => (
        <div>
          <p className="font-semibold text-[var(--da-forest)]">{i.name}</p>
          <p className="font-body text-[11px] text-[var(--da-muted)] mt-0.5">{i.category}</p>
        </div>
      ) },
    { key: "unit", label: "Unidade",
      render: (i) => <span className="text-[var(--da-muted)] uppercase">{i.unit}</span> },
    { key: "supplierId", label: "Fornecedor",
      render: (i) => <span className="text-[var(--da-muted)]">{supplierName(i.supplierId)}</span> },
    { key: "cost", label: "Custo / un.", sortable: true,
      render: (i) => <span>{formatEUR3(i.cost)}<span className="text-[var(--da-muted)]">/{i.unit}</span></span> },
    { key: "stock", label: "Stock", sortable: true,
      render: (i) => <span className={i.stock <= i.minStock ? "text-red-700 font-semibold" : ""}>{i.stock} {i.unit}</span> },
    { key: "minStock", label: "Stock mín.",
      render: (i) => <span className="text-[var(--da-muted)]">{i.minStock} {i.unit}</span> },
    { key: "estado", label: "Estado",
      render: (i) => i.stock <= i.minStock
        ? <StatusBadge tone="red">Stock baixo</StatusBadge>
        : <StatusBadge tone="green">OK</StatusBadge> },
  ];

  return (
    <div data-testid="admin-insumos">
      <PageHeader
        title="Insumos"
        subtitle="Matérias-primas e embalagem usadas na produção."
        actions={
          <button onClick={startNew} data-testid="insumo-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Novo insumo
          </button>
        }
      />

      {lowCount > 0 && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 font-body text-sm text-red-800" data-testid="insumos-low-alert">
          {lowCount} insumo(s) com stock igual ou abaixo do mínimo.
        </div>
      )}

      <DataTable
        testid="insumos-table"
        data={insumos}
        columns={columns}
        getRowId={(i) => i.id}
        searchKeys={["name", "category"]}
        pageSize={10}
        rowActions={(i) => [
          { label: "Editar", onClick: () => startEdit(i) },
          { label: "Remover", onClick: () => remove(i), danger: true },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Editar insumo" : "Novo insumo"}
        testid="insumo-modal"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="insumo-save" className="btn-da btn-da-primary text-xs">{form.id ? "Guardar" : "Criar"}</button>
          </>
        )}
      >
        <div className="space-y-4">
          <FormRow label="Nome" required>
            <input className={fieldClass} value={form.name} onChange={(e) => u("name", e.target.value)} data-testid="insumo-name" />
          </FormRow>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Categoria">
              <select className={fieldClass} value={form.category} onChange={(e) => u("category", e.target.value)} data-testid="insumo-category">
                {INSUMO_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </FormRow>
            <FormRow label="Unidade">
              <select className={fieldClass} value={form.unit} onChange={(e) => u("unit", e.target.value)} data-testid="insumo-unit">
                {INSUMO_UNITS.map((un) => (<option key={un} value={un}>{un}</option>))}
              </select>
            </FormRow>
          </div>
          <FormRow label="Fornecedor">
            <select className={fieldClass} value={form.supplierId} onChange={(e) => u("supplierId", e.target.value)} data-testid="insumo-supplier">
              {SUPPLIERS.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </FormRow>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormRow label="Custo / un. (€)">
              <input type="number" step="0.001" min="0" className={fieldClass} value={form.cost} onChange={(e) => u("cost", e.target.value)} data-testid="insumo-cost" />
            </FormRow>
            <FormRow label="Stock">
              <input type="number" step="1" min="0" className={fieldClass} value={form.stock} onChange={(e) => u("stock", e.target.value)} data-testid="insumo-stock" />
            </FormRow>
            <FormRow label="Stock mínimo">
              <input type="number" step="1" min="0" className={fieldClass} value={form.minStock} onChange={(e) => u("minStock", e.target.value)} data-testid="insumo-min-stock" />
            </FormRow>
          </div>
        </div>
      </Modal>
    </div>
  );
};
