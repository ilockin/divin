import React, { useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export const Modal = ({ open, onClose, title, children, footer, size = "md", testid = "modal" }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid={testid}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} data-testid={`${testid}-backdrop`} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] flex flex-col`} style={{ fontFamily: "Montserrat, sans-serif" }}>
        <header className="px-6 py-4 border-b hairline flex items-center justify-between">
          <h3 className="font-serif-display text-lg tracking-[0.1em] text-[var(--da-forest)]">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" data-testid={`${testid}-close`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center">
            <X size={16} />
          </button>
        </header>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && <footer className="px-6 py-4 border-t hairline flex gap-3 justify-end bg-[var(--da-cream-2)]/30 rounded-b-2xl">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
};
