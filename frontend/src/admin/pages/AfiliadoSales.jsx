import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { myAffiliateSales } from "../../lib/adminAffiliates";
import { getStatusInfo } from "../../lib/orders";
import { formatEUR } from "../../lib/format";

const StatusPill = ({ status }) => {
  const { label, color } = getStatusInfo(status);
  return <span className="text-[10px] tracking-[0.16em] uppercase font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}22`, color }}>{label}</span>;
};

export const AfiliadoSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    myAffiliateSales()
      .then(setSales)
      .catch((e) => toast.error("Erro ao carregar vendas", { description: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "orderNumber", label: "Nº", sortable: true,
      render: (o) => <span className="font-semibold text-[var(--da-forest)]">{o.orderNumber}</span> },
    { key: "date", label: "Data", sortable: true,
      render: (o) => new Date(o.date).toLocaleDateString("pt-PT") },
    { key: "total", label: "Total", sortable: true, render: (o) => formatEUR(o.total) },
    { key: "commission", label: "Comissão", sortable: true, render: (o) => formatEUR(o.commission) },
    { key: "status", label: "Estado", render: (o) => <StatusPill status={o.status} /> },
  ];

  return (
    <div data-testid="afiliado-sales">
      <PageHeader title="Minhas Vendas" subtitle="Encomendas atribuídas ao teu link de afiliado." />
      <DataTable
        testid="afiliado-sales-table"
        data={sales}
        columns={columns}
        getRowId={(o) => o.id}
        searchKeys={["orderNumber"]}
        pageSize={10}
        emptyMessage={loading ? "A carregar…" : "Ainda não há vendas atribuídas ao teu link de afiliado."}
      />
    </div>
  );
};
