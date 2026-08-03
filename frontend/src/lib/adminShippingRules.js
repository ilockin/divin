import { supabase } from "./supabaseClient";

// ---------- Zonas por país ----------
export async function loadZones() {
  const { data, error } = await supabase.from("shipping_zones").select("*").order("id", { ascending: true });
  if (error) throw error;
  return (data || []).map((z) => ({
    id: z.id, name: z.name, active: !!z.active,
    methodIds: z.method_ids || [], overrides: z.overrides || {},
  }));
}
export async function saveZone(zone) {
  const { error } = await supabase.from("shipping_zones").upsert({
    id: zone.id, name: zone.name, active: !!zone.active,
    method_ids: zone.methodIds || [], overrides: zone.overrides || {},
  }, { onConflict: "id" });
  if (error) throw error;
}
export async function deleteZone(id) {
  const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Regras por distrito (PT/ES) ----------
export async function loadDistrictRules() {
  const { data, error } = await supabase.from("shipping_district_rules").select("*");
  if (error) throw error;
  const out = { PT: {}, ES: {} };
  (data || []).forEach((r) => {
    if (!out[r.country]) out[r.country] = {};
    out[r.country][r.district] = { methodIds: r.method_ids || [], overrides: r.overrides || {} };
  });
  return out;
}
export async function saveDistrictRule(country, district, rule) {
  if (!rule || (rule.methodIds || []).length === 0) return clearDistrictRule(country, district);
  const { error } = await supabase.from("shipping_district_rules").upsert({
    country, district, method_ids: rule.methodIds || [], overrides: rule.overrides || {},
  }, { onConflict: "country,district" });
  if (error) throw error;
}
export async function clearDistrictRule(country, district) {
  const { error } = await supabase.from("shipping_district_rules").delete().eq("country", country).eq("district", district);
  if (error) throw error;
}

// ---------- Regras por categoria ----------
const DEFAULT_KEY = "__default__";
export async function loadCategoryRules() {
  const { data, error } = await supabase.from("shipping_category_rules").select("*");
  if (error) throw error;
  const out = { default: [], bySlug: {} };
  (data || []).forEach((r) => {
    if (r.category_slug === DEFAULT_KEY) out.default = r.method_ids || [];
    else out.bySlug[r.category_slug] = r.method_ids || [];
  });
  return out;
}
export async function saveCategoryRule(slug, methodIds) {
  const { error } = await supabase.from("shipping_category_rules").upsert({
    category_slug: slug || DEFAULT_KEY, method_ids: methodIds || [],
  }, { onConflict: "category_slug" });
  if (error) throw error;
}
export async function clearCategoryRule(slug) {
  const { error } = await supabase.from("shipping_category_rules").delete().eq("category_slug", slug);
  if (error) throw error;
}

// ---------- Resolução no checkout (puro) ----------
// Método elegível = na zona do país de destino ∩ permitido por TODAS as categorias do carrinho
// (regra da categoria, ou a predefinida). O custo mantém-se o base do método.
export function resolveEligibleMethods({ methods, zones, categoryRules, country, cartCategories }) {
  const allIds = (methods || []).map((m) => m.id);
  const activeZones = (zones || []).filter((z) => z.active);
  const zone =
    activeZones.find((z) => z.name === country) ||
    activeZones.find((z) => z.name === "Internacional") ||
    activeZones.find((z) => z.name === "Resto da Europa");
  const zoneSet = new Set(zone ? zone.methodIds : allIds);

  const rules = categoryRules || { default: allIds, bySlug: {} };
  const cats = [...new Set((cartCategories || []).filter(Boolean))];
  const catSets = (cats.length ? cats : [null]).map((c) =>
    new Set((c && rules.bySlug && rules.bySlug[c]) || rules.default || allIds)
  );

  return (methods || []).filter((m) => zoneSet.has(m.id) && catSets.every((s) => s.has(m.id)));
}
