import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SB_SECRET_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response("Faltam SUPABASE_URL / SERVICE_ROLE_KEY nos secrets da função", { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ler webhook secret guardado pelo admin
    const { data: secretRow } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "stripe_webhook_secret")
      .single();

    const STRIPE_WEBHOOK_SECRET = secretRow?.value;
    if (!STRIPE_WEBHOOK_SECRET) {
      return new Response("Webhook secret não configurado", { status: 503 });
    }

    const signature = req.headers.get("stripe-signature") ?? "";
    const body = await req.text();

    // Verificação HMAC
    try {
      const parts: Record<string, string> = Object.fromEntries(
        signature.split(",").map((p) => p.split("=") as [string, string])
      );
      const payload = `${parts.t}.${body}`;
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
      const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
      if (parts.v1 !== expected) {
        return new Response("Assinatura inválida", { status: 400 });
      }
    } catch {
      return new Response("Erro na verificação", { status: 400 });
    }

    const event = JSON.parse(body);

    // ── Ciclo do PaymentIntent (Stripe Elements na página de checkout) ────────
    // O dinheiro só conta em `succeeded`. Métodos de notificação diferida — o Multibanco é o
    // caso — passam por `processing` durante dias, entre a emissão da referência e o
    // pagamento efetivo; nesse intervalo a encomenda TEM de continuar por pagar.
    if (event.type.startsWith("payment_intent.")) {
      const intent = event.data.object;
      const orderId = intent.metadata?.order_id;
      const method = intent.payment_method_types?.[0] ?? null;

      if (orderId) {
        if (event.type === "payment_intent.succeeded") {
          await supabase.from("orders")
            .update({ status: "pago", stripe_payment_intent_id: intent.id, payment_method: method })
            .eq("id", orderId);
        } else if (event.type === "payment_intent.processing") {
          await supabase.from("orders")
            .update({ status: "pendente", stripe_payment_intent_id: intent.id, payment_method: method })
            .eq("id", orderId);
        } else if (event.type === "payment_intent.payment_failed") {
          await supabase.from("orders")
            .update({ status: "pendente", payment_method: method })
            .eq("id", orderId);
        }
      }
    }

    // ── Checkout Sessions (fluxo anterior, mantido para encomendas já em curso) ─
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      // `completed` não significa pago: num método diferido dispara quando a referência é
      // emitida. Sem esta guarda, uma encomenda ficava paga sem dinheiro nenhum ter entrado.
      if (orderId && session.payment_status === "paid") {
        await supabase.from("orders").update({ status: "pago", stripe_session_id: session.id }).eq("id", orderId);
      }
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabase.from("orders").update({ status: "pago", stripe_session_id: session.id }).eq("id", orderId);
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(String((e as Error)?.message ?? e), { status: 500 });
  }
});
