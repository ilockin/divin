import React, { useState } from "react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { LEAD_STATUSES } from "../data/mockLeads";

const statusOf = (id) => LEAD_STATUSES.find((s) => s.id === id);
const primaryValue = (lead) => lead.values.name || lead.values.email || Object.values(lead.values)[0] || "—";

export const Leads = () => {
  const { leads, setLeads } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(null);

  const openLead = (lead) => { setForm({ ...lead }); setOpen(true); };

  const remove = (lead) => {
    if (!window.confirm("Remover este lead?")) return;
    setLeads((prev) => prev.filter((x) => x.id !== lead.id));
    toast.success("Lead removido.");
  };

  const save = () => {
    setLeads((prev) => prev.map((x) => x.id === form.id ? { ...x, status: form.status, note: form.note } : x));
    toast.success("Lead atualizado.");
    setOpen(false);
  };

  const columns = [
    { key: "submittedAt", label: "Data", sortable: true,
      render: (l) => new Date(l.submittedAt).toLocaleString("pt-PT") },
    { key: "primary", label: "Contacto",
      render: (l) => (
        <div>
          <p className="font-semibold text-[var(--da-forest)]">{primaryValue(l)}</p>
          {l.values.email && primaryValue(l) !== l.values.email && <p className="font-body text-[11px] text-[var(--da-muted)] mt-0.5">{l.values.email}</p>}
        </div>
      ) },
    { key: "message", label: "Mensagem",
      render: (l) => <span className="text-[var(--da-muted)] line-clamp-1">{l.values.message || "—"}</span> },
    { key: "status", label: "Estado",
      render: (l) => <StatusBadge tone={statusOf(l.status)?.tone}>{statusOf(l.status)?.label}</StatusBadge> },
  ];

  return (
    <div data-testid="admin-leads">
      <PageHeader title="Mensagens de Contacto" subtitle="Submissões do formulário de contacto da loja." />

      <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 font-body text-sm text-amber-900" data-testid="leads-note">
        Leads guardados neste navegador (mock, sem back-end) — não substituem um CRM real; uma submissão feita noutro dispositivo não aparece aqui ainda.
      </div>

      <DataTable
        testid="leads-table"
        data={leads}
        columns={columns}
        getRowId={(l) => l.id}
        searchKeys={[]}
        pageSize={10}
        rowActions={(l) => [
          { label: "Ver / Editar", onClick: () => openLead(l) },
          { label: "Remover", onClick: () => remove(l), danger: true },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Detalhe do lead"
        testid="lead-modal"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="lead-save" className="btn-da btn-da-primary text-xs">Guardar</button>
          </>
        )}
      >
        {form && (
          <div className="space-y-4">
            <div className="space-y-3">
              {form.fieldsSnapshot.map((f) => (
                <div key={f.id} data-testid={`lead-value-${f.id}`}>
                  <p className="font-body text-[10px] tracking-[0.18em] uppercase text-[var(--da-forest)]">{f.label}</p>
                  <p className="font-body text-sm text-[var(--da-ink)] mt-1 whitespace-pre-wrap">{form.values[f.id] || "—"}</p>
                </div>
              ))}
            </div>
            <div className="border-t hairline pt-4 grid sm:grid-cols-2 gap-4">
              <FormRow label="Estado">
                <select className={fieldClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} data-testid="lead-status">
                  {LEAD_STATUSES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
                </select>
              </FormRow>
            </div>
            <FormRow label="Nota interna">
              <textarea rows={3} className={fieldClass} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} data-testid="lead-note" />
            </FormRow>
          </div>
        )}
      </Modal>
    </div>
  );
};
