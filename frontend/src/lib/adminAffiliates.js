import { supabase } from "./supabaseClient";
import { loadAllOrders } from "./adminOrders";
import { listAllProducts } from "./adminProducts";
import { calcCommission } from "./commission";

// Perfis com papel de afiliado.
export async function listAffiliates() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, affiliate_code, affiliate_active")
    .eq("role", "afiliado")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    name: r.name || "—",
    affiliateCode: r.affiliate_code || "",
    affiliateActive: r.affiliate_active !== false,
  }));
}

export async function updateAffiliateCode(id, code) {
  const { error } = await supabase.from("profiles").update({ affiliate_code: code || null }).eq("id", id);
  if (error) throw error;
}

export async function setAffiliateActive(id, active) {
  const { error } = await supabase.from("profiles").update({ affiliate_active: active }).eq("id", id);
  if (error) throw error;
}

// Agregação para a vista admin (usa o acesso de leitura do admin).
export async function affiliateAdminAggregates() {
  const [affiliates, orders, products] = await Promise.all([listAffiliates(), loadAllOrders(), listAllProducts()]);
  const prodById = new Map(products.map((p) => [p.id, p]));
  const orderCommission = (o) => (o.order_items || []).reduce((s, it) => {
    const p = prodById.get(it.product_id);
    if (!p) return s;
    return s + calcCommission({ price: it.price, commissionType: p.commissionType, commissionValue: p.commissionValue }, it.qty);
  }, 0);

  return affiliates.map((a) => {
    const mine = a.affiliateCode ? orders.filter((o) => o.affiliate_code === a.affiliateCode) : [];
    const paid = mine.filter((o) => o.status === "pago");
    return {
      ...a,
      salesCount: mine.length,
      revenue: paid.reduce((s, o) => s + Number(o.total || 0), 0),
      commission: paid.reduce((s, o) => s + orderCommission(o), 0),
    };
  });
}

// Painel do afiliado autenticado (via RPC security definer).
export async function myAffiliateOverview() {
  const { data, error } = await supabase.rpc("affiliate_overview");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    code: row?.code || "",
    salesCount: Number(row?.sales_count || 0),
    revenue: Number(row?.revenue || 0),
    commission: Number(row?.commission || 0),
  };
}

export async function myAffiliateSales() {
  const { data, error } = await supabase.rpc("affiliate_sales");
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    date: r.created_at,
    total: Number(r.total || 0),
    status: r.status,
    commission: Number(r.commission || 0),
  }));
}
