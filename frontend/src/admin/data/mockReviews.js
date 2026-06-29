// Avaliações de produto — guardadas em localStorage (ver lib/reviews.js).
// Só clientes com uma encomenda paga com o produto em questão podem avaliar.

export const REVIEW_STATUSES = [
  { id: "pendente", label: "Pendente", tone: "amber" },
  { id: "aprovado", label: "Aprovado", tone: "green" },
  { id: "rejeitado", label: "Rejeitado", tone: "red" },
];

export const initialReviews = [
  {
    id: "rev-1001",
    productId: "p01",
    name: "Ana Lopes",
    email: "ana.lopes@example.pt",
    rating: 5,
    comment: "Adoro a textura e o aroma, sinto a pele muito mais hidratada.",
    submittedAt: "2025-11-05T10:00:00",
    status: "aprovado",
  },
  {
    id: "rev-1002",
    productId: "p01",
    name: "Beatriz Santos",
    email: "beatriz.santos@example.pt",
    rating: 4,
    comment: "Muito bom, só achei o frasco um pouco pequeno para o preço.",
    submittedAt: "2025-11-10T15:30:00",
    status: "pendente",
  },
];
