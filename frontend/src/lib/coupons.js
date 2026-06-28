import { products as catalogProducts } from "../data/mock";

export const validateCoupon = (coupon, { subtotal, items = [] }) => {
  if (!coupon.active) return { ok: false, reason: "Este cupão não está ativo." };
  const today = new Date().toISOString().slice(0, 10);
  if (coupon.validFrom && today < coupon.validFrom) return { ok: false, reason: "Este cupão ainda não é válido." };
  if (coupon.validUntil && today > coupon.validUntil) return { ok: false, reason: "Este cupão expirou." };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return { ok: false, reason: "Este cupão atingiu o limite de utilizações." };
  if (coupon.minOrder > 0 && subtotal < coupon.minOrder) return { ok: false, reason: `Encomenda mínima de ${coupon.minOrder} € para usar este cupão.` };

  if (coupon.scope === "category") {
    const itemCategories = items.map((i) => catalogProducts.find((p) => p.id === i.id)?.category);
    if (!itemCategories.some((c) => coupon.scopeIds.includes(c))) {
      return { ok: false, reason: "Este cupão não se aplica aos produtos no carrinho." };
    }
  }
  if (coupon.scope === "product" && !items.some((i) => coupon.scopeIds.includes(i.id))) {
    return { ok: false, reason: "Este cupão não se aplica aos produtos no carrinho." };
  }

  return { ok: true };
};

export const couponToPromo = (coupon) => ({
  code: coupon.code,
  type: coupon.type === "percentage" ? "percent" : "amount",
  value: coupon.type === "percentage" ? coupon.value / 100 : coupon.value,
  label: `Cupão ${coupon.code}`,
});
