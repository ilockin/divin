import React from "react";
import { useNavigate } from "react-router-dom";
import { Save, RotateCcw, X } from "lucide-react";

export const EditorTopBar = ({ title, onReset, onSave }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white border-b hairline px-4 py-3 flex items-center gap-3 flex-wrap">
      <p className="font-serif-display text-lg text-[var(--da-forest)] px-1">{title}</p>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => navigate("/admin")} data-testid="content-editor-cancel" className="btn-da btn-da-ghost text-xs">
          <X size={14} /> Cancelar
        </button>
        <button onClick={onReset} data-testid="content-editor-reset" className="btn-da btn-da-outline text-xs">
          <RotateCcw size={14} /> Repor predefinições
        </button>
        <button onClick={onSave} data-testid="content-editor-save" className="btn-da btn-da-primary text-xs">
          <Save size={14} /> Guardar
        </button>
      </div>
    </div>
  );
};
