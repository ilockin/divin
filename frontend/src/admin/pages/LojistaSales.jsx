import React from "react";
import { PageHeader, SectionTitle } from "../components/Bits";

export const LojistaSales = () => {
  return (
    <div data-testid="lojista-sales">
      <PageHeader title="Minhas Vendas" subtitle="Encomendas atribuídas ao teu link de afiliado." />
      <div className="bg-white border hairline rounded-2xl p-6">
        <SectionTitle eyebrow="em breve" title="Vendas e comissão por encomenda" />
        <p className="font-body text-sm text-[var(--da-muted)]">
          Esta página vai listar as encomendas com o teu código de afiliado e a comissão calculada por linha.
        </p>
      </div>
    </div>
  );
};
