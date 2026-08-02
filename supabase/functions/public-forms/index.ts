import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Submissões públicas da loja: mensagens de contacto, subscrições de newsletter e avaliações.
// Escreve com service role — por isso NENHUMA dessas tabelas precisa de política de escrita
// pública (ver 20260803000000_public_forms.sql).

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

const trim = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Verifica o token do reCAPTCHA v3. ATENÇÃO: se RECAPTCHA_SECRET não estiver definido nos
// secrets da função, a verificação é SALTADA — de outro modo os formulários da loja ficavam
// todos partidos até alguém configurar as chaves. Enquanto o secret faltar, não há proteção
// anti-spam nenhuma nestas três submissões.
async function recaptchaOk(token: string | undefined): Promise<boolean> {
  const secret = Deno.env.get("RECAPTCHA_SECRET");
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const out = await res.json();
    // v3 devolve um score 0..1; 0.5 é o limiar recomendado pela Google.
    return out.success === true && (out.score === undefined || out.score >= 0.5);
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SB_SECRET_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Faltam SUPABASE_URL / SERVICE_ROLE_KEY nos secrets da função." }, 500);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json();
    const action = body.action;

    if (!(await recaptchaOk(body.recaptchaToken))) {
      return json({ error: "Não foi possível validar que não és um robô. Tenta novamente." });
    }

    // ── Mensagem do formulário de contacto ───────────────────────────────────
    if (action === "lead") {
      const values = body.values && typeof body.values === "object" ? body.values : null;
      if (!values || Object.keys(values).length === 0) return json({ error: "Preenche o formulário." });

      const safeValues: Record<string, string> = {};
      for (const [k, v] of Object.entries(values)) safeValues[trim(k, 60)] = trim(v, 5000);

      const { error } = await admin.from("leads").insert({
        // status/note nunca vêm do cliente.
        status: "novo",
        note: "",
        fields_snapshot: Array.isArray(body.fieldsSnapshot) ? body.fieldsSnapshot.slice(0, 50) : [],
        values: safeValues,
      });
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    // ── Subscrição da newsletter ─────────────────────────────────────────────
    if (action === "subscribe") {
      const email = trim(body.email, 320).toLowerCase();
      if (!isEmail(email)) return json({ error: "Indica um e-mail válido." });

      const { error } = await admin
        .from("newsletter_subscribers")
        .insert({ email, source: trim(body.source, 40) || null });
      // Duplicado: sucesso silencioso — não confirmamos nem desmentimos que o e-mail já
      // está na lista, que seria uma fuga de informação.
      if (error && error.code !== "23505") return json({ error: error.message });
      return json({ ok: true });
    }

    // ── Avaliação de produto ─────────────────────────────────────────────────
    if (action === "review") {
      const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!jwt) return json({ error: "Inicia sessão para avaliar." });
      const { data: caller, error: callerErr } = await admin.auth.getUser(jwt);
      if (callerErr || !caller?.user) return json({ error: "Sessão inválida." });
      const userId = caller.user.id;

      const productId = trim(body.productId, 64);
      const rating = Number(body.rating);
      const comment = trim(body.comment, 2000);
      if (!productId) return json({ error: "Produto em falta." });
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: "Escolhe entre 1 e 5 estrelas." });
      if (!comment) return json({ error: "Escreve um comentário." });

      // A elegibilidade é decidida no servidor, a partir da sessão — nunca de um e-mail
      // escrito no formulário. Repete-se aqui a lógica de public.can_review() em vez de a
      // chamar por RPC: essa função decide por auth.uid(), que com service role é NULL.
      const { data: paidOrders, error: ordersErr } = await admin
        .from("orders").select("id").eq("user_id", userId).eq("status", "pago");
      if (ordersErr) return json({ error: ordersErr.message });
      const orderIds = (paidOrders || []).map((o: any) => o.id);
      let allowed = false;
      if (orderIds.length > 0) {
        const { data: items, error: itemsErr } = await admin
          .from("order_items").select("id").eq("product_id", productId).in("order_id", orderIds).limit(1);
        if (itemsErr) return json({ error: itemsErr.message });
        allowed = (items || []).length > 0;
      }
      if (!allowed) return json({ error: "Só clientes com uma encomenda paga deste produto podem avaliar." });

      const { data: profile } = await admin.from("profiles").select("name").eq("id", userId).maybeSingle();

      const { error } = await admin.from("reviews").insert({
        product_id: productId,
        user_id: userId,
        // Identidade vinda do servidor, nunca do corpo do pedido.
        name: profile?.name || caller.user.email?.split("@")[0] || "Cliente",
        email: caller.user.email,
        rating,
        comment,
        status: "pendente",
      });
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    return json({ error: "Ação desconhecida." });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
