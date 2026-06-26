import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { DataTable, StatusBadge } from "../components/DataTable";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { recipeCost } from "../data/mockErp";
import { formatEUR } from "../../lib/format";

const LOW_MARGIN = 20; // % abaixo do qual a margem é assinalada

export const Margens = () => {
  const { products, recipes, insumos } = useAdmin();

  const rows = useMemo(() => products.map((p) => {
    const recipe = recipes[p.id];
    const custo = recipeCost(recipe, insumos);
    const margemEur = recipe ? p.price - custo : null;
    const margemPct = recipe && p.price ? (margemEur / p.price) * 100 : null;
    return { id: p.id, name: p.name, price: p.price, hasRecipe: !!recipe, custo, margemEur, margemPct };
  }), [products, recipes, insumos]);

  const columns = [
    { key: "name", label: "Produto", sortable: true,
      render: (r) => <Link to={`/admin/produtos/${r.id}`} className="font-semibold text-[var(--da-forest)] hover:text-[var(--da-leaf)]">{r.name}</Link> },
    { key: "custo", label: "Custo de produção", sortable: true,
      render: (r) => r.hasRecipe ? formatEUR(r.custo) : <span className="text-[var(--da-muted)]">—</span> },
    { key: "price", label: "Preço de venda", sortable: true,
      render: (r) => formatEUR(r.price) },
    { key: "margemEur", label: "Margem (€)", sortable: true,
      render: (r) => r.hasRecipe
        ? <span className={r.margemPct < LOW_MARGIN ? "text-red-700 font-semibold" : ""}>{formatEUR(r.margemEur)}</span>
        : <span className="text-[var(--da-muted)]">—</span> },
    { key: "margemPct", label: "Margem (%)", sortable: true,
      render: (r) => {
        if (!r.hasRecipe) return <StatusBadge tone="muted">Sem ficha</StatusBadge>;
        return <StatusBadge tone={r.margemPct < LOW_MARGIN ? "red" : "green"}>{r.margemPct.toFixed(1)}%</StatusBadge>;
      } },
  ];

  return (
    <div data-testid="admin-margens">
      <PageHeader
        title="Margens"
        subtitle="Margem por produto, a partir do custo da ficha técnica e do preço de venda."
      />

      <div className="mb-5 bg-[var(--da-cream-2)]/50 border hairline rounded-2xl px-5 py-3 font-body text-[13px] text-[var(--da-muted)]">
        As margens abaixo de {LOW_MARGIN}% são assinaladas a vermelho. Produtos sem ficha técnica não têm custo de produção calculado.
      </div>

      <DataTable
        testid="margens-table"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchKeys={["name"]}
        pageSize={12}
      />
    </div>
  );
};
