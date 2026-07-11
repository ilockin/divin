import { supabase } from "./supabaseClient";

const BUCKET = "product-images";

// linha DB (snake_case) -> forma usada no admin (camelCase + status)
export function fromRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    slug: row.slug || "",
    short: row.short || "",
    description: row.description || "",
    usage: row.usage_notes || "",
    benefits: (row.benefits && row.benefits.length) ? row.benefits : [""],
    price: Number(row.price) || 0,
    comparePrice: row.compare_price != null ? Number(row.compare_price) : "",
    category: row.category_slug || "",
    sub: row.subcategory_slug || "",
    size: row.size || "",
    images: row.images || [],
    status: row.active ? "publicado" : "rascunho",
    vegan: !!row.vegan,
    bio: !!row.bio,
    isNew: !!row.is_new,
    featured: !!row.featured,
    skinType: row.skin_types || [],
    purpose: row.purposes || [],
    stock: row.stock_qty ?? 0,
    minStock: row.min_stock ?? 5,
    commissionType: row.commission_type || "percentage",
    commissionValue: row.commission_value ?? 0,
    shippingMode: row.shipping_mode || "inherit",
    shippingMethodIds: row.shipping_method_ids || [],
  };
}

// forma do admin (camelCase) -> linha DB (snake_case + active)
function toRow(form) {
  return {
    name: form.name,
    slug: form.slug,
    short: form.short || null,
    description: form.description || null,
    usage_notes: form.usage || null,
    benefits: (form.benefits || []).filter((b) => b && b.trim()),
    price: parseFloat(form.price) || 0,
    compare_price: form.comparePrice === "" || form.comparePrice == null ? null : parseFloat(form.comparePrice),
    category_slug: form.category || null,
    subcategory_slug: form.sub || null,
    size: form.size || null,
    images: form.images || [],
    active: form.status === "publicado",
    vegan: !!form.vegan,
    bio: !!form.bio,
    is_new: !!form.isNew,
    featured: !!form.featured,
    skin_types: form.skinType || [],
    purposes: form.purpose || [],
    stock_qty: parseInt(form.stock, 10) || 0,
    min_stock: parseInt(form.minStock, 10) || 0,
    commission_type: form.commissionType || "percentage",
    commission_value: parseFloat(form.commissionValue) || 0,
    shipping_mode: form.shippingMode || "inherit",
    shipping_method_ids: form.shippingMethodIds || [],
  };
}

export async function listAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function getProduct(id) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return fromRow(data);
}

export async function createProduct(form) {
  const { data, error } = await supabase.from("products").insert(toRow(form)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateProduct(id, form) {
  const { data, error } = await supabase.from("products").update(toRow(form)).eq("id", id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function setProductActive(id, active) {
  const { error } = await supabase.from("products").update({ active }).eq("id", id);
  if (error) throw error;
}

// Upload de imagem para o Storage; devolve o URL público.
export async function uploadProductImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
