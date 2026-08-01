import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Wallet, PiggyBank, Percent } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, SectionTitle, PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { purchaseTotal } from "../data/mockErp";
import { loadAllOrders } from "../../lib/adminOrders";
import { formatEUR } from "../../lib/format";

const PIE_COLORS = ["#2E9E44", "#14532D", "#B7BD53", "#2C4A3B", "#6B6F66", "#9AA05A"];
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;

export const FinanceiroOverview = () => {
  const { purchases, insumos } = useAdmin();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadAllOrders()
      .then(setOrders)
      .catch((e) => toast.error("Erro ao carregar encomendas", { description: e.message }));
  }, []);

  // Últimos 6 meses (chave ano-mês + label PT).
  const months = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({ key: monthKey(d), label: MESES[d.getMonth()] });
    }
    return out;
  }, []);

  const { series, receita, custos, lucro, margem } = useMemo(() => {
    const receitaBy = {};
    orders.filter((o) => o.status === "pago").forEach((o) => {
      const k = monthKey(new Date(o.created_at));
      receitaBy[k] = (receitaBy[k] || 0) + Number(o.total || 0);
    });
    const custosBy = {};
    purchases.filter((p) => p.status === "recebida").forEach((p) => {
      const k = monthKey(new Date(p.date));
      custosBy[k] = (custosBy[k] || 0) + purchaseTotal(p);
    });
    const series = months.map((m) => ({ month: m.label, receita: receitaBy[m.key] || 0, custos: custosBy[m.key] || 0 }));
    const receita = series.reduce((s, m) => s + m.receita, 0);
    const custos = series.reduce((s, m) => s + m.custos, 0);
    const lucro = receita - custos;
    const margem = receita ? (lucro / receita) * 100 : 0;
    return { series, receita, custos, lucro, margem };
  }, [orders, purchases, months]);

  // Custos por categoria de insumo (compras recebidas).
  const costByCategory = useMemo(() => {
    const byCat = {};
    purchases.filter((p) => p.status === "recebida").forEach((p) => {
      (p.lines || []).forEach((l) => {
        const cat = insumos.find((i) => i.id === l.insumoId)?.category || "Outros";
        byCat[cat] = (byCat[cat] || 0) + (Number(l.qty) || 0) * (Number(l.cost) || 0);
      });
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [purchases, insumos]);

  return (
    <div data-testid="admin-financeiro-overview">
      <PageHeader title="Financeiro — Visão Geral" subtitle="Desempenho financeiro dos últimos 6 meses (dados reais)." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard testid="fin-kpi-receita" label="Receita" value={formatEUR(receita)} delta="Encomendas pagas · 6 meses" deltaTone="muted" icon={TrendingUp} />
        <KpiCard testid="fin-kpi-custos" label="Custos" value={formatEUR(custos)} delta="Compras recebidas · 6 meses" deltaTone="muted" icon={Wallet} />
        <KpiCard testid="fin-kpi-lucro" label="Lucro" value={formatEUR(lucro)} delta={`${margem.toFixed(1)}% de margem`} deltaTone={lucro >= 0 ? "positive" : "negative"} icon={PiggyBank} />
        <KpiCard testid="fin-kpi-margem" label="Margem média" value={`${margem.toFixed(1)}%`} delta="Receita vs. custos" deltaTone={margem < 20 ? "negative" : "positive"} icon={Percent} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border hairline rounded-2xl p-5">
          <SectionTitle eyebrow="evolução" title="Receita vs. Custos" />
          <div style={{ width: "100%", height: 280 }} data-testid="chart-receita-custos">
            <ResponsiveContainer>
              <BarChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#E4DFD2" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#6B6F66" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                <YAxis stroke="#6B6F66" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                <Tooltip
                  formatter={(v, name) => [formatEUR(v), name === "receita" ? "Receita" : "Custos"]}
                  contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, borderColor: "#E4DFD2" }}
                />
                <Legend formatter={(v) => (v === "receita" ? "Receita" : "Custos")} wrapperStyle={{ fontFamily: "Montserrat", fontSize: 12 }} />
                <Bar dataKey="receita" fill="#2E9E44" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custos" fill="#B7BD53" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border hairline rounded-2xl p-5">
          <SectionTitle eyebrow="repartição" title="Custos por categoria" />
          <div style={{ width: "100%", height: 280 }} data-testid="chart-custos-categoria">
            {costByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center font-body text-sm text-[var(--da-muted)] px-4">
                Sem compras recebidas para repartir. Regista uma compra com estado "recebida".
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={costByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {costByCategory.map((entry, i) => (<Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [formatEUR(v), name]} contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, borderColor: "#E4DFD2" }} />
                  <Legend wrapperStyle={{ fontFamily: "Montserrat", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
