import React, { useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { PAYMENT_STATES, SHIPPING_STATES } from "../data/mockAdmin";
import { formatEUR } from "../../lib/format";

const stateOf = (list, id) => list.find((s) => s.id === id);

export const Orders = () => {
  const { orders } = useAdmin();
  const [payFilter, setPayFilter] = useState("");
  const [shipFilter, setShipFilter] = useState("");

  const data = orders
    .filter((o) => (payFilter ? o.payment === payFilter : true))
    .filter((o) => (shipFilter ? o.shipping === shipFilter : true));

  const cols = [
    { key: "id", label: "Nº", sortable: true,
      render: (o) => <Link to={`/admin/pedidos/${o.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{o.id}</Link> },
    { key: "customer", label: "Cliente",
      render: (o) => <span>{o.customer.name}</span> },
    { key: "date", label: "Data", sortable: true,
      render: (o) => <span className="text-[var(--da-muted)]">{new Date(o.date).toLocaleDateString("pt-PT")}</span> },
    { key: "total", label: "Total", sortable: true,
      render: (o) => formatEUR(o.total) },
    { key: "payment", label: "Pagamento",
      render: (o) => { const s = stateOf(PAYMENT_STATES, o.payment); return <StatusBadge tone={s?.tone}>{s?.label}</StatusBadge>; } },
    { key: "shipping", label: "Envio",
      render: (o) => { const s = stateOf(SHIPPING_STATES, o.shipping); return <StatusBadge tone={s?.tone}>{s?.label}</StatusBadge>; } },
  ];

  return (
    <div data-testid="admin-orders">
      <PageHeader title="Pedidos" subtitle="Acompanha as encomendas, atualiza estados e abre o detalhe." />

      <DataTable
        testid="orders-table"
        data={data}
        columns={cols}
        getRowId={(o) => o.id}
        searchKeys={["id"]}
        pageSize={8}
        filters={(
          <>
            <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} data-testid="orders-filter-pay" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Pagamento: todos</option>
              {PAYMENT_STATES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
            </select>
            <select value={shipFilter} onChange={(e) => setShipFilter(e.target.value)} data-testid="orders-filter-ship" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Envio: todos</option>
              {SHIPPING_STATES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
            </select>
          </>
        )}
      />
    </div>
  );
};

export const OrderDetail = () => {
  const { id } = useParams();
  const { orders, setOrders } = useAdmin();
  const order = orders.find((o) => o.id === id);
  if (!order) return <Navigate to="/admin/pedidos" replace />;

  const updatePayment = (val) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, payment: val } : o));
    toast.success("Estado de pagamento atualizado.");
  };
  const updateShipping = (val) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, shipping: val } : o));
    toast.success("Estado de envio atualizado.");
  };

  const subtotal = order.items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = order.total - subtotal;

  return (
    <div data-testid="admin-order-detail">
      <Link to="/admin/pedidos" className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] hover:text-[var(--da-leaf)] inline-flex items-center gap-1">
        <ChevronLeft size={14} /> Voltar
      </Link>
      <PageHeader title={`Encomenda ${order.id}`} subtitle={new Date(order.date).toLocaleString("pt-PT")} />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="bg-white border hairline rounded-2xl p-6">
            <SectionTitle eyebrow="itens" title="Produtos da encomenda" />
            <table className="w-full text-sm font-body">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-[var(--da-muted)] border-b hairline">
                <tr><th className="text-left py-2">Produto</th><th>Qtd</th><th className="text-right">Preço</th><th className="text-right">Subtotal</th></tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b hairline last:border-b-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt="" className="w-10 h-12 object-cover rounded bg-[var(--da-cream-2)]" />
                        <div><p className="font-semibold">{it.name}</p><p className="text-[11px] text-[var(--da-muted)]">{it.size}</p></div>
                      </div>
                    </td>
                    <td className="text-center">{it.qty}</td>
                    <td className="text-right">{formatEUR(it.price)}</td>
                    <td className="text-right font-semibold">{formatEUR(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 ml-auto max-w-xs space-y-1 text-sm font-body">
              <div className="flex justify-between"><span className="text-[var(--da-muted)]">Subtotal</span><span>{formatEUR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--da-muted)]">Envio ({order.shippingMethod})</span><span>{shipping > 0 ? formatEUR(shipping) : "Grátis"}</span></div>
              <div className="flex justify-between font-semibold text-base border-t hairline pt-2 mt-2"><span>Total</span><span data-testid="order-total">{formatEUR(order.total)}</span></div>
            </div>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Cliente</p>
              <p className="font-semibold">{order.customer.name}</p>
              <p className="font-body text-sm text-[var(--da-muted)]">{order.customer.email}</p>
              <p className="font-body text-sm text-[var(--da-muted)]">{order.customer.phone}</p>
            </div>
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Morada de envio</p>
              <p className="font-body text-sm">{order.customer.address.line1}</p>
              <p className="font-body text-sm">{order.customer.address.zip} {order.customer.address.city}</p>
              <p className="font-body text-sm text-[var(--da-muted)]">Portugal</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid="order-status-card">
            <SectionTitle eyebrow="estado" title="Atualizar" />
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Pagamento</p>
              <div className="space-y-1.5">
                {PAYMENT_STATES.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                    <input type="radio" name="payment" checked={order.payment === s.id} onChange={() => updatePayment(s.id)} data-testid={`order-pay-${s.id}`} />
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2 mt-3">Envio</p>
              <div className="space-y-1.5">
                {SHIPPING_STATES.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                    <input type="radio" name="shipping" checked={order.shipping === s.id} onChange={() => updateShipping(s.id)} data-testid={`order-ship-${s.id}`} />
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border hairline rounded-2xl p-6">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Pagamento</p>
            <p className="font-body text-sm">{order.paymentMethod}</p>
            <p className="font-body text-xs text-[var(--da-muted)] mt-3 italic">Os pagamentos são geridos pelo gateway na produção. Aqui apenas se atualiza o estado.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
