// Admin-side mock data for DivinArte back-office
// Frontend-only, all in PT-PT, with EUR amounts.
import { products as catalogProducts, categories as catalogCategories, blogPosts } from "../../data/mock";

// ---------- Roles & permissions ----------
export const ROLES = [
  { id: "super_admin", label: "Super Admin", color: "#2E9E44" },
  { id: "admin", label: "Admin", color: "#14532D" },
  { id: "producao", label: "Produção", color: "#B7BD53" },
  { id: "lojista", label: "Lojista", color: "#2C4A3B" },
];

// nav id -> allowed roles
export const NAV_PERMISSIONS = {
  dashboard: ["super_admin", "admin", "producao", "lojista"],
  users: ["super_admin", "admin"],
  products: ["super_admin", "admin", "producao", "lojista"],
  categories: ["super_admin", "admin", "producao"],
  attributes: ["super_admin", "admin", "producao"],
  stock: ["super_admin", "admin", "producao"],
  insumos: ["super_admin", "admin", "producao"],
  recipes: ["super_admin", "admin", "producao"],
  production: ["super_admin", "admin", "producao"],
  orders: ["super_admin", "admin", "lojista"],
  shipping: ["super_admin", "admin"],
  fin_overview: ["super_admin", "admin"],
  fin_purchases: ["super_admin", "admin"],
  fin_margins: ["super_admin", "admin"],
  blog: ["super_admin", "admin"],
  pages: ["super_admin", "admin"],
  settings: ["super_admin"],
};

export const can = (role, navId) => (NAV_PERMISSIONS[navId] || []).includes(role);

// ---------- Users ----------
export const adminUsers = [
  { id: "u01", name: "Ana Lopes", email: "ana.lopes@divinarte.pt", role: "super_admin", active: true, createdAt: "2024-08-12" },
  { id: "u02", name: "Pedro Sousa", email: "pedro.sousa@divinarte.pt", role: "admin", active: true, createdAt: "2024-09-21" },
  { id: "u03", name: "Mariana Faria", email: "mariana.faria@divinarte.pt", role: "producao", active: true, createdAt: "2024-10-02" },
  { id: "u04", name: "André Cardoso", email: "andre.cardoso@parceiro.pt", role: "lojista", active: true, createdAt: "2024-11-08" },
  { id: "u05", name: "Sofia Mendes", email: "sofia.mendes@divinarte.pt", role: "producao", active: false, createdAt: "2025-01-15" },
  { id: "u06", name: "Rita Pereira", email: "rita.pereira@example.pt", role: "cliente", active: true, createdAt: "2025-02-20" },
  { id: "u07", name: "Hugo Martins", email: "hugo.martins@example.pt", role: "cliente", active: true, createdAt: "2025-03-04" },
  { id: "u08", name: "Inês Tavares", email: "ines.tavares@divinarte.pt", role: "admin", active: true, createdAt: "2025-04-19" },
  { id: "u09", name: "João Antunes", email: "joao.antunes@parceiro.pt", role: "lojista", active: false, createdAt: "2025-05-30" },
  { id: "u10", name: "Beatriz Santos", email: "beatriz.santos@example.pt", role: "cliente", active: true, createdAt: "2025-07-11" },
];

export const USER_ROLE_OPTIONS = [
  { id: "super_admin", label: "Super Admin" },
  { id: "admin", label: "Admin" },
  { id: "producao", label: "Produção" },
  { id: "lojista", label: "Lojista" },
  { id: "cliente", label: "Cliente" },
];

// ---------- Catalog (extends storefront products with admin fields) ----------
export const adminProducts = catalogProducts.map((p, i) => ({
  ...p,
  stock: [4, 38, 12, 27, 53, 2, 19, 8, 31, 45, 22, 0, 17, 24, 9, 36][i % 16],
  minStock: 5,
  status: i % 7 === 0 ? "rascunho" : "publicado",
}));

export const adminCategories = catalogCategories;

// ---------- Attributes ----------
export const adminAttributes = [
  {
    id: "att-skin", name: "Tipo de pele",
    values: [
      { id: "skin-todos", label: "Todos" },
      { id: "skin-sensivel", label: "Sensível" },
      { id: "skin-seca", label: "Seca" },
      { id: "skin-oleosa", label: "Oleosa" },
      { id: "skin-mista", label: "Mista" },
    ],
  },
  {
    id: "att-finalidade", name: "Finalidade",
    values: [
      { id: "fin-hidratacao", label: "Hidratação" },
      { id: "fin-luminosidade", label: "Luminosidade" },
      { id: "fin-calmante", label: "Calmante" },
      { id: "fin-nutricao", label: "Nutrição" },
      { id: "fin-foco", label: "Foco" },
      { id: "fin-relaxamento", label: "Relaxamento" },
    ],
  },
  {
    id: "att-vegano", name: "Vegano",
    values: [
      { id: "veg-sim", label: "Sim" },
      { id: "veg-nao", label: "Não" },
    ],
  },
  {
    id: "att-bio", name: "BIO",
    values: [
      { id: "bio-sim", label: "Sim" },
      { id: "bio-nao", label: "Não" },
    ],
  },
];

// ---------- Orders ----------
const customers = [
  { name: "Ana Lopes", email: "ana.lopes@example.pt", phone: "+351 912 345 678", address: { line1: "Rua das Camélias, 12", city: "Porto", zip: "4100-100" } },
  { name: "Rita Pereira", email: "rita.pereira@example.pt", phone: "+351 933 111 222", address: { line1: "Av. da Liberdade, 250", city: "Lisboa", zip: "1250-096" } },
  { name: "Hugo Martins", email: "hugo.martins@example.pt", phone: "+351 962 555 444", address: { line1: "R. Camões, 45", city: "Braga", zip: "4700-256" } },
  { name: "Beatriz Santos", email: "beatriz.santos@example.pt", phone: "+351 911 222 333", address: { line1: "Praceta das Tílias, 7", city: "Coimbra", zip: "3000-123" } },
];

const orderItem = (id, qty) => {
  const p = catalogProducts.find((x) => x.id === id);
  return { id: p.id, name: p.name, slug: p.slug, qty, price: p.price, image: p.images[0], size: p.size };
};

export const adminOrders = [
  { id: "DA-2025-0312", date: "2025-11-02T10:24:00", customer: customers[0], items: [orderItem("p01", 1), orderItem("p04", 1), orderItem("p14", 1)], total: 51.4, payment: "pago", paymentMethod: "Cartão", shipping: "entregue", shippingMethod: "Standard" },
  { id: "DA-2025-0311", date: "2025-11-01T14:10:00", customer: customers[1], items: [orderItem("p06", 1), orderItem("p08", 1)], total: 45.9, payment: "pago", paymentMethod: "MB Way", shipping: "em_transito", shippingMethod: "Expresso" },
  { id: "DA-2025-0310", date: "2025-10-30T09:02:00", customer: customers[2], items: [orderItem("p02", 2)], total: 37.8, payment: "pago", paymentMethod: "Multibanco", shipping: "preparacao", shippingMethod: "Standard" },
  { id: "DA-2025-0309", date: "2025-10-29T18:45:00", customer: customers[3], items: [orderItem("p09", 1), orderItem("p10", 1), orderItem("p12", 1)], total: 57.5, payment: "pendente", paymentMethod: "Multibanco", shipping: "preparacao", shippingMethod: "Standard" },
  { id: "DA-2025-0308", date: "2025-10-28T11:30:00", customer: customers[0], items: [orderItem("p07", 1), orderItem("p11", 1)], total: 57.5, payment: "pago", paymentMethod: "Cartão", shipping: "entregue", shippingMethod: "Standard" },
  { id: "DA-2025-0307", date: "2025-10-27T16:12:00", customer: customers[1], items: [orderItem("p15", 1)], total: 21.0, payment: "reembolsado", paymentMethod: "PayPal", shipping: "cancelado", shippingMethod: "Standard" },
  { id: "DA-2025-0306", date: "2025-10-26T08:55:00", customer: customers[2], items: [orderItem("p03", 1), orderItem("p13", 1)], total: 54.5, payment: "pago", paymentMethod: "Cartão", shipping: "entregue", shippingMethod: "Expresso" },
  { id: "DA-2025-0305", date: "2025-10-25T19:33:00", customer: customers[3], items: [orderItem("p05", 1), orderItem("p16", 1)], total: 32.5, payment: "pago", paymentMethod: "MB Way", shipping: "em_transito", shippingMethod: "Standard" },
  { id: "DA-2025-0304", date: "2025-10-24T13:08:00", customer: customers[0], items: [orderItem("p01", 1), orderItem("p15", 1)], total: 39.9, payment: "pago", paymentMethod: "Cartão", shipping: "entregue", shippingMethod: "Standard" },
  { id: "DA-2025-0303", date: "2025-10-23T10:48:00", customer: customers[1], items: [orderItem("p04", 2)], total: 48.0, payment: "pago", paymentMethod: "MB Way", shipping: "entregue", shippingMethod: "Standard" },
];

export const PAYMENT_STATES = [
  { id: "pago", label: "Pago", tone: "green" },
  { id: "pendente", label: "Pendente", tone: "amber" },
  { id: "reembolsado", label: "Reembolsado", tone: "muted" },
  { id: "falhado", label: "Falhado", tone: "red" },
];

export const SHIPPING_STATES = [
  { id: "preparacao", label: "Em preparação", tone: "amber" },
  { id: "em_transito", label: "Em trânsito", tone: "blue" },
  { id: "entregue", label: "Entregue", tone: "green" },
  { id: "cancelado", label: "Cancelado", tone: "muted" },
];

// ---------- Stock movements ----------
export const stockMovements = [
  { id: "m01", productId: "p01", productName: "Spray Sono e Ansiedade", qty: +30, reason: "Produção lote #34", date: "2025-10-12T09:00:00", type: "entrada" },
  { id: "m02", productId: "p04", productName: "Manteiga Corporal Vegana", qty: -2, reason: "Encomenda DA-2025-0312", date: "2025-11-02T10:30:00", type: "saida" },
  { id: "m03", productId: "p12", productName: "Roll-on Respiração", qty: -1, reason: "Encomenda DA-2025-0309", date: "2025-10-29T18:46:00", type: "saida" },
  { id: "m04", productId: "p06", productName: "Creme Facial Calmante", qty: +20, reason: "Produção lote #35", date: "2025-10-20T11:15:00", type: "entrada" },
  { id: "m05", productId: "p12", productName: "Roll-on Respiração", qty: -3, reason: "Quebra / amostra", date: "2025-10-18T15:00:00", type: "saida" },
  { id: "m06", productId: "p09", productName: "Óleo Corporal Flora & Cedro", qty: +15, reason: "Produção lote #36", date: "2025-10-15T10:00:00", type: "entrada" },
];

// ---------- Articles (extends storefront posts) ----------
export const adminArticles = blogPosts.map((p, i) => ({
  ...p,
  status: i === 0 ? "publicado" : i === 1 ? "publicado" : "rascunho",
  views: [820, 654, 412][i] || 0,
}));

// ---------- KPI series ----------
export const salesSeries = [
  { day: "Seg", value: 320 },
  { day: "Ter", value: 410 },
  { day: "Qua", value: 280 },
  { day: "Qui", value: 520 },
  { day: "Sex", value: 690 },
  { day: "Sáb", value: 540 },
  { day: "Dom", value: 380 },
];

export const topProductsSeries = [
  { name: "Spray Sono", value: 124 },
  { name: "Manteiga Corporal", value: 98 },
  { name: "Creme Calmante", value: 81 },
  { name: "Sérum Revigorante", value: 64 },
  { name: "Roll-on Respiração", value: 52 },
];

// ---------- Store settings ----------
export const storeSettings = {
  storeName: "DivinArte",
  tagline: "Cosmética natural artesanal",
  email: "ola@divinarte.pt",
  phone: "+351 220 000 000",
  address: "Rua das Camélias, 12 · 4100-100 Porto",
  paymentMethods: { card: true, mbway: true, multibanco: true, paypal: false },
  shippingOptions: { standard: { active: true, price: 4.9 }, express: { active: true, price: 7.9 }, freeAbove: 49 },
  general: { currency: "EUR", language: "pt-PT", maintenanceMode: false, lowStockAlert: 5 },
};

// ---------- Notifications (topbar) ----------
export const adminNotifications = [
  { id: "n01", title: "Nova encomenda DA-2025-0312", time: "há 2 min", read: false },
  { id: "n02", title: "Stock baixo: Roll-on Respiração", time: "há 35 min", read: false },
  { id: "n03", title: "Pagamento pendente em DA-2025-0309", time: "há 1 h", read: false },
  { id: "n04", title: "Novo comentário no blog", time: "há 3 h", read: true },
];
