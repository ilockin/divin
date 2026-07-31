import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingCart, Percent } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, SectionTitle, PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { myAffiliateOverview, myAffiliateSales } from "../../lib/adminAffiliates";
import { getStatusInfo } from "../../lib/orders";
import { formatEUR } from "../../lib/format";

const StatusPill = ({ status }) => {
  const { label, color } = getStatusInfo(status);
  return <span className="text-[10px] tracking-[0.16em] uppercase font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}22`, color }}>{label}</span>;
};

export const AfiliadoDashboard = () => {
  const { me } = useAdmin();
  const [overview, setOverview] = useState({ salesCount: 0, revenue: 0, commission: 0 });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([myAffiliateOverview(), myAffiliateSales()])
      .then(([o, s]) => { setOverview(o); setSales(s); })
      .catch((e) => toast.error("Erro ao carregar o painel", { description: e.message }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="afiliado-dashboard">
      <PageHeader title="Dashboard" subtitle={`Visão geral das tuas vendas como afiliado, ${me.name}.`} />

      {!me.affiliateCode && !loading && (
        <div className="mb-6 bg-[var(--da-cream-2)]/50 border hairline rounded-2xl px-5 py-3 font-body text-sm text-[var(--da-muted)]">
          Ainda não tens um código de afiliado atribuído. Contacta o administrador para começar a partilhar links.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard testid="kpi-afiliado-receita" label="Receita gerada" value={formatEUR(overview.revenue)} icon={TrendingUp} />
        <KpiCard testid="kpi-afiliado-vendas" label="Vendas pagas" value={overview.salesCount} icon={ShoppingCart} />
        <KpiCard testid="kpi-afiliado-comissao" label="Comissão acumulada" value={formatEUR(overview.commission)} icon={Percent} />
      </div>

      <div className="bg-white border hairline rounded-2xl mt-8">
        <div className="px-5 py-4 border-b hairline flex items-center justify-between">
          <SectionTitle eyebrow="recentes" title="As tuas vendas" />
          <Link to="/admin/painel-afiliado/vendas" className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">ver todas →</Link>
        </div>
        {loading ? (
          <p className="font-body text-sm text-[var(--da-muted)] px-5 py-8">A carregar…</p>
        ) : sales.length === 0 ? (
          <p className="font-body text-sm text-[var(--da-muted)] px-5 py-8">Ainda não há vendas atribuídas ao teu link de afiliado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body" data-testid="afiliado-dashboard-orders">
              <thead className="bg-[var(--da-cream-2)]/40 border-b hairline">
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Nº</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Total</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Comissão</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30">
                    <td className="px-5 py-3 font-semibold text-[var(--da-forest)]">{o.orderNumber}</td>
                    <td className="px-5 py-3">{formatEUR(o.total)}</td>
                    <td className="px-5 py-3">{formatEUR(o.commission)}</td>
                    <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
