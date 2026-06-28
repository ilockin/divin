import React, { useState } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Tags, SlidersHorizontal,
  Boxes, ShoppingCart, FileText, Settings, ChevronLeft, ChevronRight,
  FlaskConical, ClipboardList, Factory,
  PieChart, Receipt, Percent, Truck, LayoutPanelTop, Link2,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { can } from "../data/mockAdmin";
import { Topbar } from "./Topbar";
import { Breadcrumbs } from "./Breadcrumbs";
import { Toaster } from "sonner";

const navGroups = [
  {
    title: "Visão geral",
    items: [{ id: "dashboard", to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    title: "Painel Lojista",
    items: [
      { id: "lojista_dashboard", to: "/admin/lojista", label: "Dashboard", icon: LayoutDashboard, end: true },
      { id: "lojista_products", to: "/admin/lojista/produtos", label: "Meus Produtos", icon: Package },
      { id: "lojista_sales", to: "/admin/lojista/vendas", label: "Minhas Vendas", icon: Receipt },
      { id: "lojista_links", to: "/admin/lojista/links", label: "Meus Links", icon: Link2 },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { id: "products", to: "/admin/produtos", label: "Produtos", icon: Package },
      { id: "categories", to: "/admin/categorias", label: "Categorias", icon: Tags },
      { id: "attributes", to: "/admin/atributos", label: "Atributos & Filtros", icon: SlidersHorizontal },
      { id: "stock", to: "/admin/stock", label: "Stock", icon: Boxes },
    ],
  },
  {
    title: "Produção",
    items: [
      { id: "insumos", to: "/admin/insumos", label: "Insumos", icon: FlaskConical },
      { id: "recipes", to: "/admin/fichas-tecnicas", label: "Ficha Técnica", icon: ClipboardList },
      { id: "production", to: "/admin/ordens-producao", label: "Ordens de Produção", icon: Factory },
    ],
  },
  {
    title: "Comercial",
    items: [
      { id: "orders", to: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { id: "shipping", to: "/admin/envios", label: "Gestão de Envios", icon: Truck },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { id: "fin_overview", to: "/admin/financeiro", label: "Visão Geral", icon: PieChart, end: true },
      { id: "fin_purchases", to: "/admin/financeiro/compras", label: "Compras", icon: Receipt },
      { id: "fin_margins", to: "/admin/financeiro/margens", label: "Margens", icon: Percent },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { id: "blog", to: "/admin/blog", label: "Blog / Artigos", icon: FileText },
      { id: "pages", to: "/admin/paginas", label: "Construtor de Páginas", icon: LayoutPanelTop },
    ],
  },
  {
    title: "Administração",
    items: [
      { id: "users", to: "/admin/utilizadores", label: "Utilizadores", icon: Users },
      { id: "settings", to: "/admin/definicoes", label: "Definições", icon: Settings },
    ],
  },
];

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAdmin();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[#F1ECDF]" data-testid="admin-layout" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* SIDEBAR */}
      <aside
        data-testid="admin-sidebar"
        className={`bg-[var(--da-forest)] text-[#F7F4EC] flex flex-col transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"} sticky top-0 h-screen`}
      >
        {/* logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
            <svg width="22" height="16" viewBox="0 0 32 22">
              <path d="M16 21 C5 21, 1 11, 16 1 C 16 9, 16 17, 16 21Z" fill="#2E9E44" />
              <path d="M16 21 C27 21, 31 11, 16 1 C 16 9, 16 17, 16 21Z" fill="#F7F4EC" opacity="0.85" />
            </svg>
            {!collapsed && (
              <div className="leading-none">
                <p className="font-serif-display tracking-[0.22em] text-sm text-[#F7F4EC]">DIVINARTE</p>
                <p className="font-body text-[9px] tracking-[0.28em] uppercase mt-1 text-white/55">Admin</p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} aria-label="Recolher sidebar" data-testid="sidebar-collapse" className="text-white/60 hover:text-white">
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} data-testid="sidebar-expand" aria-label="Expandir sidebar" className="m-3 mb-0 self-center text-white/60 hover:text-white">
            <ChevronRight size={16} />
          </button>
        )}

        {/* nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6" data-testid="admin-nav">
          {navGroups.map((group) => {
            const items = group.items.filter((it) => can(role, it.id));
            if (items.length === 0) return null;
            return (
              <div key={group.title}>
                {!collapsed && (
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/40 px-3 mb-2">{group.title}</p>
                )}
                <ul className="space-y-1">
                  {items.map(({ id, to, label, icon: Icon, end }) => (
                    <li key={id}>
                      <NavLink
                        to={to}
                        end={end}
                        data-testid={`nav-${id}`}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                            isActive
                              ? "bg-[var(--da-leaf)] text-white"
                              : "text-white/75 hover:bg-white/10 hover:text-white"
                          } ${collapsed ? "justify-center" : ""}`
                        }
                        title={collapsed ? label : undefined}
                      >
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && <span>{label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* footer link to storefront */}
        <div className="p-3 border-t border-white/10">
          <Link
            to="/"
            data-testid="goto-storefront"
            className={`block font-body text-[11px] uppercase tracking-[0.2em] text-white/55 hover:text-white text-center py-2 ${collapsed ? "px-0" : ""}`}
            title="Ver loja"
          >
            {collapsed ? "↗" : "Ver loja pública ↗"}
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <Breadcrumbs />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden" data-testid="admin-main" key={location.pathname}>
          <Outlet />
        </main>
      </div>

      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "Montserrat, sans-serif" } }} />
    </div>
  );
};
