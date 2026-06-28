import React from "react";
import { Pencil } from "lucide-react";

// Wrapper de uma secção clicável no canvas do editor: contorno ao passar o rato/selecionar
// + selo com o nome da secção. Usado por qualquer editor de conteúdo (Home, Sobre, Contacto, ...).
export const SelectableSection = ({ label, selected, onSelect, testid, children }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onSelect(); }}
    data-testid={testid}
    className={`relative group ${selected ? "ring-2 ring-[var(--da-leaf)]" : "ring-1 ring-transparent hover:ring-[var(--da-line)]"}`}
  >
    <div className={`absolute z-10 top-3 right-3 transition ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--da-forest)] text-white font-body text-xs shadow-sm">
        <Pencil size={12} /> {label}
      </span>
    </div>
    {children}
  </div>
);
