import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // service_role — injectada pela Supabase; tolerante ao novo formato de chaves (sb_secret_…)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SB_SECRET_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json({ error: "Faltam SUPABASE_URL / SERVICE_ROLE_KEY nos secrets da função. Define SERVICE_ROLE_KEY (ou SB_SECRET_KEY) com a service/secret key do projeto." }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ler chave secreta do Stripe guardada pelo admin no painel
    const { data: secretRow } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "stripe_secret_key")
      .single();

    const STRIPE_SECRET = secretRow?.value;
    if (!STRIPE_SECRET) {
      return json({ error: "Stripe não configurado. Adiciona a chave secreta em Definições → Stripe." }, 503);
    }

    const { order_id, origin } = await req.json();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      return json({ error: "Encomenda não encontrada" }, 404);
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
      return json({ error: session.error?.message ?? "Erro Stripe" }, 500);
    }

    await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return json({ url: session.url });
  } catch (e) {
    // Erro inesperado — devolver a causa real em vez de um 500 opaco
    return json({ error: String((e as Error)?.message ?? e), stack: (e as Error)?.stack ?? null }, 500);
  }
});
