import React, { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, ExternalLink } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { ROLES, adminNotifications } from "../data/mockAdmin";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Topbar = () => {
  const { me, role, switchRole } = useAdmin();
  const [showRoles, setShowRoles] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const unread = adminNotifications.filter((n) => !n.read).length;
  const currentRole = ROLES.find((r) => r.id === role);

  const onSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    toast(`Pesquisa: ${search}`, { description: "Demonstração — pesquisa global ligada a mock data." });
  };

  return (
    <header className="bg-white border-b hairline px-6 lg:px-8 py-3 flex items-center gap-4 sticky top-0 z-30" data-testid="admin-topbar">
      <form onSubmit={onSearch} className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--da-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar pedidos, produtos, clientes..."
          data-testid="admin-search"
          className="w-full pl-10 pr-4 py-2 rounded-full bg-[var(--da-cream-2)]/60 font-body text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--da-leaf)] placeholder:text-[var(--da-muted)]"
        />
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* role switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowRoles(!showRoles); setShowNotif(false); setShowUser(false); }}
            data-testid="role-switcher-btn"
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full border hairline font-body text-xs hover:bg-[var(--da-cream-2)]/60"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentRole?.color }} />
            <span className="text-[var(--da-forest)]">Ver como:</span>
            <span className="font-semibold">{currentRole?.label}</span>
            <ChevronDown size={12} />
          </button>
          {showRoles && (
            <div className="absolute right-0 mt-2 w-56 bg-white border hairline rounded-xl shadow-lg p-2 z-40" data-testid="role-switcher-menu">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--da-muted)] px-3 py-2">Pré-visualizar como</p>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { switchRole(r.id); setShowRoles(false); toast(`Vista do papel: ${r.label}`); }}
                  data-testid={`role-option-${r.id}`}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm flex items-center gap-2 hover:bg-[var(--da-cream-2)]/60 ${role === r.id ? "bg-[var(--da-cream-2)]/60 font-semibold" : ""}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowRoles(false); setShowUser(false); }}
            data-testid="notifications-btn"
            className="relative w-9 h-9 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center text-[var(--da-forest)]"
            aria-label="Notificações"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--da-leaf)]" />
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border hairline rounded-xl shadow-lg z-40 overflow-hidden" data-testid="notifications-menu">
              <div className="p-3 border-b hairline flex items-center justify-between">
                <p className="font-serif-display text-sm tracking-[0.1em] text-[var(--da-forest)]">NOTIFICAÇÕES</p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--da-leaf)]">{unread} novas</span>
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {adminNotifications.map((n) => (
                  <li key={n.id} className={`px-4 py-3 border-b hairline last:border-b-0 ${!n.read ? "bg-[var(--da-cream-2)]/30" : ""}`}>
                    <p className="font-body text-sm">{n.title}</p>
                    <p className="font-body text-[11px] text-[var(--da-muted)] mt-0.5">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* user menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowRoles(false); setShowNotif(false); }}
            data-testid="user-menu-btn"
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-[var(--da-cream-2)]/60"
          >
            <span className="w-9 h-9 rounded-full bg-[var(--da-leaf)] text-white flex items-center justify-center font-serif-display tracking-[0.06em] text-sm">
              {me.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
            <span className="hidden lg:block text-left">
              <span className="block font-body text-sm font-semibold text-[var(--da-forest)] leading-tight">{me.name}</span>
              <span
                data-testid="user-role-badge"
                className="inline-block mt-0.5 text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${currentRole?.color}22`, color: currentRole?.color }}
              >
                {me.roleLabel}
              </span>
            </span>
            <ChevronDown size={12} className="hidden lg:block text-[var(--da-muted)]" />
          </button>
          {showUser && (
            <div className="absolute right-0 mt-2 w-56 bg-white border hairline rounded-xl shadow-lg p-2 z-40" data-testid="user-menu">
              <div className="px-3 py-2 border-b hairline">
                <p className="font-body text-sm font-semibold">{me.name}</p>
                <p className="font-body text-[11px] text-[var(--da-muted)]">{me.email}</p>
              </div>
              <button onClick={() => { navigate("/"); }} className="w-full text-left px-3 py-2 rounded-lg font-body text-sm hover:bg-[var(--da-cream-2)]/60 flex items-center gap-2">
                <ExternalLink size={14} /> Ver loja pública
              </button>
              <button onClick={() => { toast("Sessão terminada"); navigate("/"); }} data-testid="topbar-logout" className="w-full text-left px-3 py-2 rounded-lg font-body text-sm hover:bg-[var(--da-cream-2)]/60 flex items-center gap-2 text-red-700">
                <LogOut size={14} /> Terminar sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
