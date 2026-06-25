import React from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../lib/format";

export const CartDrawer = () => {
  const { items, totals, drawerOpen, setDrawerOpen, updateQty, removeItem } = useCart();

  return (
    <>
      {/* backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden
      />
      {/* drawer */}
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[var(--da-cream)] shadow-xl transition-transform duration-300 flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrinho"
      >
        <div className="flex items-center justify-between p-5 border-b hairline">
          <h3 className="text-lg font-serif-display tracking-[0.12em] text-[var(--da-forest)]">O TEU CARRINHO</h3>
          <button onClick={() => setDrawerOpen(false)} aria-label="Fechar" data-testid="cart-drawer-close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 font-body text-sm text-[var(--da-muted)]">
              <p>O teu carrinho está vazio.</p>
              <Link to="/loja" onClick={() => setDrawerOpen(false)} className="inline-block mt-6 btn-da btn-da-outline" data-testid="cart-drawer-shop-cta">
                Descobrir a loja
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b hairline" data-testid={`cart-item-${item.slug}`}>
                <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md bg-[var(--da-cream-2)]" />
                <div className="flex-1">
                  <Link to={`/produto/${item.slug}`} onClick={() => setDrawerOpen(false)} className="block font-serif-display text-sm text-[var(--da-forest)] tracking-[0.08em]">
                    {item.name}
                  </Link>
                  <p className="font-body text-xs text-[var(--da-muted)] mt-1">{item.size}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border hairline rounded-full">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1.5" aria-label="Diminuir" data-testid={`cart-qty-minus-${item.slug}`}><Minus size={12} /></button>
                      <span className="text-xs font-body px-2 w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1.5" aria-label="Aumentar" data-testid={`cart-qty-plus-${item.slug}`}><Plus size={12} /></button>
                    </div>
                    <span className="font-body text-sm font-semibold">{formatEUR(item.price * item.qty)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} aria-label="Remover" data-testid={`cart-remove-${item.slug}`} className="text-[var(--da-muted)] hover:text-red-600 transition self-start">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t hairline p-5 space-y-3 bg-white/50">
            <div className="flex justify-between font-body text-sm">
              <span className="text-[var(--da-muted)]">Subtotal</span>
              <span className="font-semibold" data-testid="cart-drawer-subtotal">{formatEUR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between font-body text-xs text-[var(--da-muted)]">
              <span>Envio</span>
              <span>{totals.shipping === 0 ? "Grátis" : formatEUR(totals.shipping)}</span>
            </div>
            <Link to="/carrinho" onClick={() => setDrawerOpen(false)} className="btn-da btn-da-outline w-full" data-testid="cart-drawer-view-cart">
              Ver carrinho
            </Link>
            <Link to="/checkout" onClick={() => setDrawerOpen(false)} className="btn-da btn-da-primary w-full" data-testid="cart-drawer-checkout">
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};
