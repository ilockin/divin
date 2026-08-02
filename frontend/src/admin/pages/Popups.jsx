import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { TRIGGER_TYPES, PLACEMENT_TYPES, emptyPopup } from "../data/mockPopups";
import { createPopup as createPopupRow, updatePopup, deletePopup } from "../../lib/popups";

const triggerLabel = (p) => TRIGGER_TYPES.find((t) => t.id === p.trigger.type)?.label || p.trigger.type;
const placementLabel = (p) => PLACEMENT_TYPES.find((t) => t.id === p.placement.type)?.label || p.placement.type;

export const Popups = () => {
  const { popups, reloadPopups } = useAdmin();
  const navigate = useNavigate();

  const createPopup = async () => {
    try {
      // O id passa a ser gerado pela base de dados (uuid); `emptyPopup()` continua a servir
      // para os valores por omissão do gatilho, segmentação e frequência.
      const { id, ...defaults } = emptyPopup();
      const popup = await createPopupRow(defaults);
      await reloadPopups();
      navigate(`/admin/popups/${popup.id}`);
    } catch (e) {
      toast.error("Erro ao criar o pop-up", { description: e.message });
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remover o pop-up "${p.name}"?`)) return;
    try {
      await deletePopup(p.id);
      await reloadPopups();
      toast.success("Pop-up removido.");
    } catch (e) {
      toast.error("Erro ao remover", { description: e.message });
    }
  };

  const toggleActive = async (p) => {
    const status = p.status === "ativo" ? "inativo" : "ativo";
    try {
      await updatePopup(p.id, { status });
      await reloadPopups();
      toast.success(status === "ativo" ? "Pop-up ativado." : "Pop-up desativado.");
    } catch (e) {
      toast.error("Erro ao alterar o estado", { description: e.message });
    }
  };

  const duplicate = async (p) => {
    try {
      await createPopupRow({
        name: `${p.name} (cópia)`,
        status: "inativo",
        width: p.width,
        blocks: p.blocks.map((b) => ({ ...b, props: { ...b.props } })),
        trigger: { ...p.trigger },
        placement: { ...p.placement },
        frequency: p.frequency,
      });
      await reloadPopups();
      toast.success("Pop-up duplicado.");
    } catch (e) {
      toast.error("Erro ao duplicar", { description: e.message });
    }
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
