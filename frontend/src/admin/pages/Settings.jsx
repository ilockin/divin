import React, { useState } from "react";
import { Save, CreditCard, Smartphone, Wallet, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";

const Toggle = ({ checked, onChange, testid }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    data-testid={testid}
    className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-[var(--da-leaf)]" : "bg-[var(--da-line)]"}`}
    role="switch"
    aria-checked={checked}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition transform ${checked ? "translate-x-5" : ""}`} />
  </button>
);

export const Settings = () => {
  const { settings, setSettings, role } = useAdmin();
  const [form, setForm] = useState(settings);

  const u = (path, value) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = next;
      keys.slice(0, -1).forEach((k) => { cur = cur[k]; });
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = () => {
    setSettings(form);
    toast.success("Definições guardadas.");
  };

  if (role !== "super_admin") {
    return (
      <div data-testid="admin-settings-locked">
        <PageHeader title="Definições" subtitle="Configuração da loja." />
        <div className="bg-white border hairline rounded-2xl p-10 text-center">
          <p className="font-script text-[var(--da-leaf)] text-2xl">acesso restrito</p>
          <p className="font-body text-sm text-[var(--da-muted)] mt-2">Apenas Super Admin pode aceder às definições da loja.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-settings">
      <PageHeader
        title="Definições"
        subtitle="Configuração geral da loja DivinArte."
        actions={(
          <button onClick={save} data-testid="settings-save" className="btn-da btn-da-primary text-xs"><Save size={14} /> Guardar</button>
        )}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* dados loja */}
        <section className="bg-white border hairline rounded-2xl p-6 space-y-4">
          <SectionTitle eyebrow="identidade" title="Dados da loja" />
          <FormRow label="Nome">
            <input className={fieldClass} value={form.storeName} onChange={(e) => u("storeName", e.target.value)} data-testid="set-store-name" />
          </FormRow>
          <FormRow label="Tagline">
            <input className={fieldClass} value={form.tagline} onChange={(e) => u("tagline", e.target.value)} data-testid="set-tagline" />
          </FormRow>
          <FormRow label="E-mail">
            <input className={fieldClass} value={form.email} onChange={(e) => u("email", e.target.value)} data-testid="set-email" />
          </FormRow>
          <FormRow label="Telefone">
            <input className={fieldClass} value={form.phone} onChange={(e) => u("phone", e.target.value)} data-testid="set-phone" />
          </FormRow>
          <FormRow label="Morada">
            <input className={fieldClass} value={form.address} onChange={(e) => u("address", e.target.value)} data-testid="set-address" />
          </FormRow>
          <div className="border-t hairline pt-4">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Logo</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[var(--da-forest)] flex items-center justify-center">
                <svg width="22" height="16" viewBox="0 0 32 22">
                  <path d="M16 21 C5 21, 1 11, 16 1 C 16 9, 16 17, 16 21Z" fill="#2E9E44" />
                  <path d="M16 21 C27 21, 31 11, 16 1 C 16 9, 16 17, 16 21Z" fill="#F7F4EC" opacity="0.85" />
                </svg>
              </div>
              <button type="button" onClick={() => toast("Upload de logo — demonstração")} data-testid="set-logo-upload" className="text-xs font-body px-4 py-2 border hairline rounded-full hover:bg-[var(--da-cream-2)]/60">Alterar logo</button>
            </div>
          </div>
        </section>

        {/* pagamentos */}
        <section className="bg-white border hairline rounded-2xl p-6 space-y-4">
          <SectionTitle eyebrow="pagamentos" title="Métodos ativos" />
          {[
            { key: "card", label: "Cartão (Stripe)", Icon: CreditCard },
            { key: "mbway", label: "MB Way", Icon: Smartphone },
            { key: "multibanco", label: "Multibanco", Icon: Building2 },
            { key: "paypal", label: "PayPal", Icon: Wallet },
          ].map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center justify-between py-2" data-testid={`set-pay-${key}-row`}>
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-[var(--da-forest)]" />
                <span className="font-body text-sm">{label}</span>
              </div>
              <Toggle checked={form.paymentMethods[key]} onChange={(v) => u(`paymentMethods.${key}`, v)} testid={`set-pay-${key}`} />
            </div>
          ))}
          <p className="font-body text-[11px] text-[var(--da-muted)] italic">Configuração visual. As credenciais de gateway são geridas no painel de produção.</p>
        </section>

        {/* envios */}
        <section className="bg-white border hairline rounded-2xl p-6 space-y-4">
          <SectionTitle eyebrow="envios" title="Opções de envio" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Standard — preço (€)">
              <input type="number" step="0.1" className={fieldClass} value={form.shippingOptions.standard.price} onChange={(e) => u("shippingOptions.standard.price", parseFloat(e.target.value))} data-testid="set-ship-standard-price" />
            </FormRow>
            <FormRow label="Expresso — preço (€)">
              <input type="number" step="0.1" className={fieldClass} value={form.shippingOptions.express.price} onChange={(e) => u("shippingOptions.express.price", parseFloat(e.target.value))} data-testid="set-ship-express-price" />
            </FormRow>
          </div>
          <FormRow label="Envio grátis acima de (€)">
            <input type="number" step="1" className={fieldClass} value={form.shippingOptions.freeAbove} onChange={(e) => u("shippingOptions.freeAbove", parseFloat(e.target.value))} data-testid="set-ship-free-above" />
          </FormRow>
          <div className="space-y-2 border-t hairline pt-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm">Standard ativo</span>
              <Toggle checked={form.shippingOptions.standard.active} onChange={(v) => u("shippingOptions.standard.active", v)} testid="set-ship-standard" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm">Expresso ativo</span>
              <Toggle checked={form.shippingOptions.express.active} onChange={(v) => u("shippingOptions.express.active", v)} testid="set-ship-express" />
            </div>
          </div>
        </section>

        {/* gerais */}
        <section className="bg-white border hairline rounded-2xl p-6 space-y-4">
          <SectionTitle eyebrow="gerais" title="Preferências" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Moeda">
              <select className={fieldClass} value={form.general.currency} onChange={(e) => u("general.currency", e.target.value)} data-testid="set-currency">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </FormRow>
            <FormRow label="Idioma">
              <select className={fieldClass} value={form.general.language} onChange={(e) => u("general.language", e.target.value)} data-testid="set-language">
                <option value="pt-PT">Português (Portugal)</option>
                <option value="en-GB">English</option>
              </select>
            </FormRow>
          </div>
          <FormRow label="Alerta de stock baixo (unidades)">
            <input type="number" min="0" className={fieldClass} value={form.general.lowStockAlert} onChange={(e) => u("general.lowStockAlert", parseInt(e.target.value, 10))} data-testid="set-low-stock-alert" />
          </FormRow>
          <div className="flex items-center justify-between border-t hairline pt-4">
            <div>
              <p className="font-body text-sm">Modo manutenção</p>
              <p className="font-body text-[11px] text-[var(--da-muted)]">Mostra uma mensagem na loja pública.</p>
            </div>
            <Toggle checked={form.general.maintenanceMode} onChange={(v) => u("general.maintenanceMode", v)} testid="set-maintenance" />
          </div>
        </section>
      </div>
    </div>
  );
};
