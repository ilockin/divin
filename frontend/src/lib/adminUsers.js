import { supabase } from "./supabaseClient";

async function call(action, params = {}) {
  const { data, error } = await supabase.functions.invoke("admin-users", { body: { action, ...params } });
  if (error) {
    // tentar extrair a mensagem do corpo da resposta
    try { const j = await error.context?.json?.(); if (j?.error) throw new Error(j.error); } catch (e) { if (e.message) throw e; }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const listUsers = () => call("list").then((d) => d.users || []);
export const createUser = (u) => call("create", u);
export const updateUser = (userId, patch) => call("update", { userId, ...patch });
export const setUserPassword = (userId, password) => call("setPassword", { userId, password });
export const deleteUser = (userId) => call("delete", { userId });
