import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, KpiCard } from "../components/Bits";
import { affiliateAdminAggregates, updateAffiliateCode, setAffiliateActive } from "../../lib/adminAffiliates";
import { formatEUR } from "../../lib/format";
import { TrendingUp, ShoppingCart, Percent } from "lucide-react";

const genCode = () => "DA-AFIL-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export const Affiliates = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await affiliateAdminAggregates()); }
    catch (e) { toast.error("Erro ao carregar afiliados", { description: e.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const totalCommission = useMemo(() => rows.reduce((s, r) => s + r.commission, 0), [rows]);
  const totalSales = useMemo(() => rows.reduce((s, r) => s + r.salesCount, 0), [rows]);

  const setCode = async (r) => {
    const code = window.prompt(`Código de afiliado para ${r.name}:`, r.affiliateCode || genCode());
    if (code === null) return;
    try { await updateAffiliateCode(r.id, code.trim().toUpperCase()); toast.success("Código atualizado."); await load(); }
    catch (e) { toast.error("Erro ao guardar código", { description: e.message }); }
  };

  const toggleActive = async (r) => {
    try { await setAffiliateActive(r.id, !r.affiliateActive); toast.success(r.affiliateActive ? "Afiliado desativado." : "Afiliado ativado."); await load(); }
    catch (e) { toast.error("Erro ao atualizar", { description: e.message }); }
  };

  const columns = [
    { key: "name", label: "Afiliado", sortable: true,
      render: (r) => <p className="font-semibold text-[var(--da-forest)]">{r.name}</p> },
    { key: "affiliateCode", label: "Código",
      render: (r) => r.affiliateCode
        ? <span className="text-[var(--da-muted)]">{r.affiliateCode}</span>
        : <span className="text-red-700 text-xs">sem código</span> },
    { key: "salesCount", label: "Vendas", sortable: true },
    { key: "revenue", label: "Receita gerada", sortable: true, render: (r) => formatEUR(r.revenue) },
    { key: "commission", label: "Comissão acumulada", sortable: true, render: (r) => formatEUR(r.commission) },
    { key: "affiliateActive", label: "Estado",
      render: (r) => <StatusBadge tone={r.affiliateActive ? "green" : "muted"}>{r.affiliateActive ? "Ativo" : "Inativo"}</StatusBadge> },
  ];

  return (
    <div data-testid="admin-affiliates">
      <PageHeader title="Afiliados" subtitle="Comissão acumulada por cada afiliado, com base nas vendas pagas atribuídas ao seu link." />

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
        searchKeys={["name", "affiliateCode"]}
        pageSize={10}
        emptyMessage={loading ? "A carregar…" : "Ainda não há afiliados registados."}
        rowActions={(r) => [
          { label: r.affiliateCode ? "Editar código" : "Gerar código", onClick: () => setCode(r) },
          { label: r.affiliateActive ? "Desativar" : "Ativar", onClick: () => toggleActive(r) },
        ]}
      />
    </div>
  );
};
