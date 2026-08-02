import React, { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { loadActivePopups } from "../lib/popups";
import { findProduct, products as catalogProducts } from "../data/mock";
import { BlockRenderer } from "./blocks/BlockRenderer";

const SEEN_KEY = "divinarte-popup-seen-v1";

const loadSeen = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
};

const markSeen = (popupId) => {
  const seen = loadSeen();
  seen[popupId] = true;
  sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen));
};

const matchesPlacement = (popup, pathname, categoriaParam) => {
  const { type, value } = popup.placement;
  if (type === "all") return true;

  if (type === "page") {
    if (value === "/blog/*") return pathname.startsWith("/blog/") && pathname !== "/blog";
    if (value === "/produto/*") return pathname.startsWith("/produto/");
    return pathname === value;
  }

  if (type === "category") {
    if (pathname.startsWith("/produto/")) {
      const slug = pathname.split("/produto/")[1];
      const product = findProduct(slug);
      return product?.category === value;
    }
    if (pathname === "/loja") return categoriaParam === value;
    return false;
  }

  return false;
};

export const PopupManager = () => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(null);
  const triggeredRef = useRef(false);

  // Carregados uma vez; o efeito dos acionadores abaixo tem de continuar síncrono para poder
  // devolver a função de limpeza dos timers e listeners.
  const [popups, setPopups] = useState([]);
  useEffect(() => { loadActivePopups().then(setPopups).catch(() => {}); }, []);

  useEffect(() => {
    triggeredRef.current = false;
    setActive(null);

    const categoriaParam = searchParams.get("categoria") || "";
    const seen = loadSeen();
    const candidates = popups.filter(
      (p) =>
        matchesPlacement(p, pathname, categoriaParam) &&
        !(p.frequency === "session" && seen[p.id])
    );
    if (candidates.length === 0) return;

    const cleanups = [];
    const show = (popup) => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setActive(popup);
      markSeen(popup.id);
    };

    candidates.forEach((popup) => {
      const { trigger } = popup;
      if (trigger.type === "time") {
        const timeoutId = setTimeout(() => show(popup), (trigger.seconds || 0) * 1000);
        cleanups.push(() => clearTimeout(timeoutId));
      } else if (trigger.type === "exit") {
        const onMouseLeave = (e) => { if (e.clientY <= 0) show(popup); };
        document.addEventListener("mouseleave", onMouseLeave);
        cleanups.push(() => document.removeEventListener("mouseleave", onMouseLeave));
      } else if (trigger.type === "scroll") {
        const onScroll = () => {
          const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
          const scrolled = scrollHeight - clientHeight > 0 ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
          if (scrolled >= (trigger.percent || 0)) show(popup);
        };
        window.addEventListener("scroll", onScroll);
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }
    });

    return () => cleanups.forEach((fn) => fn());
  }, [popups, pathname, searchParams]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
      onClick={() => setActive(null)}
      data-testid="popup-overlay"
    >
      <div
        className="bg-white rounded-2xl shadow-xl relative max-h-[90vh] overflow-y-auto"
        style={{ width: active.width, maxWidth: "100%" }}
        onClick={(e) => e.stopPropagation()}
        data-testid="popup-content"
      >
        <button
          onClick={() => setActive(null)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border hairline flex items-center justify-center shadow-sm z-10"
          aria-label="Fechar"
          data-testid="popup-close"
        >
          <X size={16} />
        </button>
        <BlockRenderer blocks={active.blocks} products={catalogProducts} />
      </div>
    </div>
  );
};
