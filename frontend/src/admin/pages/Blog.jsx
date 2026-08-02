import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { RichTextEditor } from "../components/RichTextEditor";
import { useAdmin } from "../context/AdminContext";
import { createArticle, updateArticle, deleteArticle, setArticleStatus, findArticle } from "../../lib/articles";

const CATEGORIES = ["Rituais", "Ingredientes", "Saber mais", "Marca"];

export const Blog = () => {
  const { articles, reloadArticles } = useAdmin();
  const navigate = useNavigate();

  const toggle = async (a) => {
    const next = a.status === "publicado" ? "rascunho" : "publicado";
    try {
      await setArticleStatus(a.slug, next);
      await reloadArticles();
      toast.success(next === "publicado" ? "Publicado." : "Movido para rascunho.");
    } catch (e) {
      toast.error("Erro ao alterar o estado", { description: e.message });
    }
  };
  const remove = async (a) => {
    if (!window.confirm(`Remover "${a.title}"?`)) return;
    try {
      await deleteArticle(a.slug);
      await reloadArticles();
      toast.success("Artigo removido.");
    } catch (e) {
      toast.error("Erro ao remover", { description: e.message });
    }
  };

  const cols = [
    { key: "title", label: "Título", sortable: true,
      render: (a) => (
        <Link to={`/admin/blog/${a.slug}`} className="flex items-center gap-3">
          <img src={a.cover} alt="" className="w-12 h-10 object-cover rounded bg-[var(--da-cream-2)]" />
          <div><p className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{a.title}</p><p className="font-body text-[11px] text-[var(--da-muted)]">{a.excerpt}</p></div>
        </Link>
      ) },
    { key: "category", label: "Categoria",
      render: (a) => <StatusBadge tone="muted">{a.category}</StatusBadge> },
    { key: "author", label: "Autor",
      render: (a) => <span className="text-[var(--da-muted)] text-xs">{a.author}</span> },
    { key: "status", label: "Estado",
      render: (a) => <StatusBadge tone={a.status === "publicado" ? "green" : "muted"}>{a.status === "publicado" ? "Publicado" : "Rascunho"}</StatusBadge> },
    { key: "date", label: "Data", sortable: true,
      render: (a) => <span className="text-[var(--da-muted)] text-xs">{new Date(a.date).toLocaleDateString("pt-PT")}</span> },
    { key: "views", label: "Visitas", sortable: true,
      render: (a) => <span>{a.views}</span> },
  ];

  return (
    <div data-testid="admin-blog">
      <PageHeader
        title="Blog / Artigos"
        subtitle="Gere o conteúdo editorial da DivinArte."
        actions={(
          <button onClick={() => navigate("/admin/blog/novo")} data-testid="article-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Novo artigo
          </button>
        )}
      />

      <DataTable
        testid="articles-table"
        data={articles}
        columns={cols}
        getRowId={(a) => a.slug}
        searchKeys={["title", "excerpt", "category"]}
        rowActions={(a) => [
          { label: "Editar", onClick: () => navigate(`/admin/blog/${a.slug}`) },
          { label: a.status === "publicado" ? "Mover para rascunho" : "Publicar", onClick: toggle },
          { label: "Remover", onClick: remove, danger: true },
        ]}
      />
    </div>
  );
};

// ------- Article form -------

const emptyArticle = { slug: null, title: "", category: "Rituais", excerpt: "", body: "", cover: "", author: "Equipa DivinArte", status: "rascunho", date: new Date().toISOString().slice(0, 10), views: 0 };

export const ArticleForm = () => {
  const { slug } = useParams();
  const { reloadArticles } = useAdmin();
  const navigate = useNavigate();
  const isNew = slug === "novo";
  const [form, setForm] = useState(emptyArticle);
  // Vai buscar o artigo à base de dados em vez de o procurar na lista do contexto: numa ligação
  // direta a /admin/blog/:slug a lista ainda não chegou e redirecionaria por engano.
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    findArticle(slug)
      // As colunas opcionais chegam a null da base de dados; os inputs são controlados e
      // não podem receber null.
      .then((a) => { if (a) setForm({ ...emptyArticle, ...Object.fromEntries(Object.entries(a).filter(([, v]) => v !== null)) }); else setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, isNew]);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const save = async () => {
    if (!form.title) { toast.error("Indica o título."); return; }
    const finalSlug = form.slug || slugify(form.title);
    const payload = { ...form, slug: finalSlug };
    setSaving(true);
    try {
      if (isNew) {
        await createArticle({ ...payload, cover: payload.cover || "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=1200&q=70" });
        toast.success("Artigo criado.");
      } else {
        await updateArticle(slug, payload);
        toast.success("Artigo atualizado.");
      }
      await reloadArticles();
      navigate("/admin/blog");
    } catch (e) {
      toast.error("Erro ao guardar", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (notFound) return <Navigate to="/admin/blog" replace />;
  if (loading) return <div data-testid="admin-article-loading" className="py-12" />;

  return (
    <div data-testid="admin-article-form">
      <PageHeader
        title={isNew ? "Novo artigo" : `Editar: ${form.title}`}
        subtitle={isNew ? "Escreve um novo artigo para o blog." : "Atualiza o conteúdo do artigo."}
        actions={(
          <>
            <Link to="/admin/blog" className="btn-da btn-da-ghost text-xs">Cancelar</Link>
            <button onClick={save} disabled={saving} data-testid="article-save" className="btn-da btn-da-primary text-xs disabled:opacity-60">{saving ? "A guardar…" : (isNew ? "Criar" : "Guardar")}</button>
          </>
        )}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white border hairline rounded-2xl p-6 space-y-5">
          <FormRow label="Título" required>
            <input className={fieldClass + " text-lg"} value={form.title} onChange={(e) => u("title", e.target.value)} data-testid="af-title" />
          </FormRow>
          <FormRow label="Excerto" hint="Texto curto que aparece nos cards do blog.">
            <textarea rows={2} className={fieldClass} value={form.excerpt} onChange={(e) => u("excerpt", e.target.value)} data-testid="af-excerpt" />
          </FormRow>

          <div>
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Conteúdo</p>
            <RichTextEditor value={form.body} onChange={(html) => u("body", html)} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="publicação" title="Estado" />
            <FormRow label="Estado">
              <select className={fieldClass} value={form.status} onChange={(e) => u("status", e.target.value)} data-testid="af-status">
                <option value="publicado">Publicado</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </FormRow>
            <FormRow label="Data">
              <input type="date" className={fieldClass} value={form.date} onChange={(e) => u("date", e.target.value)} data-testid="af-date" />
            </FormRow>
            <FormRow label="Autor">
              <input className={fieldClass} value={form.author} onChange={(e) => u("author", e.target.value)} data-testid="af-author" />
            </FormRow>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="classificação" title="Categoria" />
            <FormRow label="Categoria">
              <select className={fieldClass} value={form.category} onChange={(e) => u("category", e.target.value)} data-testid="af-category">
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </FormRow>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 space-y-3">
            <SectionTitle eyebrow="capa" title="Imagem" />
            {form.cover ? (
              <div className="aspect-[4/3] overflow-hidden rounded-lg border hairline">
                <img src={form.cover} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[4/3] border-2 border-dashed hairline rounded-lg flex items-center justify-center text-[var(--da-muted)] text-xs">Sem capa</div>
            )}
            <input
              className={fieldClass + " mt-3"}
              placeholder="URL da imagem"
              value={form.cover}
              onChange={(e) => u("cover", e.target.value)}
              data-testid="af-cover"
            />
            <button
              type="button"
              onClick={() => { const u2 = window.prompt("URL da imagem:", "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=1200&q=70"); if (u2) u("cover", u2); }}
              data-testid="af-cover-upload"
              className="text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"
            >+ Carregar imagem</button>
          </div>
        </aside>
      </div>
    </div>
  );
};
