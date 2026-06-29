import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ROLES, adminUsers, adminProducts, adminOrders, adminAttributes, stockMovements as initialMovements, storeSettings as initialSettings } from "../data/mockAdmin";
import { loadArticles, saveArticles } from "../../lib/articles";
import { initialInsumos, initialRecipes, initialProductionOrders, initialPurchases, initialShippingMethods, initialLanguages, initialShippingZones, initialDistrictRules, initialCategoryRules } from "../data/mockErp";
import { initialCoupons } from "../data/mockMarketing";
import { loadPages, savePages } from "../../lib/pages";
import { loadPopups, savePopups } from "../../lib/popups";
import { loadSubscribers, saveSubscribers } from "../../lib/newsletter";
import { loadHomeContent, saveHomeContent } from "../../lib/homeContent";
import { loadAboutContent, saveAboutContent } from "../../lib/aboutContent";
import { loadFooterContent, saveFooterContent } from "../../lib/footerContent";
import { loadLeads, saveLeads } from "../../lib/leads";
import { loadReviews, saveReviews } from "../../lib/reviews";
import { loadContactContent, saveContactContent } from "../../lib/contactContent";
import { loadIntegrations, saveIntegrations } from "../../lib/integrations";
import { loadBlogContent, saveBlogContent } from "../../lib/blogContent";
import { loadMenuContent, saveMenuContent } from "../../lib/menuContent";

const AdminContext = createContext(null);

const STORAGE_ROLE = "divinarte-admin-role-v1";

export const AdminProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_ROLE) || "super_admin");
  const [users, setUsers] = useState(adminUsers);
  const [productsList, setProductsList] = useState(adminProducts);
  const [orders, setOrders] = useState(adminOrders);
  const [articles, setArticles] = useState(loadArticles);
  const [attributes, setAttributes] = useState(adminAttributes);
  const [movements, setMovements] = useState(initialMovements);
  const [settings, setSettings] = useState(initialSettings);
  // Produção / ERP
  const [insumos, setInsumos] = useState(initialInsumos);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [productionOrders, setProductionOrders] = useState(initialProductionOrders);
  const [purchases, setPurchases] = useState(initialPurchases);
  // Envios & idiomas (partilhados com /admin/envios)
  const [shippingMethods, setShippingMethods] = useState(initialShippingMethods);
  const [languages, setLanguages] = useState(initialLanguages);
  const [shippingZones, setShippingZones] = useState(initialShippingZones);
  const [districtRules, setDistrictRules] = useState(initialDistrictRules);
  const [categoryRules, setCategoryRules] = useState(initialCategoryRules);
  const [pages, setPages] = useState(loadPages);
  const [popups, setPopups] = useState(loadPopups);
  const [subscribers, setSubscribers] = useState(loadSubscribers);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [homeContent, setHomeContent] = useState(loadHomeContent);
  const [aboutContent, setAboutContent] = useState(loadAboutContent);
  const [footerContent, setFooterContent] = useState(loadFooterContent);
  const [leads, setLeads] = useState(loadLeads);
  const [reviews, setReviews] = useState(loadReviews);
  const [contactContent, setContactContent] = useState(loadContactContent);
  const [integrations, setIntegrations] = useState(loadIntegrations);
  const [blogContent, setBlogContent] = useState(loadBlogContent);
  const [menuContent, setMenuContent] = useState(loadMenuContent);

  useEffect(() => { savePages(pages); }, [pages]);
  useEffect(() => { savePopups(popups); }, [popups]);
  useEffect(() => { saveSubscribers(subscribers); }, [subscribers]);
  useEffect(() => { saveHomeContent(homeContent); }, [homeContent]);
  useEffect(() => { saveAboutContent(aboutContent); }, [aboutContent]);
  useEffect(() => { saveFooterContent(footerContent); }, [footerContent]);
  useEffect(() => { saveLeads(leads); }, [leads]);
  useEffect(() => { saveReviews(reviews); }, [reviews]);
  useEffect(() => { saveContactContent(contactContent); }, [contactContent]);
  useEffect(() => { saveIntegrations(integrations); }, [integrations]);
  useEffect(() => { saveBlogContent(blogContent); }, [blogContent]);
  useEffect(() => { saveArticles(articles); }, [articles]);
  useEffect(() => { saveMenuContent(menuContent); }, [menuContent]);

  const switchRole = (id) => {
    setRole(id);
    localStorage.setItem(STORAGE_ROLE, id);
  };

  const me = useMemo(() => {
    const asUser = users.find((u) => u.role === role);
    return {
      name: asUser?.name || "Ana Lopes",
      email: asUser?.email || "ana.lopes@divinarte.pt",
      affiliateCode: asUser?.affiliateCode,
      role,
      roleLabel: ROLES.find((r) => r.id === role)?.label || "—",
    };
  }, [role, users]);

  const value = {
    me, role, switchRole,
    users, setUsers,
    products: productsList, setProducts: setProductsList,
    orders, setOrders,
    articles, setArticles,
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
    pages, setPages,
    popups, setPopups,
    subscribers, setSubscribers,
    coupons, setCoupons,
    homeContent, setHomeContent,
    aboutContent, setAboutContent,
    footerContent, setFooterContent,
    leads, setLeads,
    reviews, setReviews,
    contactContent, setContactContent,
    integrations, setIntegrations,
    blogContent, setBlogContent,
    menuContent, setMenuContent,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};
