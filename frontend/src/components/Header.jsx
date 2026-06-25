import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "../context/CartContext";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/loja", label: "Loja" },
  { to: "/sobre", label: "Sobre" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" },
];

export const Header = () => {
  const { totals, setDrawerOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    setMobileOpen(false);
    navigate(`/loja?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EC]/95 backdrop-blur border-b hairline" data-testid="site-header">
      {/* announcement strip */}
      <div className="bg-[var(--da-pine)] text-[#F7F4EC] text-[11px] tracking-[0.18em] uppercase py-2 text-center font-body">
        Envios para Portugal • Portes grátis acima de 49&nbsp;€
      </div>

      <div className="container-da flex items-center justify-between gap-6 py-4">
        {/* Mobile menu */}
        <button
          aria-label="Abrir menu"
          data-testid="mobile-menu-btn"
          className="lg:hidden text-[var(--da-forest)]"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" data-testid="header-logo-link" className="shrink-0">
          <Logo size="md" />
        </Link>

        <nav className="hidden lg:flex items-center gap-9 font-body text-[12px] tracking-[0.22em] uppercase">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.label.toLowerCase()}`}
              end={item.to === "/"}
              className={({ isActive }) =>
                `link-underline ${isActive ? "text-[var(--da-leaf)]" : "text-[var(--da-forest)]"} hover:text-[var(--da-leaf)] transition-colors`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-[var(--da-forest)]">
          <button
            aria-label="Pesquisar"
            data-testid="header-search-btn"
            onClick={() => setSearchOpen((v) => !v)}
            className="hover:text-[var(--da-leaf)] transition"
          >
            <Search size={20} />
          </button>
          <Link to="/conta/login" data-testid="header-account-link" aria-label="Conta" className="hover:text-[var(--da-leaf)] transition hidden sm:block">
            <User size={20} />
          </Link>
          <button
            aria-label="Carrinho"
            data-testid="header-cart-btn"
            onClick={() => setDrawerOpen(true)}
            className="relative hover:text-[var(--da-leaf)] transition"
          >
            <ShoppingBag size={20} />
            {totals.count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-2 -right-2 bg-[var(--da-leaf)] text-white text-[10px] font-semibold w-[18px] h-[18px] rounded-full flex items-center justify-center"
              >
                {totals.count}
              </span>
            )}
          </button>
          <span className="hidden md:inline text-[11px] tracking-[0.2em] font-body text-[var(--da-pine)] border-l hairline pl-4">
            EUR / PT
          </span>
        </div>
      </div>

      {/* search */}
      {searchOpen && (
        <div className="border-t hairline bg-white" data-testid="header-search-panel">
          <form onSubmit={submitSearch} className="container-da py-4 flex gap-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar produtos, categorias, ingredientes..."
              data-testid="header-search-input"
              className="flex-1 bg-transparent border-b hairline outline-none py-2 font-body text-sm placeholder:text-[var(--da-muted)]"
            />
            <button type="submit" className="btn-da btn-da-primary" data-testid="header-search-submit">Procurar</button>
          </form>
        </div>
      )}

      {/* mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t hairline bg-[#F7F4EC]" data-testid="mobile-nav">
          <div className="container-da py-4 flex flex-col gap-3 font-body text-sm uppercase tracking-[0.2em]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-2 ${isActive ? "text-[var(--da-leaf)]" : "text-[var(--da-forest)]"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/conta/login" onClick={() => setMobileOpen(false)} className="py-2 text-[var(--da-forest)]">
              Conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
