import { supabase } from "./supabaseClient";

// A tabela `categories` é plana: categorias principais têm parent_slug null,
// subcategorias têm parent_slug = slug da principal. PK = slug.

export async function listAllCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Constrói a árvore (principais + children) a partir das linhas planas.
export function buildTree(rows) {
  const mains = rows.filter((c) => !c.parent_slug);
  return mains.map((m) => ({
    ...m,
    children: rows.filter((s) => s.parent_slug === m.slug),
  }));
}

export async function createCategory(payload) {
  const { error } = await supabase.from("categories").insert(payload);
  if (error) throw error;
}

export async function updateCategory(slug, payload) {
  const { error } = await supabase.from("categories").update(payload).eq("slug", slug);
  if (error) throw error;
}

export async function deleteCategory(slug) {
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) throw error;
}

// Persiste a nova ordem das categorias principais.
export async function reorderCategories(slugsInOrder) {
  await Promise.all(
    slugsInOrder.map((slug, i) => supabase.from("categories").update({ sort_order: i }).eq("slug", slug))
  );
}
