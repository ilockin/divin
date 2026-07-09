import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { ProductDetail } from "@/pages/ProductDetail";
import { CartPage } from "@/pages/CartPage";
import { Checkout } from "@/pages/Checkout";
import { OrderSuccess } from "@/pages/OrderSuccess";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { AccountLayout, AccountOverview } from "@/pages/Account";
import { Orders as AccountOrders, Profile, Addresses } from "@/pages/AccountSections";
import { Blog, BlogPost } from "@/pages/Blog";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { DynamicPage } from "@/pages/DynamicPage";

// Admin
import { AdminProvider } from "@/admin/context/AdminContext";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Dashboard } from "@/admin/pages/Dashboard";
import { Users as AdminUsers } from "@/admin/pages/Users";
import { Products as AdminProducts, ProductForm } from "@/admin/pages/Products";
import { Categories } from "@/admin/pages/Categories";
import { Attributes } from "@/admin/pages/Attributes";
import { Stock } from "@/admin/pages/Stock";
import { Orders as AdminOrders, OrderDetail } from "@/admin/pages/Orders";
import { Blog as AdminBlog, ArticleForm } from "@/admin/pages/Blog";
import { Settings as AdminSettings } from "@/admin/pages/Settings";
import { Insumos } from "@/admin/pages/Insumos";
import { FichaTecnica } from "@/admin/pages/FichaTecnica";
import { OrdensProducao, OrdemProducaoDetail } from "@/admin/pages/OrdensProducao";
import { FinanceiroOverview } from "@/admin/pages/FinanceiroOverview";
import { Compras } from "@/admin/pages/Compras";
import { Margens } from "@/admin/pages/Margens";
import { Envios } from "@/admin/pages/Envios";
import { Paginas } from "@/admin/pages/Paginas";
import { PageBuilder } from "@/admin/pages/PageBuilder";
import { AfiliadoDashboard } from "@/admin/pages/AfiliadoDashboard";
import { AfiliadoProducts } from "@/admin/pages/AfiliadoProducts";
import { AfiliadoSales } from "@/admin/pages/AfiliadoSales";
import { AfiliadoLinks } from "@/admin/pages/AfiliadoLinks";
import { Coupons } from "@/admin/pages/Coupons";
import { Popups } from "@/admin/pages/Popups";
import { PopupBuilder } from "@/admin/pages/PopupBuilder";
import { NewsletterSubscribers } from "@/admin/pages/NewsletterSubscribers";
import { Affiliates } from "@/admin/pages/Affiliates";
import { BlockLibrary } from "@/admin/pages/BlockLibrary";
import { HomeVisualEditor } from "@/admin/pages/HomeVisualEditor";
import { AboutVisualEditor } from "@/admin/pages/AboutVisualEditor";
import { FooterVisualEditor } from "@/admin/pages/FooterVisualEditor";
import { Leads } from "@/admin/pages/Leads";
import { Reviews } from "@/admin/pages/Reviews";
import { ContactVisualEditor } from "@/admin/pages/ContactVisualEditor";
import { BlogVisualEditor } from "@/admin/pages/BlogVisualEditor";
import { MenuVisualEditor } from "@/admin/pages/MenuVisualEditor";

const Storefront = () => (
  <CartProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loja" element={<Shop />} />
        <Route path="/produto/:slug" element={<ProductDetail />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/sucesso" element={<OrderSuccess />} />
        <Route path="/conta/login" element={<Login />} />
        <Route path="/conta/registar" element={<Register />} />
        <Route path="/conta/esqueceu-senha" element={<ForgotPassword />} />
        <Route path="/conta/nova-senha" element={<ResetPassword />} />
        <Route path="/conta" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<AccountOverview />} />
          <Route path="encomendas" element={<AccountOrders />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="moradas" element={<Addresses />} />
        </Route>
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Routes>
    </Layout>
  </CartProvider>
);

const Admin = () => (
  <AdminProvider>
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="utilizadores" element={<AdminUsers />} />
        <Route path="produtos" element={<AdminProducts />} />
        <Route path="produtos/:id" element={<ProductForm />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="atributos" element={<Attributes />} />
        <Route path="stock" element={<Stock />} />
        <Route path="insumos" element={<Insumos />} />
        <Route path="fichas-tecnicas" element={<FichaTecnica />} />
        <Route path="ordens-producao" element={<OrdensProducao />} />
        <Route path="ordens-producao/:id" element={<OrdemProducaoDetail />} />
        <Route path="financeiro" element={<FinanceiroOverview />} />
        <Route path="financeiro/compras" element={<Compras />} />
        <Route path="financeiro/margens" element={<Margens />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="pedidos/:id" element={<OrderDetail />} />
        <Route path="leads" element={<Leads />} />
        <Route path="avaliacoes" element={<Reviews />} />
        <Route path="envios" element={<Envios />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="blog/:slug" element={<ArticleForm />} />
        <Route path="paginas" element={<Paginas />} />
        <Route path="paginas/:id" element={<PageBuilder />} />
        <Route path="blocos" element={<BlockLibrary />} />
        <Route path="conteudo-inicio" element={<HomeVisualEditor />} />
        <Route path="conteudo-sobre" element={<AboutVisualEditor />} />
        <Route path="conteudo-rodape" element={<FooterVisualEditor />} />
        <Route path="conteudo-contacto" element={<ContactVisualEditor />} />
        <Route path="conteudo-blog" element={<BlogVisualEditor />} />
        <Route path="menu" element={<MenuVisualEditor />} />
        <Route path="painel-afiliado" element={<AfiliadoDashboard />} />
        <Route path="painel-afiliado/produtos" element={<AfiliadoProducts />} />
        <Route path="painel-afiliado/vendas" element={<AfiliadoSales />} />
        <Route path="painel-afiliado/links" element={<AfiliadoLinks />} />
        <Route path="cupoes" element={<Coupons />} />
        <Route path="popups" element={<Popups />} />
        <Route path="popups/:id" element={<PopupBuilder />} />
        <Route path="newsletter" element={<NewsletterSubscribers />} />
        <Route path="afiliados" element={<Affiliates />} />
        <Route path="definicoes" element={<AdminSettings />} />
      </Route>
    </Routes>
  </AdminProvider>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/admin/*" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
            <Route path="/*" element={<Storefront />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
