import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingCart, Percent } from "lucide-react";
import { KpiCard, SectionTitle, PageHeader } from "../components/Bits";
import { StatusBadge } from "../components/DataTable";
import { useAdmin } from "../context/AdminContext";
import { PAYMENT_STATES } from "../data/mockAdmin";
import { calcCommission } from "../../lib/commission";
import { formatEUR } from "../../lib/format";

const stateOf = (list, id) => list.find((s) => s.id === id);

export const AfiliadoDashboard = () => {
  const { me, orders, products } = useAdmin();

  const myOrders = useMemo(
    () => orders.filter((o) => o.affiliateCode === me.affiliateCode),
    [orders, me.affiliateCode]
  );

  const commissionFor = (order) =>
    order.items.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? sum + calcCommission(p, item.qty) : sum;
    }, 0);

  const totalCommission = myOrders.reduce((sum, o) => sum + commissionFor(o), 0);
  const totalRevenue = myOrders.reduce((s, o) => s + (o.payment === "pago" ? o.total : 0), 0);

  return (
    <div data-testid="afiliado-dashboard">
      <PageHeader title="Dashboard" subtitle={`Visão geral das tuas vendas como afiliado, ${me.name}.`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard testid="kpi-afiliado-receita" label="Receita gerada" value={formatEUR(totalRevenue)} icon={TrendingUp} />
        <KpiCard testid="kpi-afiliado-vendas" label="Vendas" value={myOrders.length} icon={ShoppingCart} />
        <KpiCard testid="kpi-afiliado-comissao" label="Comissão acumulada" value={formatEUR(totalCommission)} icon={Percent} />
      </div>

      <div className="bg-white border hairline rounded-2xl mt-8">
        <div className="px-5 py-4 border-b hairline flex items-center justify-between">
          <SectionTitle eyebrow="recentes" title="As tuas vendas" />
          <Link to="/admin/painel-afiliado/vendas" className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">ver todas →</Link>
        </div>
        {myOrders.length === 0 ? (
          <p className="font-body text-sm text-[var(--da-muted)] px-5 py-8">
            Ainda não há vendas atribuídas ao teu link de afiliado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body" data-testid="afiliado-dashboard-orders">
              <thead className="bg-[var(--da-cream-2)]/40 border-b hairline">
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Nº</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Total</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Comissão</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.slice(0, 5).map((o) => {
                  const pay = stateOf(PAYMENT_STATES, o.payment);
                  return (
                    <tr key={o.id} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30">
                      <td className="px-5 py-3 font-semibold text-[var(--da-forest)]">{o.id}</td>
                      <td className="px-5 py-3">{formatEUR(o.total)}</td>
                      <td className="px-5 py-3">{formatEUR(commissionFor(o))}</td>
                      <td className="px-5 py-3"><StatusBadge tone={pay?.tone}>{pay?.label}</StatusBadge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
