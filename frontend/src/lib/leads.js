import { supabase } from "./supabaseClient";
import { submitPublicForm } from "./publicForms";

// Mensagens do formulário de contacto. A tabela é só do staff (são dados pessoais); a
// submissão pública passa pela Edge Function `public-forms`.

const normalize = (row) => ({
  id: row.id,
  status: row.status,
  note: row.note || "",
  fieldsSnapshot: row.fields_snapshot || [],
  values: row.values || {},
  submittedAt: row.created_at,
});

// Chamado pelo formulário de contacto público (sem AdminContext) para guardar uma nova submissão.
// fieldsSnapshot guarda os rótulos dos campos no momento da submissão, para a lista no admin
// continuar legível mesmo que os campos do formulário sejam alterados depois.
export const addLead = (values, fieldsSnapshot) => submitPublicForm("lead", { values, fieldsSnapshot });

export async function loadLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("id, status, note, fields_snapshot, values, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function updateLead(id, { status, note }) {
  const patch = {};
  if (status !== undefined) patch.status = status;
  if (note !== undefined) patch.note = note;
  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteLead(id) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}
