import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { adminCategories, COMMISSION_TYPES } from "../data/mockAdmin";
import { formatEUR } from "../../lib/format";

export const Products = () => {
  const { products, setProducts } = useAdmin();
  const navigate = useNavigate();
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => products
    .filter((p) => (catFilter ? p.category === catFilter : true))
    .filter((p) => (statusFilter ? p.status === statusFilter : true)),
    [products, catFilter, statusFilter]);

  const remove = (p) => {
    if (!window.confirm(`Remover ${p.name}?`)) return;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Produto removido.");
  };

  const toggleStatus = (p) => {
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: x.status === "publicado" ? "rascunho" : "publicado" } : x));
    toast.success(p.status === "publicado" ? "Movido para rascunho." : "Publicado.");
  };

  const columns = [
    { key: "image", label: "",
      render: (p) => <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-md bg-[var(--da-cream-2)]" /> },
    { key: "name", label: "Nome", sortable: true,
      render: (p) => (
        <Link to={`/admin/produtos/${p.id}`} className="block">
          <p className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{p.name}</p>
          <p className="font-body text-[11px] text-[var(--da-muted)] mt-0.5">{p.short}</p>
        </Link>
      ) },
    { key: "category", label: "Categoria",
      render: (p) => <span className="text-[var(--da-muted)]">{adminCategories.find((c) => c.slug === p.category)?.name || p.category}</span> },
    { key: "price", label: "Preço", sortable: true,
      render: (p) => formatEUR(p.price) },
    { key: "stock", label: "Stock", sortable: true,
      render: (p) => <span className={p.stock <= p.minStock ? "text-red-700 font-semibold" : ""}>{p.stock}</span> },
    { key: "status", label: "Estado",
      render: (p) => <StatusBadge tone={p.status === "publicado" ? "green" : "muted"}>{p.status === "publicado" ? "Publicado" : "Rascunho"}</StatusBadge> },
  ];

  return (
    <div data-testid="admin-products">
      <PageHeader
        title="Produtos"
        subtitle="Catálogo de produtos visíveis na loja."
        actions={
          <button onClick={() => navigate("/admin/produtos/novo")} data-testid="product-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Novo produto
          </button>
        }
      />

      <DataTable
        testid="products-table"
        data={filtered}
        columns={columns}
        getRowId={(p) => p.id}
        searchKeys={["name", "short", "category"]}
        pageSize={10}
        filters={(
          <>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} data-testid="products-filter-cat" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Todas as categorias</option>
              {adminCategories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-testid="products-filter-status" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Todos os estados</option>
              <option value="publicado">Publicado</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </>
        )}
        bulkActions={[
          { label: "Publicar", onClick: (ids) => { setProducts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, status: "publicado" } : p)); toast.success(`${ids.length} produtos publicados.`); } },
          { label: "Rascunho", onClick: (ids) => { setProducts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, status: "rascunho" } : p)); toast.success(`${ids.length} produtos em rascunho.`); } },
        ]}
        rowActions={(p) => [
          { label: "Editar", onClick: () => navigate(`/admin/produtos/${p.id}`) },
          { label: p.status === "publicado" ? "Mover para rascunho" : "Publicar", onClick: toggleStatus },
          { label: "Remover", onClick: remove, danger: true },
        ]}
      />
    </div>
  );
};

// ------------ Product form ------------

const emptyProduct = {
  id: null, name: "", slug: "", short: "", description: "", usage: "",
  benefits: [""], price: 0, category: "faciais", size: "100ml",
  images: [], status: "rascunho", vegan: true, bio: true, stock: 0, minStock: 5,
  shippingMode: "inherit", shippingMethodIds: [],
  commissionType: "percentage", commissionValue: 0,
};

export const ProductForm = () => {
  const { id } = useParams();
  const { products, setProducts, shippingMethods, role } = useAdmin();
  const navigate = useNavigate();
  const isNew = id === "novo";
  const existing = !isNew && products.find((p) => p.id === id);
  const [form, setForm] = useState(() => existing
    ? { ...existing, benefits: existing.benefits || [""], shippingMode: existing.shippingMode || "inherit", shippingMethodIds: existing.shippingMethodIds || [],
        commissionType: existing.commissionType || "percentage", commissionValue: existing.commissionValue ?? 0 }
    : emptyProduct);
  const canEditCommission = role !== "lojista";

  if (!isNew && !existing) return <Navigate to="/admin/produtos" replace />;

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addBenefit = () => u("benefits", [...form.benefits, ""]);
  const updateBenefit = (i, v) => u("benefits", form.benefits.map((b, idx) => idx === i ? v : b));
  const removeBenefit = (i) => u("benefits", form.benefits.filter((_, idx) => idx !== i));

  const addImage = () => {
    const url = window.prompt("URL da imagem (mock):", "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=70");
    if (url) u("images", [...form.images, url]);
  };
  const removeImage = (i) => u("images", form.images.filter((_, idx) => idx !== i));

  const save = (e) => {
    e?.preventDefault();
    if (!form.name || !form.price) { toast.error("Preenche nome e preço."); return; }
    const slug = form.slug || form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const payload = { ...form, slug, price: parseFloat(form.price), stock: parseInt(form.stock, 10) || 0, commissionValue: parseFloat(form.commissionValue) || 0 };
    if (isNew) {
      const newId = "p" + String(products.length + 1).padStart(2, "0");
      setProducts((prev) => [...prev, { ...payload, id: newId, images: payload.images.length ? payload.images : ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=70"] }]);
      toast.success("Produto criado.");
    } else {
      setProducts((prev) => prev.map((p) => p.id === form.id ? payload : p));
      toast.success("Produto atualizado.");
    }
    navigate("/admin/produtos");
  };

  return (
    <div data-testid="admin-product-form">
      <PageHeader
        title={isNew ? "Novo produto" : `Editar: ${existing?.name}`}
        subtitle={isNew ? "Adiciona um novo produto ao catálogo." : "Atualiza os dados do produto."}
        actions={(
          <>
            <Link to="/admin/produtos" className="btn-da btn-da-ghost text-xs">Cancelar</Link>
            <button onClick={save} data-testid="product-save" className="btn-da btn-da-primary text-xs">{isNew ? "Criar" : "Guardar"}</button>
          </>
        )}
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="bg-white border hairline rounded-2xl p-6 space-y-6">
          <SectionTitle eyebrow="informação" title="Detalhes" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Nome" required>
              <input className={fieldClass} value={form.name} onChange={(e) => u("name", e.target.value)} data-testid="pf-name" />
            </FormRow>
            <FormRow label="Slug (opcional)">
              <input className={fieldClass} value={form.slug} onChange={(e) => u("slug", e.target.value)} placeholder="gerado a partir do nome" data-testid="pf-slug" />
            </FormRow>
          </div>
          <FormRow label="Descrição curta">
            <input className={fieldClass} value={form.short} onChange={(e) => u("short", e.target.value)} data-testid="pf-short" />
          </FormRow>
          <FormRow label="Descrição longa" hint="Descreve o produto com calma — texto que aparece na página do produto.">
            <textarea rows={4} className={fieldClass} value={form.description} onChange={(e) => u("description", e.target.value)} data-testid="pf-description" />
          </FormRow>
          <FormRow label="Modo de uso">
            <textarea rows={3} className={fieldClass} value={form.usage} onChange={(e) => u("usage", e.target.value)} data-testid="pf-usage" />
          </FormRow>

          <div>
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Benefícios</p>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input className={fieldClass + " mt-0"} value={b} onChange={(e) => updateBenefit(i, e.target.value)} data-testid={`pf-benefit-${i}`} />
                  <button onClick={() => removeBenefit(i)} className="text-[var(--da-muted)] hover:text-red-600 px-2" aria-label="Remover" data-testid={`pf-benefit-remove-${i}`}><X size={14} /></button>
                </div>
              ))}
              <button onClick={addBenefit} data-testid="pf-benefit-add" className="text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">+ Adicionar benefício</button>
            </div>
          </div>

          <div className="border-t hairline pt-6">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Galeria</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {form.images.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border hairline">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} data-testid={`pf-image-remove-${i}`} className="absolute top-1 right-1 bg-white/95 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100"><X size={12} /></button>
                </div>
              ))}
              <button onClick={addImage} data-testid="pf-image-add" className="aspect-square rounded-lg border-2 border-dashed hairline flex flex-col items-center justify-center text-[var(--da-muted)] hover:text-[var(--da-forest)] hover:border-[var(--da-forest)] gap-1 text-xs">
                <ImageIcon size={18} /> Adicionar
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="publicação" title="Estado" />
            <FormRow label="Estado">
              <select className={fieldClass} value={form.status} onChange={(e) => u("status", e.target.value)} data-testid="pf-status">
                <option value="publicado">Publicado</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </FormRow>
            <FormRow label="Categoria">
              <select className={fieldClass} value={form.category} onChange={(e) => u("category", e.target.value)} data-testid="pf-category">
                {adminCategories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
              </select>
            </FormRow>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="preço & variante" title="Comercial" />
            <FormRow label="Preço (€)" required>
              <input type="number" step="0.1" min="0" className={fieldClass} value={form.price} onChange={(e) => u("price", e.target.value)} data-testid="pf-price" />
            </FormRow>
            <FormRow label="Variante / formato">
              <input className={fieldClass} value={form.size} onChange={(e) => u("size", e.target.value)} data-testid="pf-size" />
            </FormRow>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="inventário" title="Stock" />
            <FormRow label="Stock atual">
              <input type="number" min="0" className={fieldClass} value={form.stock} onChange={(e) => u("stock", e.target.value)} data-testid="pf-stock" />
            </FormRow>
            <FormRow label="Stock mínimo">
              <input type="number" min="0" className={fieldClass} value={form.minStock} onChange={(e) => u("minStock", parseInt(e.target.value, 10) || 0)} data-testid="pf-min-stock" />
            </FormRow>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 space-y-3">
            <SectionTitle eyebrow="atributos" title="Flags" />
            <label className="flex items-center gap-2 font-body text-sm">
              <input type="checkbox" checked={form.vegan} onChange={(e) => u("vegan", e.target.checked)} data-testid="pf-vegan" /> Vegano
            </label>
            <label className="flex items-center gap-2 font-body text-sm">
              <input type="checkbox" checked={form.bio} onChange={(e) => u("bio", e.target.checked)} data-testid="pf-bio" /> BIO
            </label>
            <label className="flex items-center gap-2 font-body text-sm opacity-70">
              <input type="checkbox" checked readOnly /> Natural
            </label>
          </div>

          {canEditCommission && (
            <div className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid="pf-commission">
              <SectionTitle eyebrow="afiliados" title="Comissão de afiliado" />
              <FormRow label="Tipo de comissão">
                <select className={fieldClass} value={form.commissionType} onChange={(e) => u("commissionType", e.target.value)} data-testid="pf-commission-type">
                  {COMMISSION_TYPES.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                </select>
              </FormRow>
              <FormRow label={form.commissionType === "percentage" ? "Comissão (%)" : "Comissão (€)"} hint="Valor que o lojista recebe por unidade vendida através do seu link de afiliado.">
                <input type="number" step="0.1" min="0" className={fieldClass} value={form.commissionValue} onChange={(e) => u("commissionValue", e.target.value)} data-testid="pf-commission-value" />
              </FormRow>
            </div>
          )}

          <div className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid="pf-shipping">
            <SectionTitle eyebrow="envio" title="Modos de envio" />
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="radio" name="shippingMode" checked={form.shippingMode === "inherit"} onChange={() => u("shippingMode", "inherit")} data-testid="pf-ship-inherit" />
                Herdar das regras da categoria
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="radio" name="shippingMode" checked={form.shippingMode === "custom"} onChange={() => u("shippingMode", "custom")} data-testid="pf-ship-custom" />
                Personalizar
              </label>
            </div>
            {form.shippingMode === "custom" && (
              <div className="border-t hairline pt-3 space-y-2" data-testid="pf-ship-methods">
                <p className="font-body text-[11px] text-[var(--da-muted)]">Métodos permitidos para este produto:</p>
                {shippingMethods.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 font-body text-sm">
                    <input
                      type="checkbox"
                      checked={form.shippingMethodIds.includes(m.id)}
                      onChange={(e) => u("shippingMethodIds", e.target.checked
                        ? [...form.shippingMethodIds, m.id]
                        : form.shippingMethodIds.filter((x) => x !== m.id))}
                      data-testid={`pf-ship-method-${m.id}`}
                    />
                    {m.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
