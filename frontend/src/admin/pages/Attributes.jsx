import React, { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { Modal } from "../components/Modal";
import { useAdmin } from "../context/AdminContext";

export const Attributes = () => {
  const { attributes, setAttributes } = useAdmin();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", values: [{ id: "", label: "" }] });

  const openCreate = () => { setForm({ id: null, name: "", values: [{ id: "", label: "" }] }); setModal(true); };
  const openEdit = (a) => { setForm({ ...a, values: [...a.values] }); setModal(true); };

  const updateValue = (i, k, v) => setForm((f) => ({ ...f, values: f.values.map((val, idx) => idx === i ? { ...val, [k]: v } : val) }));
  const addValue = () => setForm((f) => ({ ...f, values: [...f.values, { id: "", label: "" }] }));
  const removeValue = (i) => setForm((f) => ({ ...f, values: f.values.filter((_, idx) => idx !== i) }));

  const save = () => {
    if (!form.name || form.values.some((v) => !v.label)) { toast.error("Preenche o nome e todos os valores."); return; }
    const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    const slugBase = slugify(form.name);
    const normValues = form.values.map((v, i) => ({ id: v.id || `${slugBase}-${slugify(v.label)}-${i}`, label: v.label }));
    if (form.id) {
      setAttributes((prev) => prev.map((a) => a.id === form.id ? { ...a, name: form.name, values: normValues } : a));
      toast.success("Atributo atualizado.");
    } else {
      setAttributes((prev) => [...prev, { id: "att-" + Math.random().toString(36).slice(2, 6), name: form.name, values: normValues }]);
      toast.success("Atributo criado.");
    }
    setModal(false);
  };

  const remove = (a) => {
    if (!window.confirm(`Remover "${a.name}"?`)) return;
    setAttributes((prev) => prev.filter((x) => x.id !== a.id));
    toast.success("Atributo removido.");
  };

  return (
    <div data-testid="admin-attributes">
      <PageHeader
        title="Atributos & Filtros"
        subtitle="Define os atributos que os clientes usam para filtrar a loja."
        actions={(
          <button onClick={openCreate} data-testid="att-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Novo atributo
          </button>
        )}
      />

      <div className="grid md:grid-cols-2 gap-5">
        {attributes.map((a) => (
          <div key={a.id} className="bg-white border hairline rounded-2xl p-5" data-testid={`att-${a.id}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[var(--da-leaf)]">Atributo</p>
                <h3 className="font-serif-display text-lg tracking-[0.08em] text-[var(--da-forest)] mt-1">{a.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} aria-label="Editar" data-testid={`att-edit-${a.id}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center"><Pencil size={14} /></button>
                <button onClick={() => remove(a)} aria-label="Remover" data-testid={`att-remove-${a.id}`} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.values.map((v) => (
                <span key={v.id} className="text-xs font-body px-3 py-1 rounded-full border hairline">{v.label}</span>
              ))}
            </div>
            <p className="font-body text-[11px] text-[var(--da-muted)] mt-4">{a.values.length} valores</p>
          </div>
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={form.id ? "Editar atributo" : "Novo atributo"}
        testid="att-modal"
        size="lg"
        footer={(
          <>
            <button onClick={() => setModal(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="att-save" className="btn-da btn-da-primary text-xs">Guardar</button>
          </>
        )}
      >
        <div className="space-y-5">
          <FormRow label="Nome do atributo" required>
            <input className={fieldClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Tipo de pele" data-testid="att-input-name" />
          </FormRow>
          <div>
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Valores</p>
            <div className="space-y-2">
              {form.values.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input className={fieldClass + " mt-0"} value={v.label} onChange={(e) => updateValue(i, "label", e.target.value)} placeholder={`Valor ${i + 1}`} data-testid={`att-value-${i}`} />
                  <button onClick={() => removeValue(i)} className="text-[var(--da-muted)] hover:text-red-600 px-2" aria-label="Remover" data-testid={`att-value-remove-${i}`}><X size={14} /></button>
                </div>
              ))}
              <button onClick={addValue} data-testid="att-value-add" className="text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">+ Adicionar valor</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
