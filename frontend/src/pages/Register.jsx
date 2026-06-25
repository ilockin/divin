import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Register = () => {
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    toast.success("Conta criada", { description: "Bem-vinda à DivinArte." });
    navigate("/conta");
  };

  return (
    <div className="container-da py-16 max-w-md mx-auto" data-testid="register-page">
      <p className="font-script text-[var(--da-leaf)] text-2xl text-center">junta-te a nós</p>
      <h1 className="text-3xl sm:text-4xl text-center mt-1">Criar conta</h1>

      <form onSubmit={submit} className="space-y-4 mt-8" data-testid="register-form">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Nome</span>
            <input required data-testid="reg-first-name" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
          </label>
          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Apelido</span>
            <input required data-testid="reg-last-name" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
          </label>
        </div>
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">E-mail</span>
          <input type="email" required data-testid="reg-email" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
        </label>
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Palavra-passe</span>
          <input type="password" required minLength={6} data-testid="reg-password" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
        </label>
        <button type="submit" className="btn-da btn-da-primary w-full" data-testid="reg-submit">Criar conta</button>
      </form>

      <p className="font-body text-sm text-[var(--da-muted)] text-center mt-6">
        Já tens conta? <Link to="/conta/login" className="text-[var(--da-forest)] underline" data-testid="reg-go-login">Iniciar sessão</Link>
      </p>
    </div>
  );
};
