import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { products } from "../data/mock";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../lib/format";
import { toast } from "sonner";

const BUNDLE_DISCOUNT = 0.1; // 10% off no ritual

// Curated companion: 2 produtos da mesma categoria + 1 da categoria de bem-estar
const buildRitual = (currentProduct) => {
  const sameCat = products.filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id);
  const fromWellness = products.filter((p) => p.category === "bem-estar" && p.id !== currentProduct.id);
  const pool = [...sameCat, ...fromWellness].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );
  // pega 2 itens complementares distintos
  return pool.slice(0, 2);
};

export const RitualBundle = ({ product }) => {
  const companions = useMemo(() => buildRitual(product), [product]);
  const [selected, setSelected] = useState(() => new Set([product.id, ...companions.map((c) => c.id)]));
  const { addItem, applyPromo } = useCart();

  if (companions.length === 0) return null;

  const items = [product, ...companions];
  const items_selected = items.filter((it) => selected.has(it.id));
  const subtotal = items_selected.reduce((s, it) => s + it.price, 0);
  const discount = items_selected.length >= 2 ? subtotal * BUNDLE_DISCOUNT : 0;
  const final = subtotal - discount;

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addRitual = () => {
    if (items_selected.length === 0) {
      toast("Seleciona pelo menos um produto.");
      return;
    }
    items_selected.forEach((it) => addItem(it, 1, { silent: true }));
    if (items_selected.length >= 2) {
      applyPromo({ code: "RITUAL10", type: "percent", value: BUNDLE_DISCOUNT, label: "Desconto ritual (-10%)" });
    }
    toast.success("Ritual adicionado ao carrinho", {
      description: items_selected.length >= 2 ? `Desconto de ritual aplicado — poupas ${formatEUR(discount)}.` : "Adicionado ao carrinho.",
    });
  };

  return (
    <section className="mt-24" data-testid="ritual-bundle">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="font-script text-[var(--da-leaf)] text-2xl flex items-center gap-2">
            <Sparkles size={18} /> compõe o teu ritual
          </p>
          <h2 className="text-2xl sm:text-3xl mt-1">Junta e poupa 10%</h2>
          <p className="font-body text-sm text-[var(--da-muted)] mt-2 max-w-lg">
            Combina este produto com gestos complementares — escolhe os que fazem sentido e adiciona o ritual completo.
          </p>
        </div>
      </div>

      <div className="bg-[var(--da-cream-2)]/50 rounded-2xl border hairline p-5 sm:p-8 grid lg:grid-cols-[1fr_280px] gap-8 items-center">
        {/* items row */}
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto">
          {items.map((it, i) => {
            const checked = selected.has(it.id);
            const isMain = it.id === product.id;
            return (
              <React.Fragment key={it.id}>
                {i > 0 && <span className="font-serif-display text-2xl text-[var(--da-muted)] shrink-0">+</span>}
                <button
                  type="button"
                  onClick={() => toggle(it.id)}
                  data-testid={`ritual-toggle-${it.slug}`}
                  className={`group relative shrink-0 w-36 sm:w-40 text-left transition ${
                    checked ? "" : "opacity-50"
                  }`}
                  aria-pressed={checked}
                >
                  <div className={`aspect-square rounded-xl overflow-hidden bg-white border-2 transition ${checked ? "border-[var(--da-leaf)]" : "border-[var(--da-line)]"}`}>
                    <img src={it.images[0]} alt={it.name} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white transition ${checked ? "bg-[var(--da-leaf)]" : "bg-white/80 border hairline"}`}>
                      {checked && <Check size={14} />}
                    </span>
                    {isMain && (
                      <span className="absolute top-2 right-2 bg-[var(--da-pine)] text-white text-[9px] tracking-[0.16em] uppercase font-body px-2 py-0.5 rounded-full">
                        Este
                      </span>
                    )}
                  </div>
                  <p className="font-serif-display text-xs tracking-[0.06em] text-[var(--da-forest)] mt-3 line-clamp-2">{it.name}</p>
                  <p className="font-body text-xs text-[var(--da-muted)] mt-0.5">{formatEUR(it.price)}</p>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* summary */}
        <div className="border-t lg:border-t-0 lg:border-l hairline pt-5 lg:pt-0 lg:pl-7">
          <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)]">Total do ritual</p>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="font-serif-display text-2xl text-[var(--da-forest)]" data-testid="ritual-total">{formatEUR(final)}</span>
            {discount > 0 && (
              <span className="font-body text-sm text-[var(--da-muted)] line-through">{formatEUR(subtotal)}</span>
            )}
          </div>
          {discount > 0 && (
            <p className="font-body text-xs text-[var(--da-leaf)] mt-1">Poupas {formatEUR(discount)}</p>
          )}
          <button
            onClick={addRitual}
            data-testid="ritual-add-all"
            className="btn-da btn-da-primary w-full mt-5"
            disabled={items_selected.length === 0}
          >
            Adicionar o ritual
          </button>
          <p className="font-body text-[11px] text-[var(--da-muted)] mt-3 text-center">
            Desconto aplicado ao adicionar 2 ou mais itens.
          </p>
        </div>
      </div>
    </section>
  );
};
