import React, { createContext, useContext, useMemo, useState } from "react";
import { ROLES, adminUsers, adminProducts, adminOrders, adminArticles, adminAttributes, stockMovements as initialMovements, storeSettings as initialSettings } from "../data/mockAdmin";

const AdminContext = createContext(null);

const STORAGE_ROLE = "divinarte-admin-role-v1";

export const AdminProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_ROLE) || "super_admin");
  const [users, setUsers] = useState(adminUsers);
  const [productsList, setProductsList] = useState(adminProducts);
  const [orders, setOrders] = useState(adminOrders);
  const [articles, setArticles] = useState(adminArticles);
  const [attributes, setAttributes] = useState(adminAttributes);
  const [movements, setMovements] = useState(initialMovements);
  const [settings, setSettings] = useState(initialSettings);

  const switchRole = (id) => {
    setRole(id);
    localStorage.setItem(STORAGE_ROLE, id);
  };

  const me = useMemo(() => ({
    name: "Ana Lopes",
    email: "ana.lopes@divinarte.pt",
    role,
    roleLabel: ROLES.find((r) => r.id === role)?.label || "—",
  }), [role]);

  const value = {
    me, role, switchRole,
    users, setUsers,
    products: productsList, setProducts: setProductsList,
    orders, setOrders,
    articles, setArticles,
    attributes, setAttributes,
    movements, setMovements,
    settings, setSettings,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};
