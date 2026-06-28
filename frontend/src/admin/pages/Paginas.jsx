import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";

export const Paginas = () => {
  const { pages, setPages } = useAdmin();
  const navigate = useNavigate();

  const createPage = () => {
    const id = "pg-" + Date.now();
    const page = { id, title: "Nova página", slug: "nova-pagina", status: "rascunho", date: new Date().toISOString().slice(0, 10), blocks: [] };
    setPages((prev) => [page, ...prev]);
    navigate(`/admin/paginas/${id}`);
  };

  const remove = (p) => {
    if (!window.confirm(`Remover a página "${p.title}"?`)) return;
    setPages((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Página removida.");
  };

  const togglePublish = (p) => {
    setPages((prev) => prev.map((x) => x.id === p.id ? { ...x, status: x.status === "publicado" ? "rascunho" : "publicado" } : x));
    toast.success(p.status === "publicado" ? "Movida para rascunho." : "Página publicada.");
  };

  const duplicate = (p) => {
    const baseSlug = `${p.slug}-copia`;
    let slug = baseSlug;
    let n = 2;
    while (pages.some((x) => x.slug === slug)) { slug = `${baseSlug}-${n}`; n += 1; }
    const clone = {
      ...p,
      id: "pg-" + Date.now(),
      slug,
      title: `${p.title} (cópia)`,
      status: "rascunho",
      date: new Date().toISOString().slice(0, 10),
      blocks: p.blocks.map((b) => ({ ...b, props: { ...b.props } })),
    };
    setPages((prev) => [clone, ...prev]);
    toast.success("Página duplicada.");
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
