export const formatEUR = (value) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
