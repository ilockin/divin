import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Leaf, Heart, BadgeCheck } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { products, categories, testimonials, blogPosts } from "../data/mock";
import { loadHomeContent } from "../lib/homeContent";

export const Home = () => {
  const content = loadHomeContent();
  const featured = products.filter((p) => p.isNew).slice(0, 4);
  const trustIcons = [Leaf, Heart, Sparkles, BadgeCheck];
  const trust = content.trust.labels.map((label, i) => ({ icon: trustIcons[i] || Leaf, label }));

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={content.hero.image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative container-da py-32 sm:py-40 lg:py-52">
          <div className="max-w-xl">
            <p className="font-script text-[var(--da-olive)] text-3xl mb-3">{content.hero.eyebrow}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white" style={{ color: "#F7F4EC" }}>
              {content.hero.titleLine1}<br />{content.hero.titleLine2}
            </h1>
            <p className="font-body text-base text-white/85 mt-6 max-w-md leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/loja" className="btn-da btn-da-primary" data-testid="hero-shop-btn">
                {content.hero.ctaShopText} <ArrowRight size={16} />
              </Link>
              <Link to="/sobre" className="btn-da btn-da-outline text-[#F7F4EC] border-[#F7F4EC] hover:bg-[#F7F4EC] hover:text-[var(--da-forest)]" data-testid="hero-about-btn">
                {content.hero.ctaAboutText}
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
            <p className="font-script text-[var(--da-leaf)] text-2xl">{content.featured.eyebrow}</p>
            <h2 className="text-3xl sm:text-4xl mt-1">{content.featured.title}</h2>
          </div>
          <Link to="/loja" className="link-underline text-sm tracking-[0.2em] uppercase font-body text-[var(--da-forest)]">
            {content.featured.linkText}
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-da pb-24">
        <div className="text-center mb-12">
          <p className="font-script text-[var(--da-leaf)] text-2xl">{content.categories.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl mt-1">{content.categories.title}</h2>
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
            <img src={content.story.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-script text-[var(--da-olive)] text-3xl mb-3">{content.story.eyebrow}</p>
            <h2 className="text-3xl sm:text-4xl leading-[1.1]" style={{ color: "#F7F4EC" }}>
              {content.story.title}
            </h2>
            <p className="font-body text-sm sm:text-base text-white/80 mt-6 leading-relaxed">
              {content.story.paragraph}
            </p>
            <ul className="mt-8 space-y-3 font-body text-sm">
              {content.story.bullets.map((bullet, i) => (
                <li key={i} className="leaf-bullet">{bullet}</li>
              ))}
            </ul>
            <Link to="/sobre" className="btn-da btn-da-outline mt-8 text-[#F7F4EC] border-[#F7F4EC] hover:bg-[#F7F4EC] hover:text-[var(--da-forest)]" data-testid="home-story-cta">
              {content.story.ctaText}
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-da py-24">
        <div className="text-center mb-12">
          <p className="font-script text-[var(--da-leaf)] text-2xl">{content.testimonials.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl mt-1">{content.testimonials.title}</h2>
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
            <p className="font-script text-[var(--da-leaf)] text-2xl">{content.blog.eyebrow}</p>
            <h2 className="text-3xl sm:text-4xl mt-1">{content.blog.title}</h2>
          </div>
          <Link to="/blog" className="link-underline text-sm tracking-[0.2em] uppercase font-body text-[var(--da-forest)]">
            {content.blog.linkText}
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
