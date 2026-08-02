import { supabase } from "./supabaseClient";

// Singletons de conteúdo editorial (home, about, contact, blog, menu, footer, integrations),
// uma linha por chave em public.site_content. Leitura pública; escrita só para staff (RLS).

// Nenhum conteúdo real é um objeto vazio: se a linha existir mas vier vazia (ou não for
// sequer um objeto), vale mais o valor de fábrica do que rebentar a renderizar.
const isUsable = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0;

export async function getContent(key, fallback) {
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  // Sem linha (ainda nunca foi gravado) ou falha de rede: fica o valor de fábrica.
  if (error) {
    console.error(`[site_content] falha ao carregar "${key}":`, error.message);
    return fallback;
  }
  return isUsable(data?.value) ? data.value : fallback;
}

export async function saveContent(key, value) {
  // Recusar escrita de lixo (um objeto vazio, uma promessa, um valor por resolver): é
  // preferível falhar com uma mensagem clara a apagar conteúdo bom na base de dados.
  if (!isUsable(value) || typeof value.then === "function") {
    throw new Error(`Conteúdo inválido para "${key}" — nada foi gravado.`);
  }
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}
