import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { Modal } from "../components/Modal";
import { listAllCategories, buildTree, createCategory, updateCategory, deleteCategory, reorderCategories } from "../../lib/adminCategories";

const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const Categories = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "", image_url: "", parent: "", active: true, isNew: true });
  const [dragSlug, setDragSlug] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await listAllCategories()); }
    catch (e) { toast.error("Erro ao carregar categorias", { description: e.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const tree = useMemo(() => buildTree(rows), [rows]);

  const toggle = (slug) => setExpanded((prev) => { const n = new Set(prev); n.has(slug) ? n.delete(slug) : n.add(slug); return n; });

  const openNew = (parent = "") => { setForm({ slug: "", name: "", description: "", image_url: "", parent, active: true, isNew: true }); setModal(true); };
  const openEdit = (node) => { setForm({ slug: node.slug, name: node.name, description: node.description || "", image_url: node.image_url || "", parent: node.parent_slug || "", active: node.active, isNew: false }); setModal(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Indica o nome."); return; }
    try {
      if (form.isNew) {
        const slug = form.slug || slugify(form.name);
        if (rows.some((c) => c.slug === slug)) { toast.error("Já existe uma categoria com esse slug."); return; }
        const payload = form.parent
          ? { slug, name: form.name, parent_slug: form.parent, active: form.active, sort_order: rows.filter((c) => c.parent_slug === form.parent).length }
          : { slug, name: form.name, description: form.description || null, image_url: form.image_url || null, parent_slug: null, active: form.active, sort_order: tree.length };
        await createCategory(payload);
        toast.success("Categoria criada.");
      } else {
        const payload = form.parent
          ? { name: form.name, active: form.active }
          : { name: form.name, description: form.description || null, image_url: form.image_url || null, active: form.active };
        await updateCategory(form.slug, payload);
        toast.success("Categoria atualizada.");
      }
      setModal(false);
      await load();
    } catch (e) {
      toast.error("Erro ao guardar", { description: e.message });
    }
  };

  const remove = async (slug) => {
    if (!window.confirm("Remover esta categoria?")) return;
    try { await deleteCategory(slug); toast.success("Categoria removida."); await load(); }
    catch (e) { toast.error("Erro ao remover", { description: e.message }); }
  };

  const onDrop = async (targetSlug) => {
    if (!dragSlug || dragSlug === targetSlug) { setDragSlug(null); return; }
    const mains = tree.map((t) => t.slug);
    if (!mains.includes(dragSlug) || !mains.includes(targetSlug)) { setDragSlug(null); return; }
    const order = [...mains];
    order.splice(order.indexOf(dragSlug), 1);
    order.splice(order.indexOf(targetSlug), 0, dragSlug);
    setDragSlug(null);
    try { await reorderCategories(order); await load(); }
    catch (e) { toast.error("Erro ao reordenar", { description: e.message }); }
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
        {loading ? (
          <p className="text-center py-10 font-body text-sm text-[var(--da-muted)]">A carregar…</p>
        ) : tree.length === 0 ? (
          <p className="text-center py-10 font-body text-sm text-[var(--da-muted)]">Sem categorias.</p>
        ) : tree.map((c) => (
          <div
            key={c.slug}
            draggable
            onDragStart={() => setDragSlug(c.slug)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(c.slug)}
            className="border-b hairline last:border-b-0"
            data-testid={`cat-${c.slug}`}
          >
            <div className="flex items-center gap-2 px-2 py-3 hover:bg-[var(--da-cream-2)]/30 cursor-grab">
              <GripVertical size={14} className="text-[var(--da-muted)]" />
              <button onClick={() => toggle(c.slug)} className="text-[var(--da-forest)]" data-testid={`cat-toggle-${c.slug}`}>
                {expanded.has(c.slug) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <img src={c.image_url} alt="" className="w-9 h-9 rounded object-cover bg-[var(--da-cream-2)]" />
              <div className="flex-1">
                <p className="font-serif-display text-sm text-[var(--da-forest)] tracking-[0.08em]">{c.name}{!c.active && <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-[var(--da-muted)]">(inativa)</span>}</p>
                <p className="font-body text-[11px] text-[var(--da-muted)]">/loja?categoria={c.slug} · {c.children.length} sub</p>
              </div>
              <button onClick={() => openNew(c.slug)} aria-label="Nova subcategoria" data-testid={`cat-add-sub-${c.slug}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center text-[var(--da-forest)]"><Plus size={14} /></button>
              <button onClick={() => openEdit(c)} aria-label="Editar" data-testid={`cat-edit-${c.slug}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center text-[var(--da-forest)]"><Pencil size={14} /></button>
              <button onClick={() => remove(c.slug)} aria-label="Remover" data-testid={`cat-remove-${c.slug}`} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-700"><Trash2 size={14} /></button>
            </div>

            {expanded.has(c.slug) && (
              <ul className="pl-12 pb-3">
                {c.children.map((s) => (
                  <li key={s.slug} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-[var(--da-cream-2)]/30" data-testid={`subcat-${s.slug}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--da-leaf)]" />
                    <span className="font-body text-sm flex-1">{s.name}{!s.active && <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-[var(--da-muted)]">(inativa)</span>}</span>
                    <span className="font-body text-[11px] text-[var(--da-muted)]">/{s.slug}</span>
                    <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-full hover:bg-[var(--da-cream-2)]/70 flex items-center justify-center" data-testid={`subcat-edit-${s.slug}`}><Pencil size={12} /></button>
                    <button onClick={() => remove(s.slug)} className="w-7 h-7 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" data-testid={`subcat-remove-${s.slug}`}><Trash2 size={12} /></button>
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
        title={form.isNew ? "Nova categoria" : "Editar categoria"}
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
          <FormRow label="Slug" hint={form.isNew ? "Opcional — gerado a partir do nome." : "Não editável (é referenciado pelos produtos)."}>
            <input className={fieldClass} value={form.slug} disabled={!form.isNew} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="gerado a partir do nome" data-testid="cat-input-slug" />
          </FormRow>
          {form.isNew && (
            <FormRow label="Categoria pai">
              <select className={fieldClass} value={form.parent || ""} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} data-testid="cat-input-parent">
                <option value="">— Categoria principal —</option>
                {tree.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
              </select>
            </FormRow>
          )}
          {!form.parent && (
            <>
              <FormRow label="Descrição">
                <textarea rows={3} className={fieldClass} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} data-testid="cat-input-desc" />
              </FormRow>
              <FormRow label="URL da imagem">
                <input className={fieldClass} value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} data-testid="cat-input-image" />
              </FormRow>
            </>
          )}
          <label className="flex items-center gap-2 font-body text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} data-testid="cat-input-active" /> Categoria ativa (visível na loja)
          </label>
        </div>
      </Modal>
    </div>
  );
};
