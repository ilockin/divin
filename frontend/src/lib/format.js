export const formatEUR = (value) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

// Para custos por unidade muito pequenos (ex.: insumos a 0,024 €/ml) — até 3 casas decimais.
export const formatEUR3 = (value) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 3 }).format(value);
