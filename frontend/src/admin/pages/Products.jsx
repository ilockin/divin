import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { COMMISSION_TYPES } from "../data/mockAdmin";
import { loadCategories } from "../../lib/products";
import { listAllProducts, getProduct, createProduct, updateProduct, deleteProduct, setProductActive, uploadProductImage } from "../../lib/adminProducts";
import { formatEUR } from "../../lib/format";

// slug -> nome (categorias reais, incluindo subcategorias)
const useCategoryMap = () => {
  const [cats, setCats] = useState([]);
  useEffect(() => { loadCategories().then(setCats).catch(() => {}); }, []);
  const nameBySlug = useMemo(() => {
    const map = {};
    cats.forEach((c) => { map[c.slug] = c.name; (c.subcategories || []).forEach((s) => { map[s.slug] = s.name; }); });
    return map;
  }, [cats]);
  return { cats, nameBySlug };
};

export const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { cats, nameBySlug } = useCategoryMap();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listAllProducts()
      .then((rows) => { if (alive) setProducts(rows); })
      .catch((e) => toast.error("Erro ao carregar produtos", { description: e.message }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => products
    .filter((p) => (catFilter ? p.category === catFilter : true))
    .filter((p) => (statusFilter ? p.status === statusFilter : true)),
    [products, catFilter, statusFilter]);

  const remove = async (p) => {
    if (!window.confirm(`Remover ${p.name}?`)) return;
    try { await deleteProduct(p.id); setProducts((prev) => prev.filter((x) => x.id !== p.id)); toast.success("Produto removido."); }
    catch (e) { toast.error("Erro ao remover", { description: e.message }); }
  };

  const toggleStatus = async (p) => {
    const active = p.status !== "publicado";
    try {
      await setProductActive(p.id, active);
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: active ? "publicado" : "rascunho" } : x));
      toast.success(active ? "Publicado." : "Movido para rascunho.");
    } catch (e) { toast.error("Erro ao atualizar", { description: e.message }); }
  };

  const bulkSetActive = async (ids, active) => {
    try {
      await Promise.all(ids.map((id) => setProductActive(id, active)));
      setProducts((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, status: active ? "publicado" : "rascunho" } : p));
      toast.success(`${ids.length} produto(s) ${active ? "publicados" : "em rascunho"}.`);
    } catch (e) { toast.error("Erro na operação em massa", { description: e.message }); }
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
      render: (p) => <span className="text-[var(--da-muted)]">{nameBySlug[p.category] || p.category}</span> },
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
        emptyMessage={loading ? "A carregar…" : "Sem produtos."}
        filters={(
          <>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} data-testid="products-filter-cat" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Todas as categorias</option>
              {cats.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-testid="products-filter-status" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Todos os estados</option>
              <option value="publicado">Publicado</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </>
        )}
        bulkActions={[
          { label: "Publicar", onClick: (ids) => bulkSetActive(ids, true) },
          { label: "Rascunho", onClick: (ids) => bulkSetActive(ids, false) },
        ]}
        rowActions={(p) => [
          { label: "Editar", onClick: () => navigate(`/admin/produtos/${p.id}`) },
          { label: p.status === "publicado" ? "Mover para rascunho" : "Publicar", onClick: () => toggleStatus(p) },
          { label: "Remover", onClick: () => remove(p), danger: true },
        ]}
      />
    </div>
  );
};

// ------------ Product form ------------

const emptyProduct = {
  id: null, name: "", slug: "", short: "", description: "", usage: "",
  benefits: [""], price: 0, comparePrice: "", category: "", sub: "", size: "100ml",
  images: [], status: "rascunho", vegan: true, bio: true, isNew: false, featured: false,
  skinType: [], purpose: [], stock: 0, minStock: 5,
  shippingMode: "inherit", shippingMethodIds: [],
  commissionType: "percentage", commissionValue: 0,
};

export const ProductForm = () => {
  const { id } = useParams();
  const { shippingMethods, role } = useAdmin();
  const navigate = useNavigate();
  const isNew = id === "novo";
  const { cats } = useCategoryMap();
  const fileRef = useRef();

  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const canEditCommission = role !== "afiliado";

  useEffect(() => {
    if (isNew) return;
    getProduct(id).then(setForm).catch(() => { toast.error("Produto não encontrado."); navigate("/admin/produtos"); }).finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addBenefit = () => u("benefits", [...form.benefits, ""]);
  const updateBenefit = (i, v) => u("benefits", form.benefits.map((b, idx) => idx === i ? v : b));
  const removeBenefit = (i) => u("benefits", form.benefits.filter((_, idx) => idx !== i));

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try { const url = await uploadProductImage(file); u("images", [...form.images, url]); toast.success("Imagem carregada."); }
    catch (err) { toast.error("Erro no upload", { description: err.message }); }
    finally { setUploading(false); }
  };
  const removeImage = (i) => u("images", form.images.filter((_, idx) => idx !== i));

  const save = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.price) { toast.error("Preenche nome e preço."); return; }
    const slug = form.slug || form.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setSaving(true);
    try {
      if (isNew) { await createProduct({ ...form, slug }); toast.success("Produto criado."); }
      else { await updateProduct(id, { ...form, slug }); toast.success("Produto atualizado."); }
      navigate("/admin/produtos");
    } catch (err) {
      toast.error("Erro ao guardar", { description: err.message });
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div data-testid="admin-product-form"><PageHeader title="Editar produto" /><div className="bg-white border hairline rounded-2xl p-10 text-center font-body text-sm text-[var(--da-muted)]">A carregar…</div></div>;
  }

  return (
    <div data-testid="admin-product-form">
      <PageHeader
        title={isNew ? "Novo produto" : `Editar: ${form.name}`}
        subtitle={isNew ? "Adiciona um novo produto ao catálogo." : "Atualiza os dados do produto."}
        actions={(
          <>
            <Link to="/admin/produtos" className="btn-da btn-da-ghost text-xs">Cancelar</Link>
            <button onClick={save} disabled={saving} data-testid="product-save" className="btn-da btn-da-primary text-xs disabled:opacity-60">{saving ? "A guardar…" : (isNew ? "Criar" : "Guardar")}</button>
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
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} data-testid="pf-image-input" />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {form.images.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border hairline">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} data-testid={`pf-image-remove-${i}`} className="absolute top-1 right-1 bg-white/95 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100"><X size={12} /></button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="pf-image-add" className="aspect-square rounded-lg border-2 border-dashed hairline flex flex-col items-center justify-center text-[var(--da-muted)] hover:text-[var(--da-forest)] hover:border-[var(--da-forest)] gap-1 text-xs disabled:opacity-50">
                <ImageIcon size={18} /> {uploading ? "A carregar…" : "Adicionar"}
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
                <option value="">— escolher —</option>
                {cats.map((c) => (
                  <React.Fragment key={c.slug}>
                    <option value={c.slug}>{c.name}</option>
                    {(c.subcategories || []).map((s) => (<option key={s.slug} value={s.slug}>&nbsp;&nbsp;{s.name}</option>))}
                  </React.Fragment>
                ))}
              </select>
            </FormRow>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="preço & variante" title="Comercial" />
            <FormRow label="Preço (€)" required>
              <input type="number" step="0.1" min="0" className={fieldClass} value={form.price} onChange={(e) => u("price", e.target.value)} data-testid="pf-price" />
            </FormRow>
            <FormRow label="Preço comparativo (€)" hint="Opcional — preço riscado / antes de desconto.">
              <input type="number" step="0.1" min="0" className={fieldClass} value={form.comparePrice} onChange={(e) => u("comparePrice", e.target.value)} data-testid="pf-compare-price" />
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
            <label className="flex items-center gap-2 font-body text-sm">
              <input type="checkbox" checked={form.isNew} onChange={(e) => u("isNew", e.target.checked)} data-testid="pf-is-new" /> Novidade
            </label>
            <label className="flex items-center gap-2 font-body text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => u("featured", e.target.checked)} data-testid="pf-featured" /> Destaque
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
              <FormRow label={form.commissionType === "percentage" ? "Comissão (%)" : "Comissão (€)"} hint="Valor que o afiliado recebe por unidade vendida através do seu link de afiliado.">
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
