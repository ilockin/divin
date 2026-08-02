import { supabase } from "./supabaseClient";

// Artigos do blog em public.articles. RLS: o público só vê os publicados; o staff vê e gere tudo.
// As colunas têm os mesmos nomes do objeto usado no admin, por isso não há mapeamento a fazer.
const FIELDS = "id, slug, title, excerpt, category, author, cover, body, status, views, date";

// Usada pelo admin (/admin/blog) — devolve publicados e rascunhos.
export async function loadArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(FIELDS)
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Só os publicados aparecem na loja (o RLS já filtra, mas manter o filtro torna a intenção
// explícita e protege quem chamar isto com sessão de staff).
export async function loadPublishedArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(FIELDS)
    .eq("status", "publicado")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function findArticle(slug) {
  const { data, error } = await supabase.from("articles").select(FIELDS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data || null;
}

const toRow = (a) => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt || null,
  category: a.category || null,
  author: a.author || null,
  cover: a.cover || null,
  body: a.body || null,
  status: a.status || "rascunho",
  views: a.views ?? 0,
  date: a.date || null,
});

export async function createArticle(article) {
  const { error } = await supabase.from("articles").insert(toRow(article));
  if (error) throw error;
}

export async function updateArticle(slug, article) {
  const { error } = await supabase
    .from("articles")
    .update({ ...toRow(article), updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) throw error;
}

export async function setArticleStatus(slug, status) {
  const { error } = await supabase
    .from("articles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) throw error;
}

export async function deleteArticle(slug) {
  const { error } = await supabase.from("articles").delete().eq("slug", slug);
  if (error) throw error;
}
