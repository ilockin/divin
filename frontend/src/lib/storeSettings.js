import { supabase } from "./supabaseClient";

export async function getSettings(keys) {
  const { data, error } = await supabase
    .from("store_settings")
    .select("key, value")
    .in("key", keys);
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
}

export async function saveSettings(map) {
  const rows = Object.entries(map).map(([key, value]) => ({ key, value }));
  const { error } = await supabase
    .from("store_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) throw error;
}
