import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const STORAGE_KEY = "divinarte-cart-v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
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
    toast.success(`${product.name} adicionado ao carrinho`, { description: "Podes continuar a explorar ou finalizar a compra." });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const shipping = subtotal === 0 ? 0 : subtotal >= 49 ? 0 : 4.9;
    return { subtotal, shipping, count, total: subtotal + shipping };
  }, [items]);

  const value = { items, addItem, removeItem, updateQty, clear, totals, drawerOpen, setDrawerOpen };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
