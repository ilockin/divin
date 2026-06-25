import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Leaf, Heart, BadgeCheck, Truck, Minus, Plus } from "lucide-react";
import { findProduct, products } from "../data/mock";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../lib/format";
import { ProductCard } from "../components/ProductCard";
import { RitualBundle } from "../components/RitualBundle";

export const ProductDetail = () => {
  const { slug } = useParams();
  const product = findProduct(slug);
  const { addItem } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(product?.size);

  if (!product) return <Navigate to="/loja" replace />;

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-da py-12" data-testid="product-detail-page">
      <nav className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] mb-8">
        <Link to="/" className="hover:text-[var(--da-leaf)]">Início</Link>
        <span className="mx-2">/</span>
        <Link to="/loja" className="hover:text-[var(--da-leaf)]">Loja</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--da-forest)]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* gallery */}
        <div>
          <div className="aspect-[4/5] bg-[var(--da-cream-2)] rounded-2xl overflow-hidden">
            <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" data-testid="product-main-image" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                data-testid={`thumb-${i}`}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${activeImg === i ? "border-[var(--da-leaf)]" : "border-transparent"}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* details */}
        <div>
          <p className="font-script text-[var(--da-leaf)] text-2xl">{product.short.split(".")[0].toLowerCase()}.</p>
          <h1 className="text-3xl sm:text-4xl mt-2" data-testid="product-detail-name">{product.name}</h1>
          <p className="font-body text-2xl font-semibold mt-4" data-testid="product-detail-price">{formatEUR(product.price)}</p>
          <p className="font-body text-sm text-[var(--da-muted)] mt-1">Preço com IVA incluído</p>

          <p className="font-body text-base text-[var(--da-ink)] mt-6 leading-relaxed">{product.description}</p>

          {/* variant */}
          <div className="mt-8">
            <p className="text-xs tracking-[0.22em] uppercase text-[var(--da-forest)] mb-3">Formato</p>
            <div className="flex gap-2">
              <button
                onClick={() => setVariant(product.size)}
                data-testid="variant-default"
                className={`px-4 py-2 rounded-full border font-body text-sm ${variant === product.size ? "bg-[var(--da-forest)] text-white border-[var(--da-forest)]" : "border-[var(--da-line)]"}`}
              >
                {product.size}
              </button>
            </div>
          </div>

          {/* qty + add */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="flex items-center border hairline rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Diminuir" data-testid="qty-minus"><Minus size={14} /></button>
              <span className="w-10 text-center font-body" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3" aria-label="Aumentar" data-testid="qty-plus"><Plus size={14} /></button>
            </div>
            <button onClick={() => addItem(product, qty)} className="btn-da btn-da-primary flex-1 min-w-[200px]" data-testid="product-add-to-cart">
              Adicionar ao carrinho
            </button>
          </div>

          {/* benefits */}
          <div className="mt-10">
            <h3 className="text-lg mb-3">Benefícios</h3>
            <ul className="space-y-2 font-body text-sm">
              {product.benefits.map((b, i) => (<li key={i} className="leaf-bullet">{b}</li>))}
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="text-lg mb-2">Modo de uso</h3>
            <p className="font-body text-sm text-[var(--da-muted)] leading-relaxed">{product.usage}</p>
          </div>

          {/* trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t hairline">
            {[
              { Icon: Leaf, label: "100% Natural" },
              { Icon: Heart, label: product.vegan ? "Vegano" : "Não vegano" },
              { Icon: BadgeCheck, label: product.bio ? "Ingredientes BIO" : "Selecionado" },
              { Icon: Truck, label: "Envio em 48h" },
            ].map(({ Icon, label }, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5">
                <Icon size={20} className="text-[var(--da-leaf)]" />
                <span className="font-body text-[11px] tracking-[0.14em] uppercase text-[var(--da-forest)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ritual bundle upsell */}
      <RitualBundle product={product} />

      {/* related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl sm:text-3xl mb-8">Para complementar o ritual</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};
