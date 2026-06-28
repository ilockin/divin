import React from "react";
import { PageHeader, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";

export const LojistaLinks = () => {
  const { me } = useAdmin();

  return (
    <div data-testid="lojista-links">
      <PageHeader title="Meus Links" subtitle="Links de afiliado para partilhar com os teus clientes." />
      <div className="bg-white border hairline rounded-2xl p-6">
        <SectionTitle eyebrow="em breve" title="Gerador de links por produto" />
        <p className="font-body text-sm text-[var(--da-muted)]">
          Esta página vai listar cada produto com um botão para copiar o link com o teu código (<strong>{me.email}</strong>).
        </p>
      </div>
    </div>
  );
};
