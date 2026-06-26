import React, { useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Wallet, PiggyBank, Percent } from "lucide-react";
import { KpiCard, SectionTitle, PageHeader } from "../components/Bits";
import { financeSeries, costBreakdown } from "../data/mockErp";
import { formatEUR } from "../../lib/format";

const PIE_COLORS = ["#2E9E44", "#14532D", "#B7BD53", "#2C4A3B", "#6B6F66"];

export const FinanceiroOverview = () => {
  const { receita, custos, lucro, margem } = useMemo(() => {
    const receita = financeSeries.reduce((s, m) => s + m.receita, 0);
    const custos = financeSeries.reduce((s, m) => s + m.custos, 0);
    const lucro = receita - custos;
    const margem = receita ? (lucro / receita) * 100 : 0;
    return { receita, custos, lucro, margem };
  }, []);

  return (
    <div data-testid="admin-financeiro-overview">
      <PageHeader title="Financeiro — Visão Geral" subtitle="Desempenho financeiro dos últimos meses." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard testid="fin-kpi-receita" label="Receita" value={formatEUR(receita)} delta="Acumulado 6 meses" deltaTone="muted" icon={TrendingUp} />
        <KpiCard testid="fin-kpi-custos" label="Custos" value={formatEUR(custos)} delta="Acumulado 6 meses" deltaTone="muted" icon={Wallet} />
        <KpiCard testid="fin-kpi-lucro" label="Lucro" value={formatEUR(lucro)} delta={`${margem.toFixed(1)}% de margem`} deltaTone="positive" icon={PiggyBank} />
        <KpiCard testid="fin-kpi-margem" label="Margem média" value={`${margem.toFixed(1)}%`} delta="Receita vs. custos" deltaTone={margem < 20 ? "negative" : "positive"} icon={Percent} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border hairline rounded-2xl p-5">
          <SectionTitle eyebrow="evolução" title="Receita vs. Custos" />
          <div style={{ width: "100%", height: 280 }} data-testid="chart-receita-custos">
            <ResponsiveContainer>
              <BarChart data={financeSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
            <ResponsiveContainer>
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {costBreakdown.map((entry, i) => (<Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v}%`, name]} contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, borderColor: "#E4DFD2" }} />
                <Legend wrapperStyle={{ fontFamily: "Montserrat", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
