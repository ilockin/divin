import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { formatEUR } from "../lib/format";

export const OrderSuccess = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order") || "DA-XXXX";
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("divinarte-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="container-da py-20 max-w-2xl mx-auto text-center" data-testid="order-success-page">
      <div className="w-16 h-16 rounded-full bg-[var(--da-leaf)] text-white flex items-center justify-center mx-auto">
        <Check size={28} />
      </div>
      <p className="font-script text-[var(--da-leaf)] text-3xl mt-6">obrigado</p>
      <h1 className="text-3xl sm:text-4xl mt-1">A tua encomenda foi recebida</h1>
      <p className="font-body text-[var(--da-muted)] mt-4">
        Encomenda <span className="font-semibold text-[var(--da-forest)]" data-testid="order-id">{orderId}</span> · um e-mail de confirmação foi enviado.
      </p>

      {order && (
        <div className="bg-white border hairline rounded-2xl p-6 mt-10 text-left">
          <h3 className="text-base mb-4">Resumo</h3>
          <div className="space-y-3">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between font-body text-sm">
                <span>{it.name} <span className="text-[var(--da-muted)]">x{it.qty}</span></span>
                <span>{formatEUR(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t hairline mt-4 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatEUR(order.total)}</span>
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
