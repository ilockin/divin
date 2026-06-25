import React, { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { Modal } from "../components/Modal";

// Local copy with state — admin can reorder / add subcategories
const initial = [
  { id: "c1", slug: "faciais", name: "Faciais", description: "Cuidados para o rosto", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=70",
    children: [
      { id: "c1a", slug: "cremes-faciais", name: "Cremes faciais", parent: "c1" },
      { id: "c1b", slug: "seruns", name: "Séruns", parent: "c1" },
      { id: "c1c", slug: "aguas-florais", name: "Águas florais", parent: "c1" },
    ] },
  { id: "c2", slug: "corporais", name: "Corporais", description: "Cuidados corporais", image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=800&q=70",
    children: [
      { id: "c2a", slug: "manteigas", name: "Manteigas", parent: "c2" },
      { id: "c2b", slug: "esfoliantes", name: "Esfoliantes", parent: "c2" },
      { id: "c2c", slug: "oleos", name: "Óleos", parent: "c2" },
    ] },
  { id: "c3", slug: "capilares", name: "Capilares", description: "Cuidado capilar", image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?auto=format&fit=crop&w=800&q=70",
    children: [
      { id: "c3a", slug: "champos", name: "Champôs", parent: "c3" },
      { id: "c3b", slug: "mascaras", name: "Máscaras", parent: "c3" },
    ] },
  { id: "c4", slug: "bem-estar", name: "Bem-estar / Aromaterapia", description: "Sprays e bálsamos", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=70",
    children: [
      { id: "c4a", slug: "sprays", name: "Sprays", parent: "c4" },
      { id: "c4b", slug: "balsamos", name: "Bálsamos", parent: "c4" },
      { id: "c4c", slug: "roll-ons", name: "Roll-ons", parent: "c4" },
    ] },
];

export const Categories = () => {
  const [tree, setTree] = useState(initial);
  const [expanded, setExpanded] = useState(new Set(["c1", "c2", "c3", "c4"]));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", slug: "", description: "", image: "", parent: "" });
  const [dragId, setDragId] = useState(null);

  const toggle = (id) => {
    setExpanded((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const openNew = (parent = "") => { setForm({ id: null, name: "", slug: "", description: "", image: "", parent }); setModal(true); };
  const openEdit = (node, parent = "") => { setForm({ ...node, parent }); setModal(true); };

  const save = () => {
    if (!form.name) { toast.error("Indica o nome."); return; }
    const slug = form.slug || form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

    if (form.id) {
      // edit
      setTree((prev) => prev.map((c) => {
        if (c.id === form.id) return { ...c, ...form, slug };
        return { ...c, children: c.children.map((s) => s.id === form.id ? { ...s, ...form, slug } : s) };
      }));
      toast.success("Categoria atualizada.");
    } else {
      const newId = "n" + Math.random().toString(36).slice(2, 7);
      if (form.parent) {
        setTree((prev) => prev.map((c) => c.id === form.parent ? { ...c, children: [...c.children, { id: newId, name: form.name, slug, parent: form.parent }] } : c));
      } else {
        setTree((prev) => [...prev, { id: newId, name: form.name, slug, description: form.description, image: form.image, children: [] }]);
      }
      toast.success("Categoria criada.");
    }
    setModal(false);
  };

  const remove = (id, parent) => {
    if (!window.confirm("Remover esta categoria?")) return;
    if (parent) {
      setTree((prev) => prev.map((c) => c.id === parent ? { ...c, children: c.children.filter((s) => s.id !== id) } : c));
    } else {
      setTree((prev) => prev.filter((c) => c.id !== id));
    }
    toast.success("Categoria removida.");
  };

  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    setTree((prev) => {
      const ids = prev.map((c) => c.id);
      if (!ids.includes(dragId) || !ids.includes(targetId)) return prev; // só ordena nível 1
      const next = [...prev];
      const from = next.findIndex((c) => c.id === dragId);
      const to = next.findIndex((c) => c.id === targetId);
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDragId(null);
  };

  return (
    <div data-testid="admin-categories">
      <PageHeader
        title="Categorias"
        subtitle="Gere a hierarquia de categorias e subcategorias da loja."
        actions={(
          <button onClick={() => openNew("")} data-testid="cat-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Nova categoria
          </button>
        )}
      />

      <div className="bg-white border hairline rounded-2xl p-2" data-testid="cat-tree">
        {tree.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={() => onDragStart(c.id)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(c.id)}
            className="border-b hairline last:border-b-0"
            data-testid={`cat-${c.id}`}
          >
            <div className="flex items-center gap-2 px-2 py-3 hover:bg-[var(--da-cream-2)]/30 cursor-grab">
              <GripVertical size={14} className="text-[var(--da-muted)]" />
              <button onClick={() => toggle(c.id)} className="text-[var(--da-forest)]" data-testid={`cat-toggle-${c.id}`}>
                {expanded.has(c.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <img src={c.image} alt="" className="w-9 h-9 rounded object-cover bg-[var(--da-cream-2)]" />
              <div className="flex-1">
                <p className="font-serif-display text-sm text-[var(--da-forest)] tracking-[0.08em]">{c.name}</p>
                <p className="font-body text-[11px] text-[var(--da-muted)]">/loja?categoria={c.slug} · {c.children.length} sub</p>
              </div>
              <button onClick={() => openNew(c.id)} aria-label="Nova subcategoria" data-testid={`cat-add-sub-${c.id}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center text-[var(--da-forest)]"><Plus size={14} /></button>
              <button onClick={() => openEdit(c)} aria-label="Editar" data-testid={`cat-edit-${c.id}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center text-[var(--da-forest)]"><Pencil size={14} /></button>
              <button onClick={() => remove(c.id, null)} aria-label="Remover" data-testid={`cat-remove-${c.id}`} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-700"><Trash2 size={14} /></button>
            </div>

            {expanded.has(c.id) && (
              <ul className="pl-12 pb-3">
                {c.children.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-[var(--da-cream-2)]/30" data-testid={`subcat-${s.id}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--da-leaf)]" />
                    <span className="font-body text-sm flex-1">{s.name}</span>
                    <span className="font-body text-[11px] text-[var(--da-muted)]">/{s.slug}</span>
                    <button onClick={() => openEdit(s, c.id)} className="w-7 h-7 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center" data-testid={`subcat-edit-${s.id}`}><Pencil size={12} /></button>
                    <button onClick={() => remove(s.id, c.id)} className="w-7 h-7 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" data-testid={`subcat-remove-${s.id}`}><Trash2 size={12} /></button>
                  </li>
                ))}
                {c.children.length === 0 && (
                  <li className="py-2 px-2 font-body text-xs text-[var(--da-muted)] italic">Sem subcategorias.</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={form.id ? "Editar categoria" : "Nova categoria"}
        testid="cat-modal"
        footer={(
          <>
            <button onClick={() => setModal(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} data-testid="cat-save" className="btn-da btn-da-primary text-xs">Guardar</button>
          </>
        )}
      >
        <div className="space-y-4">
          <FormRow label="Nome" required>
            <input className={fieldClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} data-testid="cat-input-name" />
          </FormRow>
          <FormRow label="Slug (opcional)">
            <input className={fieldClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="gerado a partir do nome" data-testid="cat-input-slug" />
          </FormRow>
          <FormRow label="Categoria pai">
            <select className={fieldClass} value={form.parent || ""} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} data-testid="cat-input-parent">
              <option value="">— Categoria principal —</option>
              {tree.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </FormRow>
          {!form.parent && (
            <>
              <FormRow label="Descrição">
                <textarea rows={3} className={fieldClass} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} data-testid="cat-input-desc" />
              </FormRow>
              <FormRow label="URL da imagem">
                <input className={fieldClass} value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} data-testid="cat-input-image" />
              </FormRow>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
