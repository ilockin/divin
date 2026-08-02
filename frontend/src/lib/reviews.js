import { supabase } from "./supabaseClient";
import { submitPublicForm } from "./publicForms";

// Avaliações de produto. A loja lê a vista public_reviews (só aprovadas, sem o e-mail do
// autor); o staff lê e modera a tabela. A escrita é sempre pela Edge Function `public-forms`,
// que verifica no servidor se quem submete comprou mesmo o produto.

const normalize = (row) => ({
  id: row.id,
  productId: row.product_id,
  name: row.name,
  email: row.email,
  rating: row.rating,
  comment: row.comment,
  status: row.status,
  submittedAt: row.created_at,
});

// ── Loja ──────────────────────────────────────────────────────────────────────

export async function loadApprovedReviews(productId) {
  const { data, error } = await supabase
    .from("public_reviews")
    .select("id, product_id, name, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function getRatingSummary(productId) {
  const approved = await loadApprovedReviews(productId);
  if (approved.length === 0) return { average: 0, count: 0 };
  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / approved.length) * 10) / 10, count: approved.length };
}

// Decide se o formulário aparece. A decisão que conta é a da Edge Function — esta serve só
// para não mostrar um formulário que iria ser recusado.
export async function canReview(productId) {
  const { data, error } = await supabase.rpc("can_review", { p_product_id: productId });
  if (error) return false;
  return data === true;
}

// O nome e o e-mail não são enviados: a Edge Function tira-os da sessão.
export const addReview = ({ productId, rating, comment }) =>
  submitPublicForm("review", { productId, rating, comment });

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function listReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, name, email, rating, comment, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function setReviewStatus(id, status) {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
