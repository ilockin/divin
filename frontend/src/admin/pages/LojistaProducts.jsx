import React from "react";
import { PageHeader, SectionTitle } from "../components/Bits";

export const LojistaProducts = () => {
  return (
    <div data-testid="lojista-products">
      <PageHeader title="Meus Produtos" subtitle="Produtos do catálogo elegíveis para comissão de afiliado." />
      <div className="bg-white border hairline rounded-2xl p-6">
        <SectionTitle eyebrow="em breve" title="Catálogo com comissão" />
        <p className="font-body text-sm text-[var(--da-muted)]">
          Esta página vai listar os produtos com comissão ativa, o respetivo valor (% ou €) e o link de partilha.
        </p>
      </div>
    </div>
  );
};
