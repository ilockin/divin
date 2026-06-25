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
import { Orders, Profile, Addresses } from "@/pages/AccountSections";
import { Blog, BlogPost } from "@/pages/Blog";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";

function App() {
  return (
    <div className="App">
      <CartProvider>
        <BrowserRouter>
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
                <Route path="encomendas" element={<Orders />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="moradas" element={<Addresses />} />
              </Route>
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contacto" element={<Contact />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}

export default App;
