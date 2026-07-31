import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ROLES, adminUsers, adminOrders, adminAttributes, stockMovements as initialMovements, storeSettings as initialSettings } from "../data/mockAdmin";
import { useAuth } from "../../context/AuthContext";
import { loadArticles, saveArticles } from "../../lib/articles";
import { initialPurchases, initialLanguages, initialShippingZones, initialDistrictRules, initialCategoryRules } from "../data/mockErp";
import { listAllMethods } from "../../lib/adminShipping";
import { listInsumos, loadRecipes, listProductionOrders } from "../../lib/adminProduction";
import { listAllProducts } from "../../lib/adminProducts";
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

export const AdminProvider = ({ children }) => {
  const { user: authUser, profile: authProfile } = useAuth();
  const realRole = authProfile?.role || "admin";
  const [viewAsRole, setViewAsRole] = useState(null);
  const [users, setUsers] = useState(adminUsers);
  const [productsList, setProductsList] = useState([]);
  useEffect(() => { listAllProducts().then(setProductsList).catch(() => {}); }, []);
  const [orders, setOrders] = useState(adminOrders);
  const [articles, setArticles] = useState(loadArticles);
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
  const [purchases, setPurchases] = useState(initialPurchases);
  // Envios & idiomas (partilhados com /admin/envios)
  const [shippingMethods, setShippingMethods] = useState([]);
  useEffect(() => { listAllMethods().then(setShippingMethods).catch(() => {}); }, []);
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
