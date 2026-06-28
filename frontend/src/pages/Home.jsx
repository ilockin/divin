import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Leaf, Heart, BadgeCheck } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { products, categories, testimonials, blogPosts } from "../data/mock";
import { getPublishedPage } from "../lib/pages";
import { BlockRenderer } from "../components/blocks/BlockRenderer";

export const Home = () => {
  const overridePage = getPublishedPage("inicio");
  if (overridePage) {
    return (
      <div data-testid="home-page">
        <BlockRenderer blocks={overridePage.blocks} products={products} />
      </div>
    );
  }

  const featured = products.filter((p) => p.isNew).slice(0, 4);
  const trust = [
    { icon: Leaf, label: "100% Natural" },
    { icon: Heart, label: "Vegano" },
    { icon: Sparkles, label: "Artesanal" },
    { icon: BadgeCheck, label: "Ingredientes BIO" },
  ];

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=2000&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative container-da py-32 sm:py-40 lg:py-52">
          <div className="max-w-xl">
            <p className="font-script text-[var(--da-olive)] text-3xl mb-3">cuidar com atenção</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white" style={{ color: "#F7F4EC" }}>
              A divina arte de<br />cuidar de você.
            </h1>
            <p className="font-body text-base text-white/85 mt-6 max-w-md leading-relaxed">
              Cosmética natural artesanal feita em pequenos lotes, em Portugal — para que cada gesto de cuidado seja também um momento de pausa.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/loja" className="btn-da btn-da-primary" data-testid="hero-shop-btn">
                Descobrir a loja <ArrowRight size={16} />
              </Link>
              <Link to="/sobre" className="btn-da btn-da-outline text-[#F7F4EC] border-[#F7F4EC] hover:bg-[#F7F4EC] hover:text-[var(--da-forest)]" data-testid="hero-about-btn">
                A nossa história
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[var(--da-cream-2)] border-y hairline">
        <div className="container-da grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center">
              <Icon size={22} className="text-[var(--da-leaf)]" />
              <span className="font-body text-xs sm:text-sm tracking-[0.18em] uppercase text-[var(--da-forest)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-da py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-script text-[var(--da-leaf)] text-2xl">novidades da casa</p>
            <h2 className="text-3xl sm:text-4xl mt-1">Produtos em destaque</h2>
          </div>
          <Link to="/loja" className="link-underline text-sm tracking-[0.2em] uppercase font-body text-[var(--da-forest)]">
            Ver toda a loja
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-da pb-24">
        <div className="text-center mb-12">
          <p className="font-script text-[var(--da-leaf)] text-2xl">explora por categoria</p>
          <h2 className="text-3xl sm:text-4xl mt-1">Pequenos rituais, grandes categorias</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/loja?categoria=${cat.slug}`}
              data-testid={`home-category-${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--da-pine)]/85 via-[var(--da-pine)]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl text-white" style={{ color: "#F7F4EC" }}>{cat.name}</h3>
                <p className="font-body text-xs text-white/80 mt-2 leading-relaxed">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="bg-[var(--da-pine)] text-white">
        <div className="container-da py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=75" alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-script text-[var(--da-olive)] text-3xl mb-3">a nossa história</p>
            <h2 className="text-3xl sm:text-4xl leading-[1.1]" style={{ color: "#F7F4EC" }}>
              Fórmulas suaves, feitas com<br />mãos atentas.
            </h2>
            <p className="font-body text-sm sm:text-base text-white/80 mt-6 leading-relaxed">
              A DivinArte nasceu de um gesto simples — o de cuidar. Cada produto é pensado em pequenos lotes, com ingredientes naturais escolhidos com calma, plantas locais sempre que possível, e a convicção de que beleza é também uma forma de bondade.
            </p>
            <ul className="mt-8 space-y-3 font-body text-sm">
              <li className="leaf-bullet">Produção artesanal em Portugal, em pequenos lotes</li>
              <li className="leaf-bullet">Ingredientes naturais, vegan-friendly sempre que possível</li>
              <li className="leaf-bullet">Embalagem em vidro âmbar, reutilizável</li>
            </ul>
            <Link to="/sobre" className="btn-da btn-da-outline mt-8 text-[#F7F4EC] border-[#F7F4EC] hover:bg-[#F7F4EC] hover:text-[var(--da-forest)]" data-testid="home-story-cta">
              Saber mais sobre nós
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-da py-24">
        <div className="text-center mb-12">
          <p className="font-script text-[var(--da-leaf)] text-2xl">a voz de quem cuida connosco</p>
          <h2 className="text-3xl sm:text-4xl mt-1">Pequenas palavras grandes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure key={i} className="bg-white rounded-2xl p-7 border hairline">
              <blockquote className="font-serif-display text-[var(--da-forest)] text-lg leading-snug normal-case" style={{ letterSpacing: "0.02em" }}>
                “{t.text}”
              </blockquote>
              <figcaption className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] mt-6">
                — {t.name}, {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* BLOG TEASER */}
      <section className="container-da pb-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-script text-[var(--da-leaf)] text-2xl">do nosso diário</p>
            <h2 className="text-3xl sm:text-4xl mt-1">Rituais e ingredientes</h2>
          </div>
          <Link to="/blog" className="link-underline text-sm tracking-[0.2em] uppercase font-body text-[var(--da-forest)]">
            Ver todos os artigos
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group block" data-testid={`home-blog-${post.slug}`}>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <img src={post.cover} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[var(--da-leaf)] mt-5">{post.category}</p>
              <h3 className="text-lg mt-2 group-hover:text-[var(--da-leaf)] transition-colors">{post.title}</h3>
              <p className="font-body text-sm text-[var(--da-muted)] mt-2 leading-relaxed">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
