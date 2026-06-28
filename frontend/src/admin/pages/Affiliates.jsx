import React, { useMemo } from "react";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, KpiCard } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { calcCommission } from "../../lib/commission";
import { formatEUR } from "../../lib/format";
import { TrendingUp, ShoppingCart, Percent } from "lucide-react";

export const Affiliates = () => {
  const { users, orders, products } = useAdmin();

  const rows = useMemo(() => {
    const commissionFor = (order) =>
      order.items.reduce((sum, item) => {
        const p = products.find((x) => x.id === item.id);
        return p ? sum + calcCommission(p, item.qty) : sum;
      }, 0);
    const afiliados = users.filter((u) => u.role === "afiliado");
    return afiliados.map((u) => {
      const myOrders = orders.filter((o) => o.affiliateCode === u.affiliateCode);
      const revenue = myOrders.reduce((s, o) => s + (o.payment === "pago" ? o.total : 0), 0);
      const commission = myOrders.reduce((s, o) => s + commissionFor(o), 0);
      return { ...u, salesCount: myOrders.length, revenue, commission };
    });
  }, [users, orders, products]);

  const totalCommission = rows.reduce((s, r) => s + r.commission, 0);
  const totalSales = rows.reduce((s, r) => s + r.salesCount, 0);

  const columns = [
    { key: "name", label: "Afiliado", sortable: true,
      render: (r) => (
        <div>
          <p className="font-semibold text-[var(--da-forest)]">{r.name}</p>
          <p className="font-body text-[11px] text-[var(--da-muted)] mt-0.5">{r.email}</p>
        </div>
      ) },
    { key: "affiliateCode", label: "Código",
      render: (r) => <span className="text-[var(--da-muted)]">{r.affiliateCode}</span> },
    { key: "salesCount", label: "Vendas", sortable: true },
    { key: "revenue", label: "Receita gerada", sortable: true, render: (r) => formatEUR(r.revenue) },
    { key: "commission", label: "Comissão acumulada", sortable: true, render: (r) => formatEUR(r.commission) },
    { key: "affiliateActive", label: "Estado",
      render: (r) => <StatusBadge tone={r.affiliateActive ? "green" : "muted"}>{r.affiliateActive ? "Ativo" : "Inativo"}</StatusBadge> },
  ];

  return (
    <div data-testid="admin-affiliates">
      <PageHeader title="Afiliados" subtitle="Comissão acumulada por cada afiliado, com base nas vendas atribuídas ao seu link." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard testid="kpi-affiliates-count" label="Afiliados ativos" value={rows.filter((r) => r.affiliateActive).length} icon={TrendingUp} />
        <KpiCard testid="kpi-affiliates-sales" label="Vendas via afiliado" value={totalSales} icon={ShoppingCart} />
        <KpiCard testid="kpi-affiliates-commission" label="Comissão total" value={formatEUR(totalCommission)} icon={Percent} />
      </div>

      <DataTable
        testid="affiliates-table"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchKeys={["name", "email", "affiliateCode"]}
        pageSize={10}
        emptyMessage="Ainda não há afiliados registados."
      />
    </div>
  );
};
