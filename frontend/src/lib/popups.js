import { supabase } from "./supabaseClient";

// Pop-ups com regras de acionamento. Sem dados pessoais: a loja lê os ativos sem sessão.
const FIELDS = "id, name, status, width, blocks, trigger, placement, frequency";

const normalize = (row) => ({
  ...row,
  blocks: row.blocks || [],
  trigger: row.trigger || {},
  placement: row.placement || {},
});

// Loja: só os ativos (o RLS já filtra, mas o filtro explícito diz a intenção e protege quem
// chamar isto com sessão de staff).
export async function loadActivePopups() {
  const { data, error } = await supabase.from("popups").select(FIELDS).eq("status", "ativo");
  if (error) throw error;
  return (data || []).map(normalize);
}

// Usada pelo construtor: carrega o pop-up pelo id, ativo ou não (RLS de staff).
export async function getPopup(id) {
  const { data, error } = await supabase.from("popups").select(FIELDS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

// Admin: todos.
export async function loadPopups() {
  const { data, error } = await supabase
    .from("popups")
    .select(FIELDS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

const toRow = (p) => ({
  name: p.name,
  status: p.status || "inativo",
  width: p.width ?? 480,
  blocks: p.blocks || [],
  trigger: p.trigger || {},
  placement: p.placement || {},
  frequency: p.frequency || "session",
});

// Devolve a linha criada — o id é gerado pela base de dados (uuid) e é preciso para navegar
// logo a seguir para o construtor do pop-up.
export async function createPopup(popup) {
  const { data, error } = await supabase.from("popups").insert(toRow(popup)).select(FIELDS).single();
  if (error) throw error;
  return normalize(data);
}

export async function updatePopup(id, patch) {
  const row = { updated_at: new Date().toISOString() };
  ["name", "status", "width", "blocks", "trigger", "placement", "frequency"].forEach((k) => {
    if (patch[k] !== undefined) row[k] = patch[k];
  });
  const { error } = await supabase.from("popups").update(row).eq("id", id);
  if (error) throw error;
}

export async function deletePopup(id) {
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) throw error;
}
