// Código de afiliado capturado do ?ref= e guardado até à compra.
const KEY = "divinarte-ref";

export const captureAffiliateRef = (search) => {
  try {
    const ref = new URLSearchParams(search ?? window.location.search).get("ref");
    if (ref && ref.trim()) localStorage.setItem(KEY, ref.trim().toUpperCase());
  } catch { /* ignora */ }
};

export const getAffiliateRef = () => {
  try { return localStorage.getItem(KEY) || null; } catch { return null; }
};

export const clearAffiliateRef = () => {
  try { localStorage.removeItem(KEY); } catch { /* ignora */ }
};
