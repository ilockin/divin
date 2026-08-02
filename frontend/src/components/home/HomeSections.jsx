import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Leaf, Heart, BadgeCheck } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { testimonials } from "../../data/mock";
import { loadProducts, loadCategories } from "../../lib/products";
import { loadPublishedArticles } from "../../lib/articles";
import {
  titleClassFor as titleClass, titleStyleFor as titleStyle, buttonStyleFor as buttonStyle,
  eyebrowClassFor as eyebrowClass, eyebrowStyleFor as eyebrowStyle,
  bodyClassFor as bodyClass, bodyStyleFor as bodyStyle,
  itemClassFor as itemClass, itemStyleFor as itemStyle,
} from "../../lib/contentStyle";

const TRUST_ICONS = [Leaf, Heart, Sparkles, BadgeCheck];

export const HeroSection = ({ content }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={content.image} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
    </div>
    <div className="relative container-da py-32 sm:py-40 lg:py-52">
      <div className="max-w-xl">
        <p className={`${eyebrowClass(content)} mb-3`} style={eyebrowStyle(content)}>{content.eyebrow}</p>
        <h1 className={`${titleClass(content)} leading-[1.05]`} style={titleStyle(content)}>
          {content.titleLine1}<br />{content.titleLine2}
        </h1>
        <p className={`${bodyClass(content)} mt-6 max-w-md leading-relaxed`} style={bodyStyle(content)}>
          {content.subtitle}
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to={content.ctaShopLink} className="btn-da btn-da-primary" style={buttonStyle(content, "ctaShop")} data-testid="hero-shop-btn">
            {content.ctaShopText} <ArrowRight size={16} />
          </Link>
          <Link to={content.ctaAboutLink} className="btn-da btn-da-outline text-[#F7F4EC] border-[#F7F4EC] hover:bg-[#F7F4EC] hover:text-[var(--da-forest)]" style={buttonStyle(content, "ctaAbout")} data-testid="hero-about-btn">
            {content.ctaAboutText}
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export const TrustSection = ({ content }) => (
  <section className="bg-[var(--da-cream-2)] border-y hairline">
    <div className="container-da grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
      {content.labels.map((label, i) => {
        const Icon = TRUST_ICONS[i] || Leaf;
        return (
          <div key={label} className="flex items-center gap-3 justify-center">
            <Icon size={22} className="text-[var(--da-leaf)]" />
            <span className={`${itemClass(content)} tracking-[0.18em] uppercase`} style={itemStyle(content)}>{label}</span>
          </div>
        );
      })}
    </div>
  </section>
);

export const FeaturedSection = ({ content }) => {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    loadProducts().then((all) => setFeatured(all.filter((p) => p.isNew).slice(0, 4))).catch(() => {});
  }, []);
  return (
    <section className="container-da py-24">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
          <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
        </div>
        <Link to={content.linkHref} className="link-underline text-sm tracking-[0.2em] uppercase font-body text-[var(--da-forest)]">
          {content.linkText}
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
        {featured.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export const CategoriesSection = ({ content }) => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    loadCategories().then(setCategories).catch(() => {});
  }, []);
  return (
  <section className="container-da pb-24">
    <div className="text-center mb-12">
      <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
      <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
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
  );
};

export const StorySection = ({ content }) => (
  <section className="bg-[var(--da-pine)] text-white">
    <div className="container-da py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div className="aspect-square rounded-2xl overflow-hidden">
        <img src={content.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className={`${eyebrowClass(content)} mb-3`} style={eyebrowStyle(content)}>{content.eyebrow}</p>
        <h2 className={`${titleClass(content)} leading-[1.1]`} style={titleStyle(content)}>
          {content.title}
        </h2>
        <p className={`${bodyClass(content)} mt-6 leading-relaxed`} style={bodyStyle(content)}>
          {content.paragraph}
        </p>
        <ul className="mt-8 space-y-3">
          {content.bullets.map((bullet, i) => (
            <li key={i} className={`leaf-bullet ${itemClass(content)}`} style={itemStyle(content)}>{bullet}</li>
          ))}
        </ul>
        <Link to={content.ctaLink} className="btn-da btn-da-outline mt-8 text-[#F7F4EC] border-[#F7F4EC] hover:bg-[#F7F4EC] hover:text-[var(--da-forest)]" style={buttonStyle(content, "cta")} data-testid="home-story-cta">
          {content.ctaText}
        </Link>
      </div>
    </div>
  </section>
);

export const TestimonialsSection = ({ content }) => (
  <section className="container-da py-24">
    <div className="text-center mb-12">
      <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
      <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
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
);

export const BlogSection = ({ content }) => {
  const [posts, setPosts] = useState([]);
  useEffect(() => { loadPublishedArticles().then((all) => setPosts(all.slice(0, 3))).catch(() => {}); }, []);
  return (
  <section className="container-da pb-24">
    <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
      <div>
        <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
        <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
      </div>
      <Link to={content.linkHref} className="link-underline text-sm tracking-[0.2em] uppercase font-body text-[var(--da-forest)]">
        {content.linkText}
      </Link>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {posts.map((post) => (
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
  );
};

export const HOME_SECTIONS = [
  { key: "hero", label: "Hero", Component: HeroSection },
  { key: "trust", label: "Selos de confiança", Component: TrustSection },
  { key: "featured", label: "Produtos em destaque", Component: FeaturedSection },
  { key: "categories", label: "Categorias", Component: CategoriesSection },
  { key: "story", label: "História", Component: StorySection },
  { key: "testimonials", label: "Depoimentos", Component: TestimonialsSection },
  { key: "blog", label: "Teaser do blog", Component: BlogSection },
];
