import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { GoogleButton } from "../components/GoogleButton";

export const Register = () => {
  const firstRef = useRef();
  const lastRef = useRef();
  const emailRef = useRef();
  const pwRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle("/conta");
    if (error) toast.error("Erro ao iniciar sessão com Google", { description: error.message });
  };

  const submit = async (e) => {
    e.preventDefault();
    const name = `${firstRef.current.value.trim()} ${lastRef.current.value.trim()}`.trim();
    const email = emailRef.current.value.trim();
    const password = pwRef.current.value;

    setSubmitting(true);
    const { error } = await signUp(email, password, name);
    setSubmitting(false);

    if (error) {
      if (error.message?.toLowerCase().includes("already registered")) {
        toast.error("E-mail já registado", { description: "Tenta iniciar sessão." });
      } else {
        toast.error("Erro ao criar conta", { description: error.message });
      }
      return;
    }

    toast.success("Conta criada", { description: "Bem-vinda à DivinArte." });
    navigate("/conta");
  };

  return (
    <div className="container-da py-16 max-w-md mx-auto" data-testid="register-page">
      <p className="font-script text-[var(--da-leaf)] text-2xl text-center">junta-te a nós</p>
      <h1 className="text-3xl sm:text-4xl text-center mt-1">Criar conta</h1>

      <div className="mt-8">
        <GoogleButton onClick={handleGoogle} testid="register-google" />
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--da-line)]" />
        <span className="font-body text-xs uppercase tracking-[0.2em] text-[var(--da-muted)]">ou</span>
        <div className="flex-1 h-px bg-[var(--da-line)]" />
      </div>

      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Nome</span>
            <input ref={firstRef} required data-testid="reg-first-name" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
          </label>
          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Apelido</span>
            <input ref={lastRef} required data-testid="reg-last-name" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
          </label>
        </div>
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">E-mail</span>
          <input ref={emailRef} type="email" required data-testid="reg-email" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
        </label>
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Palavra-passe</span>
          <input ref={pwRef} type="password" required minLength={6} data-testid="reg-password" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
        </label>
        <button type="submit" disabled={submitting} className="btn-da btn-da-primary w-full disabled:opacity-60" data-testid="reg-submit">
          {submitting ? "A criar conta…" : "Criar conta"}
        </button>
      </form>

      <p className="font-body text-sm text-[var(--da-muted)] text-center mt-6">
        Já tens conta? <Link to="/conta/login" className="text-[var(--da-forest)] underline" data-testid="reg-go-login">Iniciar sessão</Link>
      </p>
    </div>
  );
};
