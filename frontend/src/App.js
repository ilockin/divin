import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { ProductDetail } from "@/pages/ProductDetail";
import { CartPage } from "@/pages/CartPage";
import { Checkout } from "@/pages/Checkout";
import { OrderSuccess } from "@/pages/OrderSuccess";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { AccountLayout, AccountOverview } from "@/pages/Account";
import { Orders as AccountOrders, Profile, Addresses } from "@/pages/AccountSections";
import { Blog, BlogPost } from "@/pages/Blog";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";

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
        <Route path="/conta" element={<AccountLayout />}>
          <Route index element={<AccountOverview />} />
          <Route path="encomendas" element={<AccountOrders />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="moradas" element={<Addresses />} />
        </Route>
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
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
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="pedidos/:id" element={<OrderDetail />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="blog/:slug" element={<ArticleForm />} />
        <Route path="definicoes" element={<AdminSettings />} />
      </Route>
    </Routes>
  </AdminProvider>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/*" element={<Storefront />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
