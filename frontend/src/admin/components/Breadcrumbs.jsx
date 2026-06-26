import React from "react";
import { Link, useLocation, useMatch } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const LABELS = {
  admin: "Admin",
  produtos: "Produtos",
  categorias: "Categorias",
  atributos: "Atributos & Filtros",
  stock: "Stock",
  insumos: "Insumos",
  "fichas-tecnicas": "Ficha Técnica",
  "ordens-producao": "Ordens de Produção",
  financeiro: "Financeiro",
  compras: "Compras",
  margens: "Margens",
  pedidos: "Pedidos",
  envios: "Gestão de Envios",
  blog: "Blog / Artigos",
  paginas: "Construtor de Páginas",
  utilizadores: "Utilizadores",
  definicoes: "Definições",
  novo: "Novo",
  editar: "Editar",
};

const labelFor = (segment, idx) => {
  if (LABELS[segment]) return LABELS[segment];
  // for ids / slugs, capitalize a friendly version
  if (segment.startsWith("DA-")) return segment;
  if (segment.length > 20) return segment.slice(0, 20) + "…";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

export const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0 || parts[0] !== "admin") return null;

  const crumbs = parts.map((part, i) => ({
    label: labelFor(part, i),
    href: "/" + parts.slice(0, i + 1).join("/"),
    last: i === parts.length - 1,
  }));

  return (
    <nav className="bg-white px-6 lg:px-8 py-3 border-b hairline" data-testid="admin-breadcrumbs">
      <ol className="flex items-center gap-2 font-body text-xs text-[var(--da-muted)]">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} />}
            {c.last ? (
              <span className="text-[var(--da-forest)] font-semibold">{c.label}</span>
            ) : (
              <Link to={c.href} className="hover:text-[var(--da-leaf)]">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
