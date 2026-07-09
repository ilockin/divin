import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error("Erro ao redefinir", { description: error.message });
      return;
    }
    toast.success("Palavra-passe atualizada", { description: "Podes iniciar sessão com a nova palavra-passe." });
    navigate("/conta");
  };

  if (!ready) {
    return (
      <div className="container-da py-16 max-w-md mx-auto text-center">
        <p className="font-body text-sm text-[var(--da-muted)]">A verificar link de recuperação…</p>
      </div>
    );
  }

  return (
    <div className="container-da py-16 max-w-md mx-auto" data-testid="reset-page">
      <p className="font-script text-[var(--da-leaf)] text-2xl text-center">nova palavra-passe</p>
      <h1 className="text-3xl sm:text-4xl text-center mt-1">Redefinir palavra-passe</h1>

      <form onSubmit={submit} className="space-y-4 mt-8" data-testid="reset-form">
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Nova palavra-passe</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="reset-password"
            className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]"
          />
        </label>
        <label className="block">
          <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Confirmar palavra-passe</span>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            data-testid="reset-confirm"
            className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="btn-da btn-da-primary w-full disabled:opacity-60"
          data-testid="reset-submit"
        >
          {saving ? "A guardar…" : "Guardar nova palavra-passe"}
        </button>
      </form>
    </div>
  );
};
