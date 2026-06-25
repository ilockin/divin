import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscrição registada", { description: "Obrigado por te juntares ao nosso círculo." });
    setEmail("");
  };

  return (
    <footer className="bg-[var(--da-pine)] text-[#F7F4EC] mt-20" data-testid="site-footer">
      {/* newsletter */}
      <div className="border-b border-white/10">
        <div className="container-da py-14 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-script text-[var(--da-olive)] text-2xl mb-2">junta-te ao círculo</p>
            <h3 className="text-2xl sm:text-3xl text-[#F7F4EC]" style={{ color: "#F7F4EC" }}>
              Cuidado, calma e novidades — na tua caixa de entrada.
            </h3>
            <p className="font-body text-sm text-white/70 mt-3 max-w-md">
              Subscreve a nossa newsletter e recebe rituais, ingredientes em foco e ofertas pensadas para quem cuida com atenção.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="O teu e-mail"
              data-testid="newsletter-email"
              className="flex-1 bg-transparent border border-white/30 px-5 py-3 rounded-full text-sm font-body placeholder:text-white/50 focus:outline-none focus:border-[var(--da-olive)]"
            />
            <button type="submit" className="btn-da btn-da-primary" data-testid="newsletter-submit">
              Subscrever
            </button>
          </form>
        </div>
      </div>

      <div className="container-da py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo size="md" variant="light" />
          <p className="font-body text-sm text-white/70 mt-5 leading-relaxed">
            Cosmética natural e artesanal feita em Portugal. Pequenos lotes, fórmulas suaves e o cuidado de quem acredita que beleza é também uma forma de bondade.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <a href="#" aria-label="Instagram" className="hover:text-[var(--da-olive)] transition"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-[var(--da-olive)] transition"><Facebook size={18} /></a>
            <a href="mailto:ola@divinarte.pt" aria-label="Email" className="hover:text-[var(--da-olive)] transition"><Mail size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.22em]" style={{ color: "#F7F4EC" }}>Loja</h4>
          <ul className="mt-5 space-y-3 font-body text-sm text-white/70">
            <li><Link to="/loja?categoria=faciais" className="hover:text-[var(--da-olive)]">Faciais</Link></li>
            <li><Link to="/loja?categoria=corporais" className="hover:text-[var(--da-olive)]">Corporais</Link></li>
            <li><Link to="/loja?categoria=capilares" className="hover:text-[var(--da-olive)]">Capilares</Link></li>
            <li><Link to="/loja?categoria=bem-estar" className="hover:text-[var(--da-olive)]">Bem-estar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.22em]" style={{ color: "#F7F4EC" }}>Marca</h4>
          <ul className="mt-5 space-y-3 font-body text-sm text-white/70">
            <li><Link to="/sobre" className="hover:text-[var(--da-olive)]">A nossa história</Link></li>
            <li><Link to="/blog" className="hover:text-[var(--da-olive)]">Blog</Link></li>
            <li><Link to="/contacto" className="hover:text-[var(--da-olive)]">Contacto</Link></li>
            <li><Link to="/conta/login" className="hover:text-[var(--da-olive)]">Conta</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.22em]" style={{ color: "#F7F4EC" }}>Apoio</h4>
          <ul className="mt-5 space-y-3 font-body text-sm text-white/70">
            <li><a href="#" className="hover:text-[var(--da-olive)]">Envios e devoluções</a></li>
            <li><a href="#" className="hover:text-[var(--da-olive)]">FAQ</a></li>
            <li><a href="#" className="hover:text-[var(--da-olive)]">Termos e condições</a></li>
            <li><a href="#" className="hover:text-[var(--da-olive)]">Política de privacidade</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-da py-6 flex flex-col sm:flex-row gap-4 items-center justify-between font-body text-xs text-white/60">
          <p>© {new Date().getFullYear()} DivinArte. Todos os direitos reservados.</p>
          <div className="flex gap-3 items-center">
            <span className="px-3 py-1 border border-white/20 rounded-full">Visa</span>
            <span className="px-3 py-1 border border-white/20 rounded-full">Mastercard</span>
            <span className="px-3 py-1 border border-white/20 rounded-full">MB Way</span>
            <span className="px-3 py-1 border border-white/20 rounded-full">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
