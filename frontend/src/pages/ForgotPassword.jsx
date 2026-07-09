import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/conta/nova-senha`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar e-mail", { description: error.message });
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="container-da py-16 max-w-md mx-auto text-center" data-testid="forgot-sent">
        <p className="font-script text-[var(--da-leaf)] text-2xl">verifica o teu e-mail</p>
        <h1 className="text-3xl sm:text-4xl mt-1">E-mail enviado</h1>
        <p className="font-body text-sm text-[var(--da-muted)] mt-4 leading-relaxed">
          Se <strong className="text-[var(--da-forest)]">{email}</strong> estiver registado, irás receber as instruções para redefinir a tua palavra-passe em breve.
        </p>
        <Link to="/conta/login" className="btn-da btn-da-primary inline-block mt-8">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="container-da py-16 max-w-md mx-auto" data-testid="forgot-page">
      <p className="font-script text-[var(--da-leaf)] text-2xl text-center">recuperar acesso</p>
      <h1 className="text-3xl sm:text-4xl text-center mt-1">Esqueceste a palavra-passe?</h1>
      <p className="font-body text-sm text-[var(--da-muted)] text-center mt-4 leading-relaxed">
        Indica o teu e-mail e enviamos um link para redefinires a tua palavra-passe.
      </p>

      <form onSubmit={submit} className="space-y-4 mt-8" data-testid="forgot-form">
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="forgot-email"
            className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="btn-da btn-da-primary w-full disabled:opacity-60"
          data-testid="forgot-submit"
        >
          {submitting ? "A enviar…" : "Enviar link de recuperação"}
        </button>
      </form>

      <p className="font-body text-sm text-[var(--da-muted)] text-center mt-6">
        <Link to="/conta/login" className="text-[var(--da-forest)] underline">Voltar ao login</Link>
      </p>
    </div>
  );
};
