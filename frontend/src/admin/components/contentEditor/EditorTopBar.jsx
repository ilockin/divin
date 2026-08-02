import React from "react";
import { useNavigate } from "react-router-dom";
import { Save, RotateCcw, X } from "lucide-react";

// `pages`: lista opcional [{ label, path }] das outras páginas editáveis, para o seletor "Editar outra página".
// `isDirty`/`onSave`: usados para perguntar antes de navegar com alterações por guardar.
export const EditorTopBar = ({ title, onReset, onSave, pages, isDirty, saving }) => {
  const navigate = useNavigate();

  const guardedNavigate = async (path) => {
    if (isDirty) {
      if (window.confirm("Tens alterações não guardadas. Queres guardá-las agora?")) {
        // Esperar pela gravação: sair antes disso esconderia um erro de escrita.
        await onSave();
        navigate(path);
        return;
      }
      if (!window.confirm("Continuar sem guardar?")) return;
    }
    navigate(path);
  };

  return (
    <div className="bg-white border-b hairline px-4 py-3 flex items-center gap-3 flex-wrap">
      <p className="font-serif-display text-lg text-[var(--da-forest)] px-1">{title}</p>

      {pages && pages.length > 0 && (
        <select
          onChange={(e) => { if (e.target.value) guardedNavigate(e.target.value); }}
          value=""
          data-testid="content-editor-page-switcher"
          className="border hairline rounded-lg px-3 py-2 font-body text-xs bg-white"
        >
          <option value="">Editar outra página…</option>
          {pages.map((p) => (<option key={p.path} value={p.path}>{p.label}</option>))}
        </select>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => guardedNavigate("/admin")} data-testid="content-editor-cancel" className="btn-da btn-da-ghost text-xs">
          <X size={14} /> Cancelar
        </button>
        <button onClick={onReset} data-testid="content-editor-reset" className="btn-da btn-da-outline text-xs">
          <RotateCcw size={14} /> Repor predefinições
        </button>
        <button onClick={onSave} disabled={saving} data-testid="content-editor-save" className="btn-da btn-da-primary text-xs disabled:opacity-60">
          <Save size={14} /> {saving ? "A guardar…" : "Guardar"}
        </button>
      </div>
    </div>
  );
};
