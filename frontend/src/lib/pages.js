import { supabase } from "./supabaseClient";

// Páginas do construtor em public.pages. RLS: o público só vê as publicadas; o staff gere tudo.
// Antes disto os blocos viviam em localStorage, o que obrigava admin e loja (árvores React
// separadas) a partilhar a mesma chave — e nada chegava a outro browser.
const FIELDS = "id, slug, title, status, blocks, date";

export async function loadPages() {
  const { data, error } = await supabase
    .from("pages")
    .select(FIELDS)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map((p) => ({ ...p, blocks: p.blocks || [] }));
}

// Usada pelo construtor: carrega a página pelo id, publicada ou não (RLS de staff).
export async function getPage(id) {
  const { data, error } = await supabase.from("pages").select(FIELDS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? { ...data, blocks: data.blocks || [] } : null;
}

export async function getPublishedPage(slug) {
  const { data, error } = await supabase
    .from("pages")
    .select(FIELDS)
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  if (error) throw error;
  return data ? { ...data, blocks: data.blocks || [] } : null;
}

// Devolve a linha criada — o id é gerado pela base de dados (uuid) e é preciso para navegar
// logo a seguir para /admin/paginas/:id.
export async function createPage(page) {
  const { data, error } = await supabase
    .from("pages")
    .insert({
      slug: page.slug,
      title: page.title,
      status: page.status || "rascunho",
      blocks: page.blocks || [],
      date: page.date || new Date().toISOString().slice(0, 10),
    })
    .select(FIELDS)
    .single();
  if (error) throw error;
  return { ...data, blocks: data.blocks || [] };
}

export async function updatePage(id, patch) {
  const row = { updated_at: new Date().toISOString() };
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.blocks !== undefined) row.blocks = patch.blocks;
  if (patch.date !== undefined) row.date = patch.date;
  const { error } = await supabase.from("pages").update(row).eq("id", id);
  if (error) throw error;
}

export async function deletePage(id) {
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;
}
