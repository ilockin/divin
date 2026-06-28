import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { adminCategories } from "../data/mockAdmin";
import { formatEUR } from "../../lib/format";
import { formatCommission, calcCommission } from "../../lib/commission";

export const AfiliadoProducts = () => {
  const { products } = useAdmin();

  const eligible = useMemo(
    () => products.filter((p) => p.status === "publicado" && p.commissionValue > 0),
    [products]
  );

  const columns = [
    { key: "image", label: "",
      render: (p) => <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-md bg-[var(--da-cream-2)]" /> },
    { key: "name", label: "Nome", sortable: true,
      render: (p) => (
        <Link to={`/produto/${p.slug}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{p.name}</Link>
      ) },
    { key: "category", label: "Categoria",
      render: (p) => <span className="text-[var(--da-muted)]">{adminCategories.find((c) => c.slug === p.category)?.name || p.category}</span> },
    { key: "price", label: "Preço", sortable: true, render: (p) => formatEUR(p.price) },
    { key: "commissionValue", label: "Comissão", sortable: true, render: (p) => formatCommission(p) },
    { key: "commissionPerUnit", label: "Ganhas por unidade", render: (p) => formatEUR(calcCommission(p, 1)) },
  ];

  return (
    <div data-testid="afiliado-products">
      <PageHeader title="Meus Produtos" subtitle="Produtos do catálogo elegíveis para comissão de afiliado." />
      <DataTable
        testid="afiliado-products-table"
        data={eligible}
        columns={columns}
        getRowId={(p) => p.id}
        searchKeys={["name", "category"]}
        pageSize={10}
        emptyMessage="Sem produtos com comissão ativa."
      />
    </div>
  );
};
