import { supabase } from "./supabaseClient";

const fromRow = (r) => ({
  id: r.id,
  name: r.name || "",
  description: r.description || "",
  cost: Number(r.cost) || 0,
  eta: r.eta || "",
  zones: r.zones || "",
  active: !!r.active,
  isPickup: !!r.is_pickup,
  sortOrder: r.sort_order ?? 0,
});

const toRow = (m) => ({
  name: m.name,
  description: m.description || null,
  cost: parseFloat(m.cost) || 0,
  eta: m.eta || null,
  zones: m.zones || null,
  active: !!m.active,
  is_pickup: !!m.isPickup,
});

// Admin: todos os métodos (inclui inativos).
export async function listAllMethods() {
  const { data, error } = await supabase.from("shipping_methods").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Checkout / loja: só os ativos.
export async function listActiveMethods() {
  const { data, error } = await supabase.from("shipping_methods").select("*").eq("active", true).order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createMethod(m) {
  const id = m.id || "sm" + Date.now();
  const { error } = await supabase.from("shipping_methods").insert({ id, ...toRow(m) });
  if (error) throw error;
  return id;
}

export async function updateMethod(id, m) {
  const { error } = await supabase.from("shipping_methods").update(toRow(m)).eq("id", id);
  if (error) throw error;
}

export async function deleteMethod(id) {
  const { error } = await supabase.from("shipping_methods").delete().eq("id", id);
  if (error) throw error;
}

export async function setMethodActive(id, active) {
  const { error } = await supabase.from("shipping_methods").update({ active }).eq("id", id);
  if (error) throw error;
}
