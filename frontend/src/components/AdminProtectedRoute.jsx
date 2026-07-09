import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STAFF_ROLES = ["super_admin", "admin", "producao", "afiliado"];

export const AdminProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/conta/login?redirect=/admin" replace />;

  if (!profile || !STAFF_ROLES.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--da-cream)]">
        <div className="text-center max-w-sm px-6">
          <p className="font-script text-[var(--da-leaf)] text-2xl mb-1">acesso restrito</p>
          <h1 className="text-2xl text-[var(--da-forest)]">Sem permissão</h1>
          <p className="font-body text-sm text-[var(--da-muted)] mt-3 leading-relaxed">
            A tua conta ({user.email}) não tem acesso ao painel administrativo.
          </p>
          <a href="/" className="btn-da btn-da-ghost inline-block mt-6">Voltar à loja</a>
        </div>
      </div>
    );
  }

  return children;
};
