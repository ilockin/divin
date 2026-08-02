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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      Deno.env.get("SB_SECRET_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Faltam SUPABASE_URL / SERVICE_ROLE_KEY nos secrets da função." }, 500);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Autenticar o chamador e exigir papel de staff.
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Sem sessão." });
    const { data: caller, error: callerErr } = await admin.auth.getUser(jwt);
    if (callerErr || !caller?.user) return json({ error: "Sessão inválida." });
    const callerId = caller.user.id;
    const { data: callerProfile } = await admin.from("profiles").select("role").eq("id", callerId).single();
    const callerRole = String(callerProfile?.role || "");
    if (!["admin", "super_admin"].includes(callerRole)) return json({ error: "Sem permissão." });
    const isSuper = callerRole === "super_admin";

    const body = await req.json();
    const action = body.action;

    if (action === "list") {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const authUsers = list?.users || [];
      const ids = authUsers.map((u: any) => u.id);
      const { data: profs } = await admin.from("profiles").select("id, name, role, active")
        .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const byId: Record<string, any> = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
      const users = authUsers.map((u: any) => {
        const p = byId[u.id] || {};
        return {
          id: u.id,
          email: u.email,
          name: p.name || u.user_metadata?.name || "",
          role: p.role || "cliente",
          active: p.active !== false,
          createdAt: u.created_at,
        };
      });
      return json({ users });
    }

    if (action === "create") {
      const { email, password, name, role } = body;
      if (!email || !password) return json({ error: "E-mail e palavra-passe são obrigatórios." });
      const { data: created, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name },
      });
      if (error) return json({ error: error.message });
      await admin.from("profiles").upsert(
        { id: created.user.id, name: name || null, role: role || "cliente", active: true },
        { onConflict: "id" },
      );
      return json({ id: created.user.id });
    }

    if (action === "update") {
      const { userId, name, role, active } = body;
      const patch: Record<string, unknown> = {};
      if (name !== undefined) patch.name = name;
      if (role !== undefined) patch.role = role;
      if (active !== undefined) patch.active = active;
      const { error } = await admin.from("profiles").update(patch).eq("id", userId);
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    if (action === "setPassword") {
      if (!isSuper) return json({ error: "Apenas o Super Admin pode definir palavras-passe." });
      const { userId, password } = body;
      if (!password || password.length < 6) return json({ error: "A palavra-passe tem de ter pelo menos 6 caracteres." });
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    if (action === "delete") {
      const { userId } = body;
      if (userId === callerId) return json({ error: "Não podes remover a tua própria conta." });
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    return json({ error: "Ação desconhecida." });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
