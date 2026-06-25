import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../lib/format";

export const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  return (
    <article className="product-card group flex flex-col bg-[var(--da-cream-2)]/40 rounded-2xl overflow-hidden border hairline" data-testid={`product-card-${product.slug}`}>
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden aspect-[4/5] bg-[var(--da-cream-2)]">
        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--da-leaf)] text-white text-[10px] tracking-[0.2em] font-body uppercase px-3 py-1 rounded-full">
            Novidade
          </span>
        )}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="product-card-img w-full h-full object-cover"
        />
      </Link>

      <div className="flex flex-col gap-2 p-5">
        <Link to={`/produto/${product.slug}`}>
          <h3 className="text-base font-serif-display tracking-[0.08em] text-[var(--da-forest)]" data-testid={`product-name-${product.slug}`}>
            {product.name}
          </h3>
        </Link>
        <p className="font-body text-xs text-[var(--da-muted)] leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {product.short}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-body text-lg font-semibold text-[var(--da-ink)]" data-testid={`product-price-${product.slug}`}>
            {formatEUR(product.price)}
          </span>
          <button
            onClick={() => addItem(product, 1)}
            data-testid={`product-add-${product.slug}`}
            className="text-[11px] tracking-[0.18em] font-body uppercase text-[var(--da-forest)] hover:text-[var(--da-leaf)] transition border-b hairline pb-0.5"
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
};
