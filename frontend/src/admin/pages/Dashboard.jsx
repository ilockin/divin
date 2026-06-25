import React from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { KpiCard, SectionTitle, PageHeader } from "../components/Bits";
import { StatusBadge } from "../components/DataTable";
import { useAdmin } from "../context/AdminContext";
import { salesSeries, topProductsSeries, PAYMENT_STATES, SHIPPING_STATES, can } from "../data/mockAdmin";
import { formatEUR } from "../../lib/format";

const stateOf = (list, id) => list.find((s) => s.id === id);

export const Dashboard = () => {
  const { orders, products, role } = useAdmin();
  const totalRevenue = orders.reduce((s, o) => s + (o.payment === "pago" ? o.total : 0), 0);
  const ordersCount = orders.length;
  const ticketMedio = totalRevenue / Math.max(1, orders.filter((o) => o.payment === "pago").length);
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return (
    <div data-testid="admin-dashboard">
      <PageHeader title="Dashboard" subtitle="Visão geral da operação DivinArte." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard testid="kpi-receita" label="Receita (mês)" value={formatEUR(totalRevenue)} delta="+12,4% vs. mês anterior" icon={TrendingUp} />
        <KpiCard testid="kpi-pedidos" label="Pedidos" value={ordersCount} delta="+3 esta semana" icon={ShoppingCart} />
        <KpiCard testid="kpi-ticket" label="Ticket médio" value={formatEUR(ticketMedio)} delta="+1,8%" icon={Package} />
        <KpiCard testid="kpi-stock-baixo" label="Stock baixo" value={lowStock.length} delta={`${lowStock.length} produtos a reforçar`} deltaTone={lowStock.length ? "negative" : "muted"} icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border hairline rounded-2xl p-5">
          <SectionTitle eyebrow="vendas" title="Últimos 7 dias" />
          <div style={{ width: "100%", height: 260 }} data-testid="chart-sales">
            <ResponsiveContainer>
              <LineChart data={salesSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#E4DFD2" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#6B6F66" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                <YAxis stroke="#6B6F66" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, borderColor: "#E4DFD2" }} />
                <Line type="monotone" dataKey="value" stroke="#2E9E44" strokeWidth={2.5} dot={{ fill: "#14532D", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border hairline rounded-2xl p-5">
          <SectionTitle eyebrow="top produtos" title="Mais vendidos" />
          <div style={{ width: "100%", height: 260 }} data-testid="chart-top-products">
            <ResponsiveContainer>
              <BarChart data={topProductsSeries} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E4DFD2" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#6B6F66" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                <YAxis type="category" dataKey="name" stroke="#6B6F66" tick={{ fontSize: 11, fontFamily: "Montserrat" }} width={110} />
                <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, borderColor: "#E4DFD2" }} />
                <Bar dataKey="value" fill="#2E9E44" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border hairline rounded-2xl">
          <div className="px-5 py-4 border-b hairline flex items-center justify-between">
            <SectionTitle eyebrow="recentes" title="Pedidos recentes" />
            {can(role, "orders") && (
              <Link to="/admin/pedidos" className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]">ver todos →</Link>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body" data-testid="dashboard-recent-orders">
              <thead className="bg-[var(--da-cream-2)]/40 border-b hairline">
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Nº</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Cliente</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Total</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Pagamento</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">Envio</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => {
                  const pay = stateOf(PAYMENT_STATES, o.payment); const ship = stateOf(SHIPPING_STATES, o.shipping);
                  return (
                    <tr key={o.id} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30">
                      <td className="px-5 py-3"><Link to={`/admin/pedidos/${o.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{o.id}</Link></td>
                      <td className="px-5 py-3">{o.customer.name}</td>
                      <td className="px-5 py-3">{formatEUR(o.total)}</td>
                      <td className="px-5 py-3"><StatusBadge tone={pay?.tone}>{pay?.label}</StatusBadge></td>
                      <td className="px-5 py-3"><StatusBadge tone={ship?.tone}>{ship?.label}</StatusBadge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border hairline rounded-2xl p-5" data-testid="dashboard-low-stock">
          <SectionTitle eyebrow="alerta" title="Stock baixo" />
          {lowStock.length === 0 ? (
            <p className="font-body text-sm text-[var(--da-muted)]">Sem alertas. Todo o stock saudável.</p>
          ) : (
            <ul className="divide-y hairline">
              {lowStock.map((p) => (
                <li key={p.id} className="py-3 flex items-center gap-3">
                  <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded bg-[var(--da-cream-2)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm truncate">{p.name}</p>
                    <p className="font-body text-[11px] text-[var(--da-muted)]">Mín. {p.minStock}</p>
                  </div>
                  <span className="font-serif-display text-lg text-red-700">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/stock" className="block mt-4 text-center btn-da btn-da-outline w-full text-xs">Gerir stock</Link>
        </div>
      </div>
    </div>
  );
};
