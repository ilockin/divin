import { supabase } from "./supabaseClient";

// Histórico de movimentos, já com o nome do produto (embed via FK).
export async function listMovements(limit = 200) {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("id, qty, type, reason, created_at, product_id, products(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((m) => ({
    id: m.id,
    productId: m.product_id,
    productName: m.products?.name || "—",
    qty: m.qty,
    type: m.type,
    reason: m.reason || "",
    date: m.created_at,
  }));
}

// Ajuste transacional (grava o movimento e atualiza o saldo). Devolve o novo stock.
export async function adjustStock({ productId, qty, type, reason }) {
  const { data, error } = await supabase.rpc("adjust_stock", {
    p_product_id: productId,
    p_qty: qty,
    p_type: type,
    p_reason: reason || null,
  });
  if (error) throw error;
  return data;
}
