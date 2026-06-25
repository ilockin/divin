import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { products, categories } from "../data/mock";
import { ChevronDown } from "lucide-react";

const SKIN = [
  { id: "todos", label: "Todos os tipos" },
  { id: "sensivel", label: "Sensível" },
  { id: "seca", label: "Seca" },
];
const PURPOSES = [
  "relaxamento", "foco", "hidratacao", "calmante", "luminosidade", "nutricao", "reparacao", "respiracao", "conforto", "tonificante", "renovacao", "limpeza", "fortalecimento", "ambiente",
];
const PURPOSE_LABEL = {
  relaxamento: "Relaxamento", foco: "Foco", hidratacao: "Hidratação", calmante: "Calmante",
  luminosidade: "Luminosidade", nutricao: "Nutrição", reparacao: "Reparação", respiracao: "Respiração",
  conforto: "Conforto", tonificante: "Tonificante", renovacao: "Renovação", limpeza: "Limpeza",
  fortalecimento: "Fortalecimento", ambiente: "Ambiente",
};
const SORTS = [
  { id: "novidades", label: "Novidades" },
  { id: "preco-asc", label: "Preço: do mais baixo" },
  { id: "preco-desc", label: "Preço: do mais alto" },
  { id: "popularidade", label: "Popularidade" },
];
const PAGE_SIZE = 8;

export const Shop = () => {
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get("categoria") || "";
  const subcatParam = params.get("sub") || "";
  const queryParam = params.get("q") || "";
  const [sort, setSort] = useState("novidades");
  const [skin, setSkin] = useState("");
  const [purpose, setPurpose] = useState("");
  const [veganOnly, setVeganOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [categoryParam, subcatParam, queryParam, skin, purpose, veganOnly, sort]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryParam) list = list.filter((p) => p.category === categoryParam);
    if (subcatParam) list = list.filter((p) => p.sub === subcatParam);
    if (queryParam) {
      const q = queryParam.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.short, p.description].join(" ").toLowerCase().includes(q)
      );
    }
    if (skin) list = list.filter((p) => p.skinType.includes(skin));
    if (purpose) list = list.filter((p) => p.purpose.includes(purpose));
    if (veganOnly) list = list.filter((p) => p.vegan);

    if (sort === "preco-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "preco-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "novidades") list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [categoryParam, subcatParam, queryParam, skin, purpose, veganOnly, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("categoria", slug); else next.delete("categoria");
    next.delete("sub");
    setParams(next, { replace: true });
  };

  const setSub = (cat, sub) => {
    const next = new URLSearchParams(params);
    next.set("categoria", cat); next.set("sub", sub);
    setParams(next, { replace: true });
  };

  return (
    <div className="container-da py-12" data-testid="shop-page">
      {/* breadcrumb */}
      <nav className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] mb-6">
        <Link to="/" className="hover:text-[var(--da-leaf)]">Início</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--da-forest)]">Loja</span>
      </nav>

      <header className="mb-10">
        <p className="font-script text-[var(--da-leaf)] text-2xl">a nossa coleção</p>
        <h1 className="text-4xl sm:text-5xl mt-1">Loja</h1>
        {queryParam && (
          <p className="font-body text-sm text-[var(--da-muted)] mt-3">
            Resultados para: <span className="font-semibold text-[var(--da-forest)]">“{queryParam}”</span>
          </p>
        )}
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* sidebar */}
        <aside className="space-y-8" data-testid="shop-sidebar">
          <div>
            <h4 className="text-xs tracking-[0.22em] uppercase text-[var(--da-forest)] mb-4">Categorias</h4>
            <button
              onClick={() => setCategory("")}
              data-testid="cat-todas"
              className={`block w-full text-left py-1.5 font-body text-sm ${!categoryParam ? "text-[var(--da-leaf)] font-semibold" : "text-[var(--da-ink)]"}`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <div key={cat.slug} className="mt-1">
                <button
                  onClick={() => setCategory(cat.slug)}
                  data-testid={`cat-${cat.slug}`}
                  className={`flex items-center justify-between w-full text-left py-1.5 font-body text-sm ${categoryParam === cat.slug ? "text-[var(--da-leaf)] font-semibold" : "text-[var(--da-ink)]"}`}
                >
                  {cat.name}
                  <ChevronDown size={14} className={`transition-transform ${categoryParam === cat.slug ? "rotate-180" : ""}`} />
                </button>
                {categoryParam === cat.slug && (
                  <div className="pl-3 border-l hairline ml-1 mt-1 space-y-1.5">
                    {cat.subcategories.map((s) => (
                      <button
                        key={s.slug}
                        onClick={() => setSub(cat.slug, s.slug)}
                        data-testid={`sub-${s.slug}`}
                        className={`block text-left font-body text-xs py-0.5 ${subcatParam === s.slug ? "text-[var(--da-leaf)] font-semibold" : "text-[var(--da-muted)] hover:text-[var(--da-forest)]"}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs tracking-[0.22em] uppercase text-[var(--da-forest)] mb-4">Tipo de pele</h4>
            <div className="space-y-2">
              {SKIN.map((s) => (
                <label key={s.id} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                  <input type="radio" name="skin" checked={skin === s.id} onChange={() => setSkin(s.id)} data-testid={`skin-${s.id}`} />
                  {s.label}
                </label>
              ))}
              <button onClick={() => setSkin("")} className="text-xs text-[var(--da-muted)] underline">Limpar</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.22em] uppercase text-[var(--da-forest)] mb-4">Finalidade</h4>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(purpose === p ? "" : p)}
                  data-testid={`purpose-${p}`}
                  className={`text-[11px] tracking-[0.1em] uppercase font-body px-3 py-1 rounded-full border transition ${
                    purpose === p ? "bg-[var(--da-forest)] text-white border-[var(--da-forest)]" : "border-[var(--da-line)] text-[var(--da-forest)] hover:border-[var(--da-forest)]"
                  }`}
                >
                  {PURPOSE_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
              <input type="checkbox" checked={veganOnly} onChange={(e) => setVeganOnly(e.target.checked)} data-testid="filter-vegan" />
              Apenas vegano
            </label>
          </div>
        </aside>

        {/* grid */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="font-body text-sm text-[var(--da-muted)]" data-testid="results-count">
              {filtered.length} produto{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-[var(--da-muted)]">Ordenar</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                data-testid="shop-sort"
                className="font-body text-sm bg-transparent border-b hairline pb-1 focus:outline-none"
              >
                {SORTS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </div>
          </div>

          {paged.length === 0 ? (
            <div className="py-24 text-center font-body text-sm text-[var(--da-muted)] border-y hairline">
              <p>Nenhum produto encontrado com estes filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8" data-testid="shop-grid">
              {paged.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-12" data-testid="pagination">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  data-testid={`page-${i + 1}`}
                  className={`w-9 h-9 rounded-full font-body text-sm border transition ${
                    page === i + 1 ? "bg-[var(--da-forest)] text-white border-[var(--da-forest)]" : "border-[var(--da-line)] text-[var(--da-forest)] hover:border-[var(--da-forest)]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
