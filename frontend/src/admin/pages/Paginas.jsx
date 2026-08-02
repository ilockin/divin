import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { createPage as createPageRow, updatePage, deletePage } from "../../lib/pages";

export const Paginas = () => {
  const { pages, reloadPages } = useAdmin();
  const navigate = useNavigate();

  // O slug é único na base de dados: gerar um livre antes de criar, senão a segunda
  // "Nova página" rebenta com violação de unicidade.
  const freeSlug = (base) => {
    let slug = base;
    let n = 2;
    while (pages.some((x) => x.slug === slug)) { slug = `${base}-${n}`; n += 1; }
    return slug;
  };

  const createPage = async () => {
    try {
      const page = await createPageRow({ title: "Nova página", slug: freeSlug("nova-pagina"), status: "rascunho", blocks: [] });
      await reloadPages();
      navigate(`/admin/paginas/${page.id}`);
    } catch (e) {
      toast.error("Erro ao criar a página", { description: e.message });
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remover a página "${p.title}"?`)) return;
    try {
      await deletePage(p.id);
      await reloadPages();
      toast.success("Página removida.");
    } catch (e) {
      toast.error("Erro ao remover", { description: e.message });
    }
  };

  const togglePublish = async (p) => {
    const status = p.status === "publicado" ? "rascunho" : "publicado";
    try {
      await updatePage(p.id, { status });
      await reloadPages();
      toast.success(status === "publicado" ? "Página publicada." : "Movida para rascunho.");
    } catch (e) {
      toast.error("Erro ao alterar o estado", { description: e.message });
    }
  };

  const duplicate = async (p) => {
    try {
      await createPageRow({
        slug: freeSlug(`${p.slug}-copia`),
        title: `${p.title} (cópia)`,
        status: "rascunho",
        blocks: p.blocks.map((b) => ({ ...b, props: { ...b.props } })),
      });
      await reloadPages();
      toast.success("Página duplicada.");
    } catch (e) {
      toast.error("Erro ao duplicar", { description: e.message });
    }
  };

  const columns = [
    { key: "title", label: "Título", sortable: true,
      render: (p) => <Link to={`/admin/paginas/${p.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{p.title}</Link> },
    { key: "slug", label: "Slug",
      render: (p) => <span className="font-body text-[var(--da-muted)]">/{p.slug}</span> },
    { key: "blocks", label: "Blocos",
      render: (p) => <span className="text-[var(--da-muted)]">{p.blocks.length}</span> },
    { key: "status", label: "Estado",
      render: (p) => <StatusBadge tone={p.status === "publicado" ? "green" : "muted"}>{p.status === "publicado" ? "Publicado" : "Rascunho"}</StatusBadge> },
    { key: "date", label: "Data", sortable: true,
      render: (p) => <span className="text-[var(--da-muted)]">{p.date}</span> },
  ];

  return (
    <div data-testid="admin-paginas">
      <PageHeader
        title="Construtor de Páginas"
        subtitle="Páginas de conteúdo construídas com blocos."
        actions={<button onClick={createPage} data-testid="page-new" className="btn-da btn-da-primary text-xs"><Plus size={14} /> Nova página</button>}
      />

      <DataTable
        testid="paginas-table"
        data={pages}
        columns={columns}
        getRowId={(p) => p.id}
        searchKeys={["title", "slug"]}
        pageSize={10}
        rowActions={(p) => [
          { label: "Editar", onClick: () => navigate(`/admin/paginas/${p.id}`) },
          { label: "Duplicar", onClick: () => duplicate(p) },
          { label: p.status === "publicado" ? "Mover para rascunho" : "Publicar", onClick: () => togglePublish(p) },
          { label: "Remover", onClick: () => remove(p), danger: true },
        ]}
      />
    </div>
  );
};
