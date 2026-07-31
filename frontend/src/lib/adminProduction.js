import { supabase } from "./supabaseClient";

// ---------- Fornecedores ----------
export async function listSuppliers() {
  const { data, error } = await supabase.from("suppliers").select("id, name").order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

// ---------- Insumos ----------
const fromInsumo = (r) => ({
  id: r.id,
  name: r.name || "",
  category: r.category || "",
  unit: r.unit || "un",
  supplierId: r.supplier_id || "",
  cost: Number(r.cost) || 0,
  stock: Number(r.stock) || 0,
  minStock: Number(r.min_stock) || 0,
});
const toInsumo = (m) => ({
  name: m.name,
  category: m.category || null,
  unit: m.unit || null,
  supplier_id: m.supplierId || null,
  cost: parseFloat(m.cost) || 0,
  stock: parseFloat(m.stock) || 0,
  min_stock: parseFloat(m.minStock) || 0,
});

export async function listInsumos() {
  const { data, error } = await supabase.from("insumos").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromInsumo);
}
export async function createInsumo(m) {
  const { data, error } = await supabase.from("insumos").insert(toInsumo(m)).select().single();
  if (error) throw error;
  return fromInsumo(data);
}
export async function updateInsumo(id, m) {
  const { data, error } = await supabase.from("insumos").update(toInsumo(m)).eq("id", id).select().single();
  if (error) throw error;
  return fromInsumo(data);
}
export async function deleteInsumo(id) {
  const { error } = await supabase.from("insumos").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Fichas técnicas (BOM) ----------
let recipeLineSeq = 0;
export async function loadRecipes() {
  const { data, error } = await supabase.from("product_recipes").select("*");
  if (error) throw error;
  const out = {};
  (data || []).forEach((r) => {
    out[r.product_id] = {
      updatedAt: r.updated_at,
      lines: (r.lines || []).map((l) => ({ id: `rl${recipeLineSeq++}`, insumoId: l.insumo_id, qty: Number(l.qty) || 0, unit: l.unit || "un" })),
    };
  });
  return out;
}
export async function saveRecipe(productId, lines) {
  const payload = {
    product_id: productId,
    lines: lines.map((l) => ({ insumo_id: l.insumoId, qty: Number(l.qty) || 0, unit: l.unit || "un" })),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("product_recipes").upsert(payload, { onConflict: "product_id" });
  if (error) throw error;
}

// ---------- Ordens de produção ----------
const fromOrder = (r) => ({
  id: r.id,
  orderNumber: r.order_number,
  productId: r.product_id,
  qty: r.qty ?? 0,
  status: r.status || "planeada",
  notes: r.notes || "",
  date: r.date,
});

export async function listProductionOrders() {
  const { data, error } = await supabase.from("production_orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromOrder);
}

async function nextOrderNumber() {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("production_orders")
    .select("id", { count: "exact", head: true })
    .like("order_number", `OP-${year}-%`);
  return `OP-${year}-${String((count || 0) + 1).padStart(3, "0")}`;
}

export async function createProductionOrder({ productId, qty, notes }) {
  const order_number = await nextOrderNumber();
  const { data, error } = await supabase
    .from("production_orders")
    .insert({ order_number, product_id: productId, qty: parseInt(qty, 10) || 0, notes: notes || null, status: "planeada" })
    .select()
    .single();
  if (error) throw error;
  return fromOrder(data);
}
export async function updateProductionOrderStatus(id, status) {
  const { error } = await supabase.from("production_orders").update({ status }).eq("id", id);
  if (error) throw error;
}
export async function deleteProductionOrder(id) {
  const { error } = await supabase.from("production_orders").delete().eq("id", id);
  if (error) throw error;
}
