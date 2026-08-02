import { supabase } from "./supabaseClient";
import { getAffiliateRef, clearAffiliateRef } from "./affiliateRef";

export async function createOrder({ items, form, shippingCost, discountAmount, userId, shippingMethodId, couponCode, paymentMethod }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + shippingCost - discountAmount;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: "",
      user_id: userId || null,
      email: form.email,
      status: "pendente",
      // Estes valores são indicativos: quem cobra é a Edge Function create-payment-intent,
      // que os recalcula a partir de `products`, `shipping_methods` e `coupons`.
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total,
      shipping_method_id: shippingMethodId || null,
      coupon_code: couponCode || null,
      payment_method: paymentMethod || null,
      affiliate_code: getAffiliateRef(),
      shipping_address: {
        name: form.name,
        line1: form.address,
        city: form.city,
        zip: form.zip,
        country: form.country || "Portugal",
        phone: form.phone || "",
      },
    })
    .select()
    .single();

  if (orderErr) throw orderErr;

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.id || null,
    product_slug: i.slug,
    name: i.name,
    price: i.price,
    qty: i.qty,
    image_url: i.image || null,
    size: i.size || null,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
  if (itemsErr) throw itemsErr;

  clearAffiliateRef();
  return order;
}

export async function loadOrders(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function loadOrder(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

const STATUS_LABEL = {
  pendente:     { label: "Pendente",     color: "#F59E0B" },
  pago:         { label: "Pago",         color: "#10B981" },
  processando:  { label: "Processando",  color: "#3B82F6" },
  enviado:      { label: "Enviado",      color: "#8B5CF6" },
  entregue:     { label: "Entregue",     color: "#2E9E44" },
  cancelado:    { label: "Cancelado",    color: "#EF4444" },
};

export function getStatusInfo(status) {
  return STATUS_LABEL[status] || { label: status, color: "#6B7280" };
}
