import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { loadApprovedReviews, getRatingSummary, canReview, addReview } from "../lib/reviews";
import { useAuth } from "../context/AuthContext";

const StarRow = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} className={n <= rating ? "fill-[var(--da-leaf)] text-[var(--da-leaf)]" : "text-[var(--da-line)]"} />
    ))}
  </div>
);

const emptyForm = { rating: 0, comment: "" };

export const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [approved, setApproved] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [form, setForm] = useState(emptyForm);
  const [hoverRating, setHoverRating] = useState(0);
  const [sending, setSending] = useState(false);
  // A identidade de quem avalia vem da sessão, não do formulário — quem escrevesse o e-mail
  // de um cliente podia antes publicar em nome dele.
  const [allowed, setAllowed] = useState(false);

  const refresh = useCallback(() => {
    loadApprovedReviews(productId).then(setApproved).catch(() => {});
    getRatingSummary(productId).then(setSummary).catch(() => {});
  }, [productId]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) { setAllowed(false); return; }
    canReview(productId).then(setAllowed).catch(() => setAllowed(false));
  }, [user, productId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating || !form.comment.trim()) {
      toast.error("Escolhe as estrelas e escreve um comentário.");
      return;
    }
    setSending(true);
    try {
      await addReview({ productId, rating: form.rating, comment: form.comment.trim() });
      toast.success("Avaliação enviada — fica visível depois de aprovada.");
      setForm(emptyForm);
    } catch (err) {
      toast.error("Não foi possível enviar", { description: err.message });
    } finally {
      setSending(false);
    }
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

      {!user && (
        <div className="bg-[var(--da-cream-2)]/60 rounded-2xl p-6 sm:p-8" data-testid="review-login-prompt">
          <h3 className="text-lg">Deixe a sua avaliação</h3>
          <p className="font-body text-sm text-[var(--da-muted)] mt-2 leading-relaxed">
            Só clientes que compraram este produto podem avaliar.{" "}
            <Link to="/conta/login" className="link-underline text-[var(--da-forest)]">Inicie sessão</Link> para deixar a sua opinião.
          </p>
        </div>
      )}

      {user && !allowed && (
        <div className="bg-[var(--da-cream-2)]/60 rounded-2xl p-6 sm:p-8" data-testid="review-not-allowed">
          <h3 className="text-lg">Deixe a sua avaliação</h3>
          <p className="font-body text-sm text-[var(--da-muted)] mt-2 leading-relaxed">
            Só é possível avaliar produtos de uma encomenda já paga. Ainda não encontrámos nenhuma na sua conta com este produto.
          </p>
        </div>
      )}

      {user && allowed && (
      <form onSubmit={submit} className="bg-[var(--da-cream-2)]/60 rounded-2xl p-6 sm:p-8 space-y-4" data-testid="review-form">
        <h3 className="text-lg">Deixe a sua avaliação</h3>
        <p className="font-body text-xs text-[var(--da-muted)]">A avaliação fica publicada em seu nome, depois de aprovada.</p>

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

        <button type="submit" disabled={sending} className="btn-da btn-da-primary disabled:opacity-60" data-testid="review-submit">
          {sending ? "A enviar…" : "Enviar avaliação"}
        </button>
      </form>
      )}
    </section>
  );
};
