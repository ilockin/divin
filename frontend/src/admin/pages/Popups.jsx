import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { TRIGGER_TYPES, PLACEMENT_TYPES, emptyPopup } from "../data/mockPopups";

const triggerLabel = (p) => TRIGGER_TYPES.find((t) => t.id === p.trigger.type)?.label || p.trigger.type;
const placementLabel = (p) => PLACEMENT_TYPES.find((t) => t.id === p.placement.type)?.label || p.placement.type;

export const Popups = () => {
  const { popups, setPopups } = useAdmin();
  const navigate = useNavigate();

  const createPopup = () => {
    const popup = emptyPopup();
    setPopups((prev) => [popup, ...prev]);
    navigate(`/admin/popups/${popup.id}`);
  };

  const remove = (p) => {
    if (!window.confirm(`Remover o pop-up "${p.name}"?`)) return;
    setPopups((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Pop-up removido.");
  };

  const toggleActive = (p) => {
    setPopups((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: x.status === "ativo" ? "inativo" : "ativo" } : x)));
    toast.success(p.status === "ativo" ? "Pop-up desativado." : "Pop-up ativado.");
  };

  const duplicate = (p) => {
    const clone = { ...emptyPopup(), name: `${p.name} (cópia)`, width: p.width, blocks: p.blocks.map((b) => ({ ...b, props: { ...b.props } })), trigger: { ...p.trigger }, placement: { ...p.placement }, frequency: p.frequency };
    setPopups((prev) => [clone, ...prev]);
    toast.success("Pop-up duplicado.");
  };

  const columns = [
    { key: "name", label: "Nome", sortable: true,
      render: (p) => <Link to={`/admin/popups/${p.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{p.name}</Link> },
    { key: "trigger", label: "Gatilho",
      render: (p) => <span className="text-[var(--da-muted)]">{triggerLabel(p)}</span> },
    { key: "placement", label: "Segmentação",
      render: (p) => <span className="text-[var(--da-muted)]">{placementLabel(p)}</span> },
    { key: "blocks", label: "Blocos",
      render: (p) => <span className="text-[var(--da-muted)]">{p.blocks.length}</span> },
    { key: "status", label: "Estado",
      render: (p) => <StatusBadge tone={p.status === "ativo" ? "green" : "muted"}>{p.status === "ativo" ? "Ativo" : "Inativo"}</StatusBadge> },
  ];

  return (
    <div data-testid="admin-popups">
      <PageHeader
        title="Pop-ups"
        subtitle="Pop-ups com conteúdo em blocos, regras de acionamento e segmentação por página."
        actions={<button onClick={createPopup} data-testid="popup-new" className="btn-da btn-da-primary text-xs"><Plus size={14} /> Novo pop-up</button>}
      />

      <DataTable
        testid="popups-table"
        data={popups}
        columns={columns}
        getRowId={(p) => p.id}
        searchKeys={["name"]}
        pageSize={10}
        rowActions={(p) => [
          { label: "Editar", onClick: () => navigate(`/admin/popups/${p.id}`) },
          { label: "Duplicar", onClick: () => duplicate(p) },
          { label: p.status === "ativo" ? "Desativar" : "Ativar", onClick: () => toggleActive(p) },
          { label: "Remover", onClick: () => remove(p), danger: true },
        ]}
      />
    </div>
  );
};
