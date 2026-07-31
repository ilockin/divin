import { supabase } from "./supabaseClient";

// linha DB (snake_case) -> forma usada na UI (camelCase)
function fromRow(r) {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: Number(r.value) || 0,
    minOrder: Number(r.min_order) || 0,
    validFrom: r.valid_from || "",
    validUntil: r.valid_until || "",
    usageLimit: r.usage_limit ?? 0,
    usedCount: r.used_count ?? 0,
    active: !!r.active,
    scope: r.scope || "all",
    scopeIds: r.scope_ids || [],
  };
}

// forma da UI -> linha DB (não escreve used_count para não pisar contagem real)
function toRow(f) {
  return {
    code: f.code,
    type: f.type,
    value: parseFloat(f.value) || 0,
    min_order: parseFloat(f.minOrder) || 0,
    valid_from: f.validFrom || null,
    valid_until: f.validUntil || null,
    usage_limit: parseInt(f.usageLimit, 10) || 0,
    active: !!f.active,
    scope: f.scope || "all",
    scope_ids: f.scopeIds || [],
  };
}

export async function listAllCoupons() {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createCoupon(form) {
  const { error } = await supabase.from("coupons").insert(toRow(form));
  if (error) throw error;
}

export async function updateCoupon(id, form) {
  const { error } = await supabase.from("coupons").update(toRow(form)).eq("id", id);
  if (error) throw error;
}

export async function deleteCoupon(id) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
}

export async function setCouponActive(id, active) {
  const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
  if (error) throw error;
}

// Para o checkout/carrinho: procura um cupão ATIVO pelo código (RLS já filtra ativos p/ anónimo).
export async function getCouponByCode(code) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}
