import { supabase } from "./supabaseClient";

export const loadAddresses = async (userId) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

export const addAddress = async (userId, values) => {
  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...values, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAddress = async (id, values) => {
  const { data, error } = await supabase.from("addresses").update(values).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const removeAddress = async (id) => {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
};

export const setDefaultAddress = async (userId, id) => {
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  if (error) throw error;
};
