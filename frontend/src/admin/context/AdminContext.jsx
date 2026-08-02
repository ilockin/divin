import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ROLES, adminOrders, adminAttributes, stockMovements as initialMovements, storeSettings as initialSettings } from "../data/mockAdmin";
import { useAuth } from "../../context/AuthContext";
import { loadArticles } from "../../lib/articles";
import { initialLanguages, initialShippingZones, initialDistrictRules, initialCategoryRules } from "../data/mockErp";
import { listPurchases } from "../../lib/adminPurchases";
import { listAllMethods } from "../../lib/adminShipping";
import { listInsumos, loadRecipes, listProductionOrders } from "../../lib/adminProduction";
import { listAllProducts } from "../../lib/adminProducts";
import { initialCoupons } from "../data/mockMarketing";
import { loadPages } from "../../lib/pages";
import { initialHomeContent } from "../data/mockHomeContent";
import { initialAboutContent } from "../data/mockAboutContent";
import { initialFooterContent } from "../data/mockFooterContent";
import { initialContactContent } from "../data/mockContactContent";
import { initialBlogContent } from "../data/mockBlogContent";
import { initialMenuContent } from "../data/mockMenuContent";
import { initialIntegrations } from "../data/mockIntegrations";
import { loadPopups } from "../../lib/popups";
import { loadSubscribers } from "../../lib/newsletter";
import { loadHomeContent, saveHomeContent } from "../../lib/homeContent";
import { loadAboutContent, saveAboutContent } from "../../lib/aboutContent";
import { loadFooterContent, saveFooterContent } from "../../lib/footerContent";
import { loadLeads } from "../../lib/leads";
import { listReviews } from "../../lib/reviews";
import { loadContactContent, saveContactContent } from "../../lib/contactContent";
import { loadIntegrations, saveIntegrations } from "../../lib/integrations";
import { loadBlogContent, saveBlogContent } from "../../lib/blogContent";
import { loadMenuContent, saveMenuContent } from "../../lib/menuContent";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const { user: authUser, profile: authProfile } = useAuth();
  const realRole = authProfile?.role || "admin";
  const [viewAsRole, setViewAsRole] = useState(null);
  const [productsList, setProductsList] = useState([]);
  useEffect(() => { listAllProducts().then(setProductsList).catch(() => {}); }, []);
  const [orders, setOrders] = useState(adminOrders);
  const [attributes, setAttributes] = useState(adminAttributes);
  const [movements, setMovements] = useState(initialMovements);
  const [settings, setSettings] = useState(initialSettings);
  // Produção / ERP
  const [insumos, setInsumos] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [productionOrders, setProductionOrders] = useState([]);
  useEffect(() => { listInsumos().then(setInsumos).catch(() => {}); }, []);
  useEffect(() => { loadRecipes().then(setRecipes).catch(() => {}); }, []);
  useEffect(() => { listProductionOrders().then(setProductionOrders).catch(() => {}); }, []);
  const [purchases, setPurchases] = useState([]);
  useEffect(() => { listPurchases().then(setPurchases).catch(() => {}); }, []);
  // Envios & idiomas (partilhados com /admin/envios)
  const [shippingMethods, setShippingMethods] = useState([]);
  useEffect(() => { listAllMethods().then(setShippingMethods).catch(() => {}); }, []);
  const [languages, setLanguages] = useState(initialLanguages);
  const [shippingZones, setShippingZones] = useState(initialShippingZones);
  const [districtRules, setDistrictRules] = useState(initialDistrictRules);
  const [categoryRules, setCategoryRules] = useState(initialCategoryRules);
  const [coupons, setCoupons] = useState(initialCoupons);

  // Interações públicas (Supabase). Sem auto-save: a gravação é sempre explícita, pelas
  // funções das libs respetivas.
  const [popups, setPopups] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [reviews, setReviews] = useState([]);

  const reloadPopups = useCallback(() => loadPopups().then(setPopups), []);
  const reloadSubscribers = useCallback(() => loadSubscribers().then(setSubscribers), []);
  const reloadLeads = useCallback(() => loadLeads().then(setLeads), []);
  const reloadReviews = useCallback(() => listReviews().then(setReviews), []);

  useEffect(() => { reloadPopups().catch(() => {}); }, [reloadPopups]);
  useEffect(() => { reloadSubscribers().catch(() => {}); }, [reloadSubscribers]);
  useEffect(() => { reloadLeads().catch(() => {}); }, [reloadLeads]);
  useEffect(() => { reloadReviews().catch(() => {}); }, [reloadReviews]);

  // Conteúdo editorial (Supabase). Arranca nos valores de fábrica e é substituído quando a
  // resposta chega — sem auto-save por useEffect: com escrita de rede, gravaria na montagem
  // e a cada tecla. A gravação é explícita, pelos save*() abaixo.
  const [pages, setPages] = useState([]);
  const [articles, setArticles] = useState([]);
  const [homeContent, setHomeContent] = useState(initialHomeContent);
  const [aboutContent, setAboutContent] = useState(initialAboutContent);
  const [footerContent, setFooterContent] = useState(initialFooterContent);
  const [contactContent, setContactContent] = useState(initialContactContent);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [blogContent, setBlogContent] = useState(initialBlogContent);
  const [menuContent, setMenuContent] = useState(initialMenuContent);

  const reloadArticles = useCallback(() => loadArticles().then(setArticles), []);
  const reloadPages = useCallback(() => loadPages().then(setPages), []);

  useEffect(() => { reloadArticles().catch(() => {}); }, [reloadArticles]);
  useEffect(() => { reloadPages().catch(() => {}); }, [reloadPages]);
  useEffect(() => { loadHomeContent().then(setHomeContent).catch(() => {}); }, []);
  useEffect(() => { loadAboutContent().then(setAboutContent).catch(() => {}); }, []);
  useEffect(() => { loadFooterContent().then(setFooterContent).catch(() => {}); }, []);
  useEffect(() => { loadContactContent().then(setContactContent).catch(() => {}); }, []);
  useEffect(() => { loadIntegrations().then(setIntegrations).catch(() => {}); }, []);
  useEffect(() => { loadBlogContent().then(setBlogContent).catch(() => {}); }, []);
  useEffect(() => { loadMenuContent().then(setMenuContent).catch(() => {}); }, []);

  // Gravadores explícitos: persistem primeiro e só depois atualizam o estado, para o ecrã
  // nunca mostrar como guardado aquilo que a base de dados recusou.
  const persistHomeContent = useCallback(async (v) => { await saveHomeContent(v); setHomeContent(v); }, []);
  const persistAboutContent = useCallback(async (v) => { await saveAboutContent(v); setAboutContent(v); }, []);
  const persistFooterContent = useCallback(async (v) => { await saveFooterContent(v); setFooterContent(v); }, []);
  const persistContactContent = useCallback(async (v) => { await saveContactContent(v); setContactContent(v); }, []);
  const persistBlogContent = useCallback(async (v) => { await saveBlogContent(v); setBlogContent(v); }, []);
  const persistMenuContent = useCallback(async (v) => { await saveMenuContent(v); setMenuContent(v); }, []);
  const persistIntegrations = useCallback(async (v) => { await saveIntegrations(v); setIntegrations(v); }, []);

  const role = (realRole === "super_admin" && viewAsRole) ? viewAsRole : realRole;

  const switchRole = (id) => {
    if (realRole !== "super_admin") return;
    setViewAsRole(id === realRole ? null : id);
  };

  const me = useMemo(() => ({
    name: authProfile?.name || authUser?.email?.split("@")[0] || "Admin",
    email: authUser?.email || "—",
    role,
    roleLabel: ROLES.find((r) => r.id === role)?.label || "—",
    affiliateCode: authProfile?.affiliate_code || undefined,
    affiliateActive: authProfile?.affiliate_active !== false,
  }), [authProfile, authUser, role]);

  const value = {
    me, role, switchRole, canSwitchRole: realRole === "super_admin",
    products: productsList, setProducts: setProductsList,
    orders, setOrders,
    articles, setArticles, reloadArticles,
    attributes, setAttributes,
    movements, setMovements,
    settings, setSettings,
    insumos, setInsumos,
    recipes, setRecipes,
    productionOrders, setProductionOrders,
    purchases, setPurchases,
    shippingMethods, setShippingMethods,
    languages, setLanguages,
    shippingZones, setShippingZones,
    districtRules, setDistrictRules,
    categoryRules, setCategoryRules,
    pages, setPages, reloadPages,
    popups, setPopups, reloadPopups,
    subscribers, setSubscribers, reloadSubscribers,
    coupons, setCoupons,
    leads, setLeads, reloadLeads,
    reviews, setReviews, reloadReviews,
    homeContent, saveHomeContent: persistHomeContent,
    aboutContent, saveAboutContent: persistAboutContent,
    footerContent, saveFooterContent: persistFooterContent,
    contactContent, saveContactContent: persistContactContent,
    blogContent, saveBlogContent: persistBlogContent,
    menuContent, saveMenuContent: persistMenuContent,
    integrations, saveIntegrations: persistIntegrations,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};
