import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cria o PaymentIntent de uma encomenda e devolve o client_secret para o Payment Element /
// Express Checkout Element na página de checkout.
//
// REGRA CENTRAL: o montante é recalculado aqui a partir dos dados do servidor. A linha em
// `orders` é inserida pelo cliente (RLS permite-lhe criar a própria encomenda), por isso
// `orders.total` é manipulável e NUNCA pode ser o que se cobra.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

const cents = (v: number) => Math.round(v * 100);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SB_SECRET_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Faltam SUPABASE_URL / SERVICE_ROLE_KEY nos secrets da função." }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: secretRow } = await supabase
      .from("store_settings").select("value").eq("key", "stripe_secret_key").maybeSingle();
    const STRIPE_SECRET = secretRow?.value;
    if (!STRIPE_SECRET) return json({ error: "Stripe não configurado. Adiciona a chave secreta em Definições → Stripe." }, 503);

    const { order_id } = await req.json();
    if (!order_id) return json({ error: "Encomenda em falta." }, 400);

    const { data: order, error } = await supabase
      .from("orders").select("*, order_items(*)").eq("id", order_id).single();
    if (error || !order) return json({ error: "Encomenda não encontrada." }, 404);

    // ── 1) Subtotal a partir do preço atual em `products` ────────────────────
    const items = order.order_items || [];
    if (items.length === 0) return json({ error: "Encomenda sem artigos." }, 400);

    const productIds = items.map((i: any) => i.product_id).filter(Boolean);
    if (productIds.length !== items.length) {
      return json({ error: "Encomenda com artigos sem produto associado." }, 400);
    }
    const { data: products, error: prodErr } = await supabase
      .from("products").select("id, price, category_slug").in("id", productIds);
    if (prodErr) return json({ error: prodErr.message }, 500);

    const priceById: Record<string, number> = {};
    const categoryById: Record<string, string> = {};
    (products || []).forEach((p: any) => { priceById[p.id] = Number(p.price); categoryById[p.id] = p.category_slug; });

    let subtotal = 0;
    for (const item of items) {
      const price = priceById[item.product_id];
      if (price === undefined) return json({ error: "Produto já não está disponível." }, 400);
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      subtotal += price * qty;
    }

    // ── 2) Portes a partir do método escolhido ───────────────────────────────
    let shipping = 0;
    if (order.shipping_method_id) {
      const { data: method } = await supabase
        .from("shipping_methods").select("cost, active").eq("id", order.shipping_method_id).maybeSingle();
      if (!method || !method.active) return json({ error: "Método de envio inválido." }, 400);
      shipping = Number(method.cost) || 0;
    }

    // ── 3) Desconto revalidado contra a tabela de cupões ─────────────────────
    // O cupão só condiciona a elegibilidade; quando é elegível, aplica-se ao subtotal
    // inteiro — a mesma regra de frontend/src/lib/coupons.js.
    let discount = 0;
    if (order.coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons").select("*").eq("code", order.coupon_code).maybeSingle();
      const today = new Date().toISOString().slice(0, 10);
      const eligible =
        coupon &&
        coupon.active &&
        (!coupon.valid_from || today >= coupon.valid_from) &&
        (!coupon.valid_until || today <= coupon.valid_until) &&
        !(coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) &&
        subtotal >= Number(coupon.min_order || 0) &&
        (coupon.scope === "all" ||
          (coupon.scope === "category" && items.some((i: any) => (coupon.scope_ids || []).includes(categoryById[i.product_id]))) ||
          (coupon.scope === "product" && items.some((i: any) => (coupon.scope_ids || []).includes(i.product_id))));

      if (eligible) {
        discount = coupon.type === "percentage"
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
      }
      // Cupão inválido: simplesmente não desconta — a encomenda segue pelo valor cheio.
    }

    const total = Math.max(0, subtotal + shipping - Math.min(discount, subtotal));
    const amount = cents(total);
    if (amount < 50) return json({ error: "O valor mínimo de pagamento é 0,50 €." }, 400);

    // Guardar os valores corretos: até aqui a linha tinha os que o cliente enviou.
    await supabase.from("orders").update({
      subtotal, shipping_cost: shipping, discount_amount: Math.min(discount, subtotal), total,
    }).eq("id", order.id);

    // ── 4) PaymentIntent ─────────────────────────────────────────────────────
    // automatic_payment_methods deixa o Stripe mostrar cartão, MB Way, Multibanco e PayPal
    // conforme o que estiver ativo no painel e o valor da encomenda.
    const params = new URLSearchParams({
      amount: String(amount),
      currency: "eur",
      "automatic_payment_methods[enabled]": "true",
      "metadata[order_id]": order.id,
      "metadata[order_number]": order.order_number || "",
    });
    if (order.email) params.set("receipt_email", order.email);

    const res = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const intent = await res.json();
    if (!res.ok) return json({ error: intent.error?.message ?? "Erro Stripe" }, 500);

    await supabase.from("orders").update({ stripe_payment_intent_id: intent.id }).eq("id", order.id);

    return json({ clientSecret: intent.client_secret, amount });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
