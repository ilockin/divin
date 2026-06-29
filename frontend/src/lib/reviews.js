import { initialReviews } from "../admin/data/mockReviews";
import { adminOrders } from "../admin/data/mockAdmin";

const REVIEWS_KEY = "divinarte-reviews-v1";

export const loadReviews = () => {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : initialReviews;
  } catch {
    return initialReviews;
  }
};

export const saveReviews = (reviews) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

// Verificação de compra (mock): existe uma encomenda paga, do e-mail indicado, com este produto.
export const canReview = (email, productId) => {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return false;
  return adminOrders.some(
    (o) =>
      o.payment === "pago" &&
      o.customer.email.toLowerCase() === normalized &&
      o.items.some((it) => it.id === productId)
  );
};

// Chamado pelo formulário de avaliação na página de produto (sem AdminContext).
export const addReview = ({ productId, name, email, rating, comment }) => {
  const reviews = loadReviews();
  const review = {
    id: "rev-" + Date.now(),
    productId,
    name,
    email,
    rating,
    comment,
    submittedAt: new Date().toISOString(),
    status: "pendente",
  };
  saveReviews([review, ...reviews]);
  return review;
};

export const loadApprovedReviews = (productId) =>
  loadReviews()
    .filter((r) => r.productId === productId && r.status === "aprovado")
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

export const getRatingSummary = (productId) => {
  const approved = loadApprovedReviews(productId);
  if (approved.length === 0) return { average: 0, count: 0 };
  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / approved.length) * 10) / 10, count: approved.length };
};
