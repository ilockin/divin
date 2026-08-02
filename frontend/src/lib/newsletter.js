import { supabase } from "./supabaseClient";
import { submitPublicForm } from "./publicForms";

// Subscritores da newsletter. A tabela é só do staff (são dados pessoais); a subscrição
// pública passa pela Edge Function `public-forms`.

const normalize = (row) => ({
  id: row.id,
  email: row.email,
  source: row.source || "",
  subscribedAt: row.created_at,
});

// Chamado pelos formulários de newsletter (rodapé e bloco) — sem AdminContext.
// Subscrições duplicadas são ignoradas silenciosamente (UX comum em newsletters, e evita
// revelar quem já está na lista).
export const addSubscriber = (email, source) => submitPublicForm("subscribe", { email, source });

export async function loadSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, source, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) throw error;
}
