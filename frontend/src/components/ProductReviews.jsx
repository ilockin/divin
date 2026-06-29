import React, { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { loadApprovedReviews, getRatingSummary, canReview, addReview } from "../lib/reviews";

const StarRow = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} className={n <= rating ? "fill-[var(--da-leaf)] text-[var(--da-leaf)]" : "text-[var(--da-line)]"} />
    ))}
  </div>
);

const emptyForm = { name: "", email: "", rating: 0, comment: "" };

export const ProductReviews = ({ productId }) => {
  const [approved, setApproved] = useState(() => loadApprovedReviews(productId));
  const [summary, setSummary] = useState(() => getRatingSummary(productId));
  const [form, setForm] = useState(emptyForm);
  const [hoverRating, setHoverRating] = useState(0);

  const refresh = () => {
    setApproved(loadApprovedReviews(productId));
    setSummary(getRatingSummary(productId));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.rating || !form.comment.trim()) {
      toast.error("Preencha o nome, e-mail, estrelas e comentário.");
      return;
    }
    if (!canReview(form.email, productId)) {
      toast.error("Só clientes que compraram este produto podem avaliar.");
      return;
    }
    addReview({ productId, name: form.name.trim(), email: form.email.trim(), rating: form.rating, comment: form.comment.trim() });
    toast.success("Avaliação enviada — fica visível depois de aprovada.");
    setForm(emptyForm);
  };

  return (
    <section className="mt-24" data-testid="product-reviews">
      <h2 className="text-2xl sm:text-3xl mb-2">Avaliações de clientes</h2>

      <div className="flex items-center gap-3 mb-8" data-testid="reviews-summary">
        <StarRow rating={Math.round(summary.average)} />
        <span className="font-body text-sm text-[var(--da-muted)]">
          {summary.count > 0
            ? `${summary.average.toFixed(1)} de 5 — ${summary.count} ${summary.count > 1 ? "avaliações" : "avaliação"}`
            : "Ainda sem avaliações"}
        </span>
      </div>

      {approved.length > 0 && (
        <div className="space-y-5 mb-10" data-testid="reviews-list">
          {approved.map((r) => (
            <div key={r.id} className="border-b hairline pb-5">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-semibold text-[var(--da-forest)]">{r.name}</p>
                <span className="font-body text-xs text-[var(--da-muted)]">{new Date(r.submittedAt).toLocaleDateString("pt-PT")}</span>
              </div>
              <StarRow rating={r.rating} size={14} />
              <p className="font-body text-sm text-[var(--da-ink)] mt-2 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="bg-[var(--da-cream-2)]/60 rounded-2xl p-6 sm:p-8 space-y-4" data-testid="review-form">
        <h3 className="text-lg">Deixe a sua avaliação</h3>
        <p className="font-body text-xs text-[var(--da-muted)]">Só clientes que compraram este produto podem avaliar.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="w-full rounded-xl border hairline px-4 py-2.5 font-body text-sm bg-white"
            placeholder="O seu nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            data-testid="review-name"
          />
          <input
            className="w-full rounded-xl border hairline px-4 py-2.5 font-body text-sm bg-white"
            placeholder="O seu e-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            data-testid="review-email"
          />
        </div>

        <div data-testid="review-rating-input">
          <p className="text-xs tracking-[0.22em] uppercase text-[var(--da-forest)] mb-2">Estrelas</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: n }))}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${n} estrelas`}
                data-testid={`review-star-${n}`}
              >
                <Star size={24} className={n <= (hoverRating || form.rating) ? "fill-[var(--da-leaf)] text-[var(--da-leaf)]" : "text-[var(--da-line)]"} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          className="w-full rounded-xl border hairline px-4 py-2.5 font-body text-sm bg-white"
          placeholder="O que achou do produto?"
          value={form.comment}
          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          data-testid="review-comment"
        />

        <button type="submit" className="btn-da btn-da-primary" data-testid="review-submit">Enviar avaliação</button>
      </form>
    </section>
  );
};
