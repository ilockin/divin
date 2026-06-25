import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const STORAGE_KEY = "divinarte-cart-v1";
const PROMO_KEY = "divinarte-promo-v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [promo, setPromo] = useState(() => {
    try {
      const raw = localStorage.getItem(PROMO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    else localStorage.removeItem(PROMO_KEY);
  }, [promo]);

  const addItem = useCallback((product, qty = 1, options = {}) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size: product.size,
          qty,
        },
      ];
    });
    if (!options.silent) {
      toast.success(`${product.name} adicionado ao carrinho`, { description: "Podes continuar a explorar ou finalizar a compra." });
      setDrawerOpen(true);
    }
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const clear = useCallback(() => { setItems([]); setPromo(null); }, []);

  const applyPromo = useCallback((p) => setPromo(p), []);
  const clearPromo = useCallback(() => setPromo(null), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    // promo discount can't exceed subtotal
    let discount = 0;
    if (promo && promo.type === "percent") discount = subtotal * promo.value;
    else if (promo && promo.type === "amount") discount = Math.min(subtotal, promo.value);
    if (items.length === 0) discount = 0;
    discount = Math.min(discount, subtotal);
    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount === 0 ? 0 : afterDiscount >= 49 ? 0 : 4.9;
    return { subtotal, discount, shipping, count, total: afterDiscount + shipping };
  }, [items, promo]);

  const value = { items, promo, addItem, removeItem, updateQty, clear, applyPromo, clearPromo, totals, drawerOpen, setDrawerOpen };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
