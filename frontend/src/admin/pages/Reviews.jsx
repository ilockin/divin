import React, { useState } from "react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { REVIEW_STATUSES } from "../data/mockReviews";
import { setReviewStatus, deleteReview } from "../../lib/reviews";

const statusOf = (id) => REVIEW_STATUSES.find((s) => s.id === id);
const productNameOf = (products, productId) => products.find((p) => p.id === productId)?.name || productId;

export const Reviews = () => {
  const { reviews, reloadReviews, products } = useAdmin();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const openReview = (review) => { setCurrent(review); setOpen(true); };

  const setStatus = async (review, status) => {
    try {
      await setReviewStatus(review.id, status);
      await reloadReviews();
      setCurrent((c) => (c && c.id === review.id ? { ...c, status } : c));
      toast.success(status === "aprovado" ? "Avaliação aprovada." : status === "rejeitado" ? "Avaliação rejeitada." : "Avaliação atualizada.");
    } catch (e) {
      toast.error("Erro ao atualizar", { description: e.message });
    }
  };

  const remove = async (review) => {
    if (!window.confirm("Remover esta avaliação?")) return;
    try {
      await deleteReview(review.id);
      await reloadReviews();
      if (current?.id === review.id) setOpen(false);
      toast.success("Avaliação removida.");
    } catch (e) {
      toast.error("Erro ao remover", { description: e.message });
    }
  };

  const columns = [
    { key: "submittedAt", label: "Data", sortable: true,
      render: (r) => new Date(r.submittedAt).toLocaleString("pt-PT") },
    { key: "product", label: "Produto",
      render: (r) => <span className="font-semibold text-[var(--da-forest)]">{productNameOf(products, r.productId)}</span> },
    { key: "name", label: "Cliente",
      render: (r) => (
        <div>
          <p className="text-[var(--da-ink)]">{r.name}</p>
          <p className="font-body text-[11px] text-[var(--da-muted)] mt-0.5">{r.email}</p>
        </div>
      ) },
    { key: "rating", label: "Estrelas",
      render: (r) => <span className="font-body text-sm text-[var(--da-leaf)]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span> },
    { key: "status", label: "Estado",
      render: (r) => <StatusBadge tone={statusOf(r.status)?.tone}>{statusOf(r.status)?.label}</StatusBadge> },
  ];

  return (
    <div data-testid="admin-reviews">
      <PageHeader title="Avaliações de Produtos" subtitle="Avaliações com 5 estrelas e comentário, submetidas por clientes que compraram o produto." />

      <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 font-body text-sm text-amber-900" data-testid="reviews-note">
        Avaliações guardadas neste navegador (mock, sem back-end). Novas avaliações ficam "Pendente" até serem aprovadas aqui — só depois aparecem na página do produto.
      </div>

      <DataTable
        testid="reviews-table"
        data={reviews}
        columns={columns}
        getRowId={(r) => r.id}
        searchKeys={[]}
        pageSize={10}
        rowActions={(r) => [
          { label: "Ver", onClick: () => openReview(r) },
          { label: "Aprovar", onClick: () => setStatus(r, "aprovado") },
          { label: "Rejeitar", onClick: () => setStatus(r, "rejeitado") },
          { label: "Remover", onClick: () => remove(r), danger: true },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Detalhe da avaliação"
        testid="review-modal"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-da btn-da-ghost text-xs">Fechar</button>
            <button onClick={() => setStatus(current, "rejeitado")} data-testid="review-reject" className="btn-da btn-da-ghost text-xs">Rejeitar</button>
            <button onClick={() => setStatus(current, "aprovado")} data-testid="review-approve" className="btn-da btn-da-primary text-xs">Aprovar</button>
          </>
        )}
      >
        {current && (
          <div className="space-y-4">
            <div>
              <p className="font-body text-[10px] tracking-[0.18em] uppercase text-[var(--da-forest)]">Produto</p>
              <p className="font-body text-sm text-[var(--da-ink)] mt-1">{productNameOf(products, current.productId)}</p>
            </div>
            <div>
              <p className="font-body text-[10px] tracking-[0.18em] uppercase text-[var(--da-forest)]">Cliente</p>
              <p className="font-body text-sm text-[var(--da-ink)] mt-1">{current.name} — {current.email}</p>
            </div>
            <div>
              <p className="font-body text-[10px] tracking-[0.18em] uppercase text-[var(--da-forest)]">Estrelas</p>
              <p className="font-body text-sm text-[var(--da-leaf)] mt-1">{"★".repeat(current.rating)}{"☆".repeat(5 - current.rating)}</p>
            </div>
            <div>
              <p className="font-body text-[10px] tracking-[0.18em] uppercase text-[var(--da-forest)]">Comentário</p>
              <p className="font-body text-sm text-[var(--da-ink)] mt-1 whitespace-pre-wrap">{current.comment || "—"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
