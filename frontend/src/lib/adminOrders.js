import { supabase } from "./supabaseClient";

export async function loadAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}

export const ORDER_STATUSES = [
  { id: "pendente",    label: "Pendente",    tone: "warn" },
  { id: "pago",        label: "Pago",        tone: "ok" },
  { id: "processando", label: "Processando", tone: "info" },
  { id: "enviado",     label: "Enviado",     tone: "info" },
  { id: "entregue",   label: "Entregue",    tone: "ok" },
  { id: "cancelado",  label: "Cancelado",   tone: "err" },
];
