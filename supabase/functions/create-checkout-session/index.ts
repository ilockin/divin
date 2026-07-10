import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // service_role — injected automatically by Supabase, bypasses RLS
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Ler chave secreta do Stripe guardada pelo admin no painel
  const { data: secretRow } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "stripe_secret_key")
    .single();

  const STRIPE_SECRET = secretRow?.value;
  if (!STRIPE_SECRET) {
    return new Response(JSON.stringify({ error: "Stripe não configurado. Adiciona a chave secreta em Definições → Stripe." }), {
      status: 503,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { order_id, origin } = await req.json();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", order_id)
    .single();

  if (error || !order) {
    return new Response(JSON.stringify({ error: "Encomenda não encontrada" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const params = new URLSearchParams({
    mode: "payment",
    customer_email: order.email,
    success_url: `${origin}/checkout/sucesso?order=${order.order_number}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    "metadata[order_id]": order.id,
    "metadata[order_number]": order.order_number,
  });

  order.order_items.forEach((item: any, i: number) => {
    params.set(`line_items[${i}][price_data][currency]`, "eur");
    params.set(`line_items[${i}][price_data][product_data][name]`, item.name);
    params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
    params.set(`line_items[${i}][quantity]`, String(item.qty));
  });

  if (order.shipping_cost > 0) {
    const i = order.order_items.length;
    params.set(`line_items[${i}][price_data][currency]`, "eur");
    params.set(`line_items[${i}][price_data][product_data][name]`, "Envio");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(order.shipping_cost * 100)));
    params.set(`line_items[${i}][quantity]`, "1");
  }

  if (order.discount_amount > 0) {
    const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ amount_off: String(Math.round(order.discount_amount * 100)), currency: "eur", duration: "once" }),
    });
    const coupon = await couponRes.json();
    if (coupon.id) params.set("discounts[0][coupon]", coupon.id);
  }

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    return new Response(JSON.stringify({ error: session.error?.message ?? "Erro Stripe" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
