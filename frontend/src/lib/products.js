import { supabase } from "./supabaseClient";

const normalize = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  short: row.short || "",
  description: row.description || "",
  price: Number(row.price),
  comparePrice: row.compare_price ? Number(row.compare_price) : null,
  category: row.category_slug,
  sub: row.subcategory_slug,
  images: row.images || [],
  benefits: row.benefits || [],
  usage: row.usage_notes || "",
  size: row.size || "",
  vegan: row.vegan,
  bio: row.bio,
  isNew: row.is_new,
  featured: row.featured,
  skinType: row.skin_types || ["todos"],
  purpose: row.purposes || [],
  stock: row.stock_qty,
});

export async function loadProducts({ category, subcategory } = {}) {
  let query = supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (category) query = query.eq("category_slug", category);
  if (subcategory) query = query.eq("subcategory_slug", subcategory);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function loadProduct(slug) {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).eq("active", true).single();
  if (error) throw error;
  return normalize(data);
}

export async function loadCategories() {
  const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
  if (error) throw error;
  const rows = data || [];
  const main = rows.filter((c) => !c.parent_slug).map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image_url,
    subcategories: rows
      .filter((s) => s.parent_slug === c.slug)
      .map((s) => ({ slug: s.slug, name: s.name })),
  }));
  return main;
}
