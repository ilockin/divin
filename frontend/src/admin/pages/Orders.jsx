import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader, SectionTitle } from "../components/Bits";
import { loadAllOrders, updateOrderStatus, ORDER_STATUSES } from "../../lib/adminOrders";
import { formatEUR } from "../../lib/format";
import { paymentMethodLabel } from "../../lib/payments";

const TONE_MAP = { ok: "ok", warn: "warn", info: "info", err: "err" };

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadAllOrders()
      .then(setOrders)
      .catch(() => toast.error("Erro ao carregar encomendas"))
      .finally(() => setLoading(false));
  }, []);

  const data = orders.filter((o) => (statusFilter ? o.status === statusFilter : true));

  const cols = [
    {
      key: "order_number", label: "Nº", sortable: true,
      render: (o) => (
        <Link to={`/admin/pedidos/${o.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">
          {o.order_number}
        </Link>
      ),
    },
    {
      key: "email", label: "Cliente",
      render: (o) => (
        <div>
          <p className="font-body text-sm">{o.shipping_address?.name || "—"}</p>
          <p className="font-body text-[11px] text-[var(--da-muted)]">{o.email}</p>
        </div>
      ),
    },
    {
      key: "created_at", label: "Data", sortable: true,
      render: (o) => (
        <span className="text-[var(--da-muted)] font-body text-sm">
          {new Date(o.created_at).toLocaleDateString("pt-PT")}
        </span>
      ),
    },
    {
      key: "order_items", label: "Itens",
      render: (o) => <span className="font-body text-sm">{o.order_items?.length ?? 0}</span>,
    },
    {
      key: "total", label: "Total", sortable: true,
      render: (o) => <span className="font-body text-sm font-semibold">{formatEUR(o.total)}</span>,
    },
    {
      // Importa ao balcão: uma encomenda em numerário fica por pagar até ser levantada.
      key: "payment_method", label: "Pagamento",
      render: (o) => (
        <StatusBadge tone={o.payment_method === "numerario" ? "amber" : "muted"}>
          {paymentMethodLabel(o.payment_method)}
        </StatusBadge>
      ),
    },
    {
      key: "status", label: "Estado",
      render: (o) => {
        const s = ORDER_STATUSES.find((st) => st.id === o.status);
        return <StatusBadge tone={TONE_MAP[s?.tone]}>{s?.label ?? o.status}</StatusBadge>;
      },
    },
  ];

  return (
    <div data-testid="admin-orders">
      <PageHeader title="Pedidos" subtitle="Acompanha as encomendas e actualiza estados." />
      {loading ? (
        <p className="font-body text-sm text-[var(--da-muted)] px-1">A carregar…</p>
      ) : (
        <DataTable
          testid="orders-table"
          data={data}
          columns={cols}
          getRowId={(o) => o.id}
          searchKeys={["order_number", "email"]}
          pageSize={10}
          filters={(
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="orders-filter-status"
              className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white"
            >
              <option value="">Estado: todos</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          )}
        />
      )}
    </div>
  );
};

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllOrders()
      .then((all) => {
        const found = all.find((o) => o.id === id);
        if (found) setOrder(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 font-body text-sm text-[var(--da-muted)]">A carregar…</div>;
  if (!order) return <Navigate to="/admin/pedidos" replace />;

  const changeStatus = async (val) => {
    setSaving(true);
    try {
      await updateOrderStatus(order.id, val);
      setOrder((prev) => ({ ...prev, status: val }));
      toast.success("Estado actualizado");
    } catch (err) {
      toast.error("Erro ao actualizar", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addr = order.shipping_address || {};

  return (
    <div data-testid="admin-order-detail">
      <Link to="/admin/pedidos" className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] hover:text-[var(--da-leaf)] inline-flex items-center gap-1">
        <ChevronLeft size={14} /> Voltar
      </Link>
      <PageHeader
        title={`Encomenda ${order.order_number}`}
        subtitle={new Date(order.created_at).toLocaleString("pt-PT")}
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          {/* Itens */}
          <div className="bg-white border hairline rounded-2xl p-6">
            <SectionTitle eyebrow="itens" title="Produtos da encomenda" />
            <table className="w-full text-sm font-body">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-[var(--da-muted)] border-b hairline">
                <tr>
                  <th className="text-left py-2">Produto</th>
                  <th>Qtd</th>
                  <th className="text-right">Preço</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((it) => (
                  <tr key={it.id} className="border-b hairline last:border-b-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {it.image_url && (
                          <img src={it.image_url} alt="" className="w-10 h-12 object-cover rounded bg-[var(--da-cream-2)]" />
                        )}
                        <div>
                          <p className="font-semibold">{it.name}</p>
                          <p className="text-[11px] text-[var(--da-muted)]">{it.size || "—"}</p>
                        </div>
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
              <div className="flex justify-between">
                <span className="text-[var(--da-muted)]">Subtotal</span>
                <span>{formatEUR(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-[var(--da-leaf)]">
                  <span>Desconto</span>
                  <span>− {formatEUR(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--da-muted)]">Envio</span>
                <span>{order.shipping_cost > 0 ? formatEUR(order.shipping_cost) : "Grátis"}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t hairline pt-2 mt-2">
                <span>Total</span>
                <span data-testid="order-total">{formatEUR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cliente e morada */}
          <div className="bg-white border hairline rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Cliente</p>
              <p className="font-semibold">{addr.name || "—"}</p>
              <p className="font-body text-sm text-[var(--da-muted)]">{order.email}</p>
              {addr.phone && <p className="font-body text-sm text-[var(--da-muted)]">{addr.phone}</p>}
            </div>
            <div>
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Morada de envio</p>
              <p className="font-body text-sm">{addr.line1 || "—"}</p>
              <p className="font-body text-sm">{addr.zip} {addr.city}</p>
              <p className="font-body text-sm text-[var(--da-muted)]">{addr.country || "Portugal"}</p>
            </div>
          </div>
        </div>

        {/* Sidebar — estado */}
        <aside className="space-y-6">
          <div className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid="order-status-card">
            <SectionTitle eyebrow="estado" title="Actualizar" />
            <div className="space-y-1.5">
              {ORDER_STATUSES.map((s) => (
                <label key={s.id} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    disabled={saving}
                    checked={order.status === s.id}
                    onChange={() => changeStatus(s.id)}
                    data-testid={`order-status-${s.id}`}
                  />
                  <StatusBadge tone={TONE_MAP[s.tone]}>{s.label}</StatusBadge>
                </label>
              ))}
            </div>
          </div>

          {order.stripe_session_id && (
            <div className="bg-white border hairline rounded-2xl p-6">
              <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-2">Stripe</p>
              <p className="font-body text-xs text-[var(--da-muted)] break-all">{order.stripe_session_id}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
