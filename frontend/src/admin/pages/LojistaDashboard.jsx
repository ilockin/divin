import React from "react";
import { PageHeader, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";

export const LojistaDashboard = () => {
  const { me } = useAdmin();

  return (
    <div data-testid="lojista-dashboard">
      <PageHeader title="Dashboard" subtitle={`Visão geral das tuas vendas como afiliado, ${me.name}.`} />
      <div className="bg-white border hairline rounded-2xl p-6">
        <SectionTitle eyebrow="em breve" title="KPIs e vendas do afiliado" />
        <p className="font-body text-sm text-[var(--da-muted)]">
          Esta página vai mostrar a receita gerada pelo teu link, número de vendas e comissão acumulada.
        </p>
      </div>
    </div>
  );
};
