import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    toast.success("Mensagem enviada", { description: "Responderemos em breve. Obrigada pelo teu cuidado." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="container-da py-12" data-testid="contact-page">
      <p className="font-script text-[var(--da-leaf)] text-2xl">fala connosco</p>
      <h1 className="text-4xl sm:text-5xl mt-1">Contacto</h1>
      <p className="font-body text-[var(--da-muted)] mt-4 max-w-2xl">Estamos aqui para te ouvir — dúvidas, sugestões, recomendações de uso ou só uma palavra amiga.</p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 mt-12">
        <form onSubmit={submit} className="bg-white rounded-2xl border hairline p-6 sm:p-8 space-y-4" data-testid="contact-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome" required value={form.name} onChange={(v) => u("name", v)} testid="contact-name" />
            <Field label="E-mail" type="email" required value={form.email} onChange={(v) => u("email", v)} testid="contact-email" />
          </div>
          <Field label="Assunto" value={form.subject} onChange={(v) => u("subject", v)} testid="contact-subject" />
          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">Mensagem</span>
            <textarea required rows={6} value={form.message} onChange={(e) => u("message", e.target.value)} data-testid="contact-message" className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
          </label>
          <button className="btn-da btn-da-primary" data-testid="contact-submit">Enviar mensagem</button>
        </form>

        <aside className="space-y-5">
          <Info icon={Mail} title="E-mail" lines={["ola@divinarte.pt"]} />
          <Info icon={Phone} title="Telefone" lines={["+351 220 000 000", "Seg–Sex, 10h–18h"]} />
          <Info icon={MapPin} title="Atelier" lines={["Rua das Camélias, 12", "4100-100 Porto, Portugal"]} />
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, required, type = "text", testid }) => (
  <label className="block">
    <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">{label}{required && " *"}</span>
    <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
  </label>
);

const Info = ({ icon: Icon, title, lines }) => (
  <div className="bg-white rounded-2xl border hairline p-5 flex gap-4">
    <Icon className="text-[var(--da-leaf)] shrink-0" size={20} />
    <div>
      <p className="font-serif-display tracking-[0.1em] text-sm text-[var(--da-forest)]">{title}</p>
      {lines.map((l, i) => <p key={i} className="font-body text-sm text-[var(--da-muted)]">{l}</p>)}
    </div>
  </div>
);
