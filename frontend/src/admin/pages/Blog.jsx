import React, { useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { Plus, Bold, Italic, List, Image as ImageIcon, Link2, Heading2, Quote } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";

const CATEGORIES = ["Rituais", "Ingredientes", "Saber mais", "Marca"];

export const Blog = () => {
  const { articles, setArticles } = useAdmin();
  const navigate = useNavigate();

  const toggle = (a) => {
    setArticles((prev) => prev.map((x) => x.slug === a.slug ? { ...x, status: x.status === "publicado" ? "rascunho" : "publicado" } : x));
    toast.success(a.status === "publicado" ? "Movido para rascunho." : "Publicado.");
  };
  const remove = (a) => {
    if (!window.confirm(`Remover "${a.title}"?`)) return;
    setArticles((prev) => prev.filter((x) => x.slug !== a.slug));
    toast.success("Artigo removido.");
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
  const { articles, setArticles } = useAdmin();
  const navigate = useNavigate();
  const isNew = slug === "novo";
  const existing = !isNew && articles.find((a) => a.slug === slug);
  const [form, setForm] = useState(() => existing ? { ...existing } : emptyArticle);

  if (!isNew && !existing) return <Navigate to="/admin/blog" replace />;

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const save = () => {
    if (!form.title) { toast.error("Indica o título."); return; }
    const finalSlug = form.slug || slugify(form.title);
    const payload = { ...form, slug: finalSlug };
    if (isNew) {
      setArticles((prev) => [{ ...payload, cover: payload.cover || "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=1200&q=70" }, ...prev]);
      toast.success("Artigo criado.");
    } else {
      setArticles((prev) => prev.map((a) => a.slug === existing.slug ? payload : a));
      toast.success("Artigo atualizado.");
    }
    navigate("/admin/blog");
  };

  const insertSnippet = (snippet) => u("body", (form.body || "") + snippet);

  return (
    <div data-testid="admin-article-form">
      <PageHeader
        title={isNew ? "Novo artigo" : `Editar: ${existing?.title}`}
        subtitle={isNew ? "Escreve um novo artigo para o blog." : "Atualiza o conteúdo do artigo."}
        actions={(
          <>
            <Link to="/admin/blog" className="btn-da btn-da-ghost text-xs">Cancelar</Link>
            <button onClick={save} data-testid="article-save" className="btn-da btn-da-primary text-xs">{isNew ? "Criar" : "Guardar"}</button>
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

          {/* "rich text" toolbar (visual only) */}
          <div>
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Conteúdo</p>
            <div className="bg-[var(--da-cream-2)]/50 border hairline rounded-t-lg flex items-center gap-1 p-1.5" data-testid="af-toolbar">
              {[
                { Icon: Bold, label: "Negrito", snippet: "**texto**" },
                { Icon: Italic, label: "Itálico", snippet: "_texto_" },
                { Icon: Heading2, label: "Subtítulo", snippet: "\n## Subtítulo\n" },
                { Icon: Quote, label: "Citação", snippet: "\n> citação\n" },
                { Icon: List, label: "Lista", snippet: "\n- item\n- item\n" },
                { Icon: Link2, label: "Link", snippet: "[texto](https://)" },
                { Icon: ImageIcon, label: "Imagem", snippet: "\n![alt](url)\n" },
              ].map(({ Icon, label, snippet }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => insertSnippet(snippet)}
                  title={label}
                  data-testid={`af-tb-${label.toLowerCase()}`}
                  className="w-8 h-8 rounded hover:bg-white flex items-center justify-center text-[var(--da-forest)]"
                ><Icon size={14} /></button>
              ))}
            </div>
            <textarea
              rows={14}
              value={form.body}
              onChange={(e) => u("body", e.target.value)}
              data-testid="af-body"
              placeholder="Escreve o teu artigo aqui... Suporta markdown leve no preview da loja."
              className="w-full border-t-0 border hairline rounded-b-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)] bg-white"
            />
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
