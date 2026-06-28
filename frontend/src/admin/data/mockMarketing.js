// Mock data — cupões de desconto (DivinArte)

export const COUPON_TYPES = [
  { id: "percentage", label: "Percentagem (%)" },
  { id: "fixed", label: "Valor fixo (€)" },
];

export const COUPON_SCOPES = [
  { id: "all", label: "Toda a loja" },
  { id: "category", label: "Categorias específicas" },
  { id: "product", label: "Produtos específicos" },
];

export const initialCoupons = [
  { id: "cp01", code: "BEMVINDA10", type: "percentage", value: 10, minOrder: 0, validFrom: "2025-01-01", validUntil: "2026-12-31", usageLimit: 0, usedCount: 134, active: true, scope: "all", scopeIds: [] },
  { id: "cp02", code: "ENVIOGRATIS", type: "fixed", value: 4.9, minOrder: 30, validFrom: "2025-01-01", validUntil: "2026-12-31", usageLimit: 0, usedCount: 58, active: true, scope: "all", scopeIds: [] },
  { id: "cp03", code: "FACIAL15", type: "percentage", value: 15, minOrder: 0, validFrom: "2025-06-01", validUntil: "2025-12-31", usageLimit: 200, usedCount: 41, active: true, scope: "category", scopeIds: ["faciais"] },
  { id: "cp04", code: "BLACKFRIDAY", type: "percentage", value: 20, minOrder: 25, validFrom: "2025-11-20", validUntil: "2025-11-30", usageLimit: 500, usedCount: 0, active: false, scope: "all", scopeIds: [] },
];
