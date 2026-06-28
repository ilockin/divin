import React, { useMemo } from "react";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { PAYMENT_STATES, SHIPPING_STATES } from "../data/mockAdmin";
import { calcCommission } from "../../lib/commission";
import { formatEUR } from "../../lib/format";

const stateOf = (list, id) => list.find((s) => s.id === id);

export const AfiliadoSales = () => {
  const { me, orders, products } = useAdmin();

  const commissionFor = (order) =>
    order.items.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? sum + calcCommission(p, item.qty) : sum;
    }, 0);

  const myOrders = useMemo(
    () => orders.filter((o) => o.affiliateCode === me.affiliateCode),
    [orders, me.affiliateCode]
  );

  const columns = [
    { key: "id", label: "Nº", sortable: true,
      render: (o) => <span className="font-semibold text-[var(--da-forest)]">{o.id}</span> },
    { key: "date", label: "Data", sortable: true,
      render: (o) => new Date(o.date).toLocaleDateString("pt-PT") },
    { key: "customer", label: "Cliente",
      render: (o) => o.customer.name },
    { key: "total", label: "Total", sortable: true, render: (o) => formatEUR(o.total) },
    { key: "commission", label: "Comissão", render: (o) => formatEUR(commissionFor(o)) },
    { key: "payment", label: "Pagamento",
      render: (o) => { const s = stateOf(PAYMENT_STATES, o.payment); return <StatusBadge tone={s?.tone}>{s?.label}</StatusBadge>; } },
    { key: "shipping", label: "Envio",
      render: (o) => { const s = stateOf(SHIPPING_STATES, o.shipping); return <StatusBadge tone={s?.tone}>{s?.label}</StatusBadge>; } },
  ];

  return (
    <div data-testid="afiliado-sales">
      <PageHeader title="Minhas Vendas" subtitle="Encomendas atribuídas ao teu link de afiliado." />
      <DataTable
        testid="afiliado-sales-table"
        data={myOrders}
        columns={columns}
        getRowId={(o) => o.id}
        searchKeys={["id"]}
        pageSize={10}
        emptyMessage="Ainda não há vendas atribuídas ao teu link de afiliado."
      />
    </div>
  );
};
