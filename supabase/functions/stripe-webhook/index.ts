import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabase.from("orders").update({ status: "pago", stripe_session_id: session.id }).eq("id", orderId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
