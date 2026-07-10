import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { formatEUR } from "../lib/format";
import { getStatusInfo } from "../lib/orders";

export const OrderSuccess = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get("order") || "";
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderNumber) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .single()
      .then(({ data }) => { if (data) setOrder(data); });
  }, [orderNumber]);

  const { label: statusLabel, color: statusColor } = getStatusInfo(order?.status || "pendente");

  return (
    <div className="container-da py-20 max-w-2xl mx-auto text-center" data-testid="order-success-page">
      <div className="w-16 h-16 rounded-full bg-[var(--da-leaf)] text-white flex items-center justify-center mx-auto">
        <Check size={28} />
      </div>
      <p className="font-script text-[var(--da-leaf)] text-3xl mt-6">obrigado</p>
      <h1 className="text-3xl sm:text-4xl mt-1">A tua encomenda foi recebida</h1>
      <p className="font-body text-[var(--da-muted)] mt-4">
        Encomenda{" "}
        <span className="font-semibold text-[var(--da-forest)]" data-testid="order-id">
          {orderNumber || "—"}
        </span>{" "}
        · um e-mail de confirmação foi enviado.
      </p>

      {order && (
        <div className="bg-white border hairline rounded-2xl p-6 mt-10 text-left">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base">Resumo da encomenda</h3>
            <span
              className="text-[10px] tracking-[0.18em] uppercase px-3 py-1 rounded-full font-semibold"
              style={{ backgroundColor: `${statusColor}22`, color: statusColor }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="space-y-3">
            {order.order_items?.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                {it.image_url && (
                  <img src={it.image_url} alt="" className="w-10 h-12 object-cover rounded bg-[var(--da-cream-2)]" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm truncate">{it.name}</p>
                  <p className="font-body text-[11px] text-[var(--da-muted)]">x{it.qty}{it.size ? ` · ${it.size}` : ""}</p>
                </div>
                <span className="font-body text-sm font-semibold">{formatEUR(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t hairline space-y-1.5 font-body text-sm">
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
          </div>
          <div className="border-t hairline mt-3 pt-3 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span data-testid="success-total">{formatEUR(order.total)}</span>
          </div>
          <div className="mt-5 pt-4 border-t hairline font-body text-sm text-[var(--da-muted)]">
            <p>{order.shipping_address?.name}</p>
            <p>{order.shipping_address?.line1}</p>
            <p>{order.shipping_address?.zip} {order.shipping_address?.city}</p>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 mt-10 flex-wrap">
        <Link to="/loja" className="btn-da btn-da-primary" data-testid="success-continue">Continuar a comprar</Link>
        <Link to="/conta/encomendas" className="btn-da btn-da-outline">Os meus pedidos</Link>
      </div>
    </div>
  );
};
