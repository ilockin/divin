export const calcCommission = (product, qty = 1) =>
  product.commissionType === "percentage"
    ? (product.price * qty * product.commissionValue) / 100
    : product.commissionValue * qty;

export const formatCommission = (product) =>
  product.commissionType === "percentage" ? `${product.commissionValue}%` : `${product.commissionValue} € / unid.`;
