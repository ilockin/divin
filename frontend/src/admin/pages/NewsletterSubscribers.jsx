import React from "react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { deleteSubscriber } from "../../lib/newsletter";

const SOURCE_LABELS = { footer: "Rodapé", bloco: "Bloco Newsletter" };

export const NewsletterSubscribers = () => {
  const { subscribers, reloadSubscribers } = useAdmin();

  const remove = async (s) => {
    if (!window.confirm(`Remover "${s.email}" da lista?`)) return;
    try {
      await deleteSubscriber(s.id);
      await reloadSubscribers();
      toast.success("Subscritor removido.");
    } catch (e) {
      toast.error("Erro ao remover", { description: e.message });
    }
  };

  const columns = [
    { key: "email", label: "E-mail", sortable: true,
      render: (s) => <span className="font-semibold text-[var(--da-forest)]">{s.email}</span> },
    { key: "source", label: "Origem",
      render: (s) => <StatusBadge tone="muted">{SOURCE_LABELS[s.source] || s.source}</StatusBadge> },
    { key: "subscribedAt", label: "Data", sortable: true,
      render: (s) => new Date(s.subscribedAt).toLocaleString("pt-PT") },
  ];

  return (
    <div data-testid="admin-newsletter">
      <PageHeader title="Subscritores da Newsletter" subtitle="E-mails captados no rodapé e no bloco Newsletter do site." />

      <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 font-body text-sm text-amber-900" data-testid="newsletter-note">
        Subscritores guardados neste navegador (mock, sem back-end) — ainda não são enviados a nenhuma plataforma de e-mail marketing (configurável em Definições &gt; Integrações).
      </div>

      <DataTable
        testid="newsletter-table"
        data={subscribers}
        columns={columns}
        getRowId={(s) => s.id}
        searchKeys={["email"]}
        pageSize={10}
        rowActions={(s) => [
          { label: "Remover", onClick: () => remove(s), danger: true },
        ]}
      />
    </div>
  );
};
