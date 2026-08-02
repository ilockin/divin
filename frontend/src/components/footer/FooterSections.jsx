import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "../Logo";
import { addSubscriber } from "../../lib/newsletter";
import {
  eyebrowClassFor, eyebrowStyleFor, titleClassFor, titleStyleFor, bodyClassFor, bodyStyleFor,
} from "../../lib/contentStyle";

export const NewsletterBar = ({ content }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  if (!content.visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await addSubscriber(email, "footer");
      toast.success("Subscrição registada", { description: "Obrigado por te juntares ao nosso círculo." });
      setEmail("");
    } catch (err) {
      toast.error("Não foi possível subscrever", { description: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-b border-white/10" style={{ background: content.bg || undefined }}>
      <div className="container-da py-14 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className={eyebrowClassFor(content)} style={eyebrowStyleFor(content)}>{content.eyebrow}</p>
          <h3 className={`${titleClassFor(content)} mt-2`} style={{ ...titleStyleFor(content), color: content.titleColor || "#F7F4EC" }}>
            {content.title}
          </h3>
          <p className={`${bodyClassFor(content)} mt-3 max-w-md`} style={{ ...bodyStyleFor(content), color: content.bodyColor || "rgba(255,255,255,0.7)" }}>
            {content.text}
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
          <button type="submit" disabled={sending} className="btn-da btn-da-primary disabled:opacity-60" data-testid="newsletter-submit">
            {sending ? "A enviar…" : content.buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

const BrandColumn = ({ col }) => (
  <div>
    <Logo size="md" variant="light" />
    <p className="font-body text-sm mt-5 leading-relaxed" style={{ color: col.textColor || "rgba(255,255,255,0.7)" }}>
      {col.text}
    </p>
    {col.showSocial && (
      <div className="flex items-center gap-3 mt-6">
        <a href="#" aria-label="Instagram" className="hover:text-[var(--da-olive)] transition"><Instagram size={18} /></a>
        <a href="#" aria-label="Facebook" className="hover:text-[var(--da-olive)] transition"><Facebook size={18} /></a>
        <a href="mailto:ola@divinarte.pt" aria-label="Email" className="hover:text-[var(--da-olive)] transition"><Mail size={18} /></a>
      </div>
    )}
  </div>
);

const LinksColumn = ({ col }) => (
  <div>
    <h4 className="text-sm tracking-[0.22em]" style={{ color: col.headingColor || "#F7F4EC" }}>{col.heading}</h4>
    <ul className="mt-5 space-y-3 font-body text-sm">
      {col.links.map((link, i) => (
        <li key={i}>
          {link.url.startsWith("/") ? (
            <Link to={link.url} className="hover:text-[var(--da-olive)]" style={{ color: col.linkColor || "rgba(255,255,255,0.7)" }}>{link.label}</Link>
          ) : (
            <a href={link.url} className="hover:text-[var(--da-olive)]" style={{ color: col.linkColor || "rgba(255,255,255,0.7)" }}>{link.label}</a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export const FooterColumns = ({ columns }) => (
  <div className="container-da py-16 flex flex-wrap gap-10" data-testid="footer-columns">
    {columns.map((col) => (
      <div key={col.id} style={{ width: `${col.width}${col.widthUnit || "%"}`, minWidth: col.widthUnit === "%" ? "240px" : undefined, flexShrink: 0 }}>
        {col.type === "brand" ? <BrandColumn col={col} /> : <LinksColumn col={col} />}
      </div>
    ))}
  </div>
);

export const BottomBar = ({ content }) => (
  <div className="border-t border-white/10" style={{ background: content.bg || undefined }}>
    <div className="container-da py-6 flex flex-col sm:flex-row gap-4 items-center justify-between font-body text-xs" style={{ color: content.textColor || "rgba(255,255,255,0.6)" }}>
      <p>{content.text.replace("{ano}", new Date().getFullYear())}</p>
      {content.showPaymentBadges && (
        <div className="flex gap-3 items-center">
          <span className="px-3 py-1 border border-white/20 rounded-full">Visa</span>
          <span className="px-3 py-1 border border-white/20 rounded-full">Mastercard</span>
          <span className="px-3 py-1 border border-white/20 rounded-full">MB Way</span>
          <span className="px-3 py-1 border border-white/20 rounded-full">PayPal</span>
        </div>
      )}
    </div>
  </div>
);
