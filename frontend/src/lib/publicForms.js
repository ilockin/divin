import { supabase } from "./supabaseClient";
import { getRecaptchaToken } from "./recaptcha";

// Ponte para a Edge Function `public-forms`, por onde passam as três submissões públicas
// (contacto, newsletter, avaliação). Nenhuma dessas tabelas aceita escrita anónima direta.
export async function submitPublicForm(action, params = {}) {
  const recaptchaToken = await getRecaptchaToken(action);
  const { data, error } = await supabase.functions.invoke("public-forms", {
    body: { action, recaptchaToken, ...params },
  });
  if (error) {
    // tentar extrair a mensagem do corpo da resposta
    try { const j = await error.context?.json?.(); if (j?.error) throw new Error(j.error); } catch (e) { if (e.message) throw e; }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
