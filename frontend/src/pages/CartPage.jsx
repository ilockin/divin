import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../lib/format";

export const CartPage = () => {
  const { items, totals, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-da py-24 text-center" data-testid="cart-page-empty">
        <p className="font-script text-[var(--da-leaf)] text-2xl">carrinho vazio</p>
        <h1 className="text-3xl sm:text-4xl mt-2">Ainda não há nada por aqui</h1>
        <p className="font-body text-[var(--da-muted)] mt-4 max-w-md mx-auto">
          Explora a nossa loja e encontra um pequeno ritual para acompanhar os teus dias.
        </p>
        <Link to="/loja" className="btn-da btn-da-primary mt-8" data-testid="empty-cart-shop-cta">
          Descobrir a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="container-da py-12" data-testid="cart-page">
      <h1 className="text-3xl sm:text-4xl mb-10">O teu carrinho</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 p-5 bg-white rounded-2xl border hairline" data-testid={`cartpage-item-${item.slug}`}>
              <img src={item.image} alt={item.name} className="w-24 h-28 object-cover rounded-lg bg-[var(--da-cream-2)]" />
              <div className="flex-1">
                <Link to={`/produto/${item.slug}`} className="font-serif-display text-base text-[var(--da-forest)] tracking-[0.08em]">{item.name}</Link>
                <p className="font-body text-xs text-[var(--da-muted)] mt-1">{item.size}</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center border hairline rounded-full">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2" aria-label="Diminuir"><Minus size={12} /></button>
                    <span className="w-8 text-center text-xs font-body">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2" aria-label="Aumentar"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--da-muted)] hover:text-red-600 flex items-center gap-1 font-body text-xs">
                    <Trash2 size={14} /> Remover
                  </button>
                </div>
              </div>
              <span className="font-body font-semibold whitespace-nowrap">{formatEUR(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        <aside className="bg-white rounded-2xl border hairline p-6 h-fit sticky top-32">
          <h2 className="text-xl mb-5">Resumo</h2>
          <div className="space-y-2 font-body text-sm">
            <div className="flex justify-between"><span className="text-[var(--da-muted)]">Subtotal</span><span data-testid="cartpage-subtotal">{formatEUR(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--da-muted)]">Envio</span><span>{totals.shipping === 0 ? "Grátis" : formatEUR(totals.shipping)}</span></div>
            {totals.shipping > 0 && (
              <p className="text-xs text-[var(--da-muted)] italic">Faltam {formatEUR(49 - totals.subtotal)} para envio grátis.</p>
            )}
          </div>
          <div className="border-t hairline mt-4 pt-4 flex justify-between text-lg font-semibold">
            <span>Total</span><span data-testid="cartpage-total">{formatEUR(totals.total)}</span>
          </div>
          <Link to="/checkout" className="btn-da btn-da-primary w-full mt-6" data-testid="cartpage-checkout">
            Finalizar compra
          </Link>
          <Link to="/loja" className="btn-da btn-da-ghost w-full mt-2 text-xs">
            Continuar a comprar
          </Link>
        </aside>
      </div>
    </div>
  );
};
