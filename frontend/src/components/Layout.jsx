import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { Toaster } from "sonner";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--da-cream)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: "Montserrat, sans-serif" } }} />
    </div>
  );
};
