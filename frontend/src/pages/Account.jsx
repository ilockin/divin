import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, User, Package, MapPin } from "lucide-react";
import { demoUser } from "../data/mock";
import { toast } from "sonner";

const links = [
  { to: "/conta", label: "Visão geral", end: true, icon: User },
  { to: "/conta/encomendas", label: "Os meus pedidos", icon: Package },
  { to: "/conta/perfil", label: "Perfil", icon: User },
  { to: "/conta/moradas", label: "Moradas", icon: MapPin },
];

export const AccountLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="container-da py-12" data-testid="account-layout">
      <p className="font-script text-[var(--da-leaf)] text-2xl">olá, {demoUser.name.split(" ")[0].toLowerCase()}</p>
      <h1 className="text-3xl sm:text-4xl mt-1">A tua conta</h1>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10 mt-10">
        <aside className="space-y-1" data-testid="account-sidebar">
          {links.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`acc-link-${label.toLowerCase().replace(/ /g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition ${
                  isActive ? "bg-[var(--da-forest)] text-white" : "text-[var(--da-forest)] hover:bg-[var(--da-cream-2)]"
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          <button
            onClick={() => { toast("Sessão terminada"); navigate("/"); }}
            data-testid="acc-logout"
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm text-[var(--da-muted)] hover:bg-[var(--da-cream-2)] w-full"
          >
            <LogOut size={16} /> Terminar sessão
          </button>
        </aside>

        <section className="bg-white rounded-2xl border hairline p-6 sm:p-8">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export const AccountOverview = () => (
  <div data-testid="account-overview">
    <h2 className="text-2xl">Olá, {demoUser.name} 👋</h2>
    <p className="font-body text-sm text-[var(--da-muted)] mt-2">
      Aqui podes acompanhar as tuas encomendas, atualizar os teus dados e gerir as moradas de envio.
    </p>
    <div className="grid sm:grid-cols-3 gap-4 mt-8">
      <Stat label="Encomendas" value={demoUser.orders.length} />
      <Stat label="Moradas" value={demoUser.addresses.length} />
      <Stat label="Pontos de cuidado" value="120" />
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-[var(--da-cream-2)]/60 rounded-xl p-5">
    <p className="font-serif-display text-3xl text-[var(--da-forest)]">{value}</p>
    <p className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-muted)] mt-1">{label}</p>
  </div>
);
