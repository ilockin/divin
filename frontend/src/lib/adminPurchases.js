import { supabase } from "./supabaseClient";

const fromRow = (r) => ({
  id: r.id,
  code: r.code,
  supplierId: r.supplier_id || "",
  date: r.date,
  status: r.status || "rascunho",
  lines: (r.lines || []).map((l) => ({ insumoId: l.insumo_id, qty: Number(l.qty) || 0, cost: Number(l.cost) || 0 })),
});

const toRow = (form) => ({
  supplier_id: form.supplierId || null,
  date: form.date || null,
  status: form.status || "rascunho",
  lines: (form.lines || []).map((l) => ({ insumo_id: l.insumoId, qty: parseFloat(l.qty) || 0, cost: parseFloat(l.cost) || 0 })),
});

export async function listPurchases() {
  const { data, error } = await supabase.from("purchases").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

async function nextCode() {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .like("code", `CP-${year}-%`);
  return `CP-${year}-${String((count || 0) + 1).padStart(3, "0")}`;
}

export async function createPurchase(form) {
  const code = await nextCode();
  const { data, error } = await supabase.from("purchases").insert({ code, ...toRow(form) }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updatePurchase(id, form) {
  const { data, error } = await supabase.from("purchases").update(toRow(form)).eq("id", id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deletePurchase(id) {
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) throw error;
}
