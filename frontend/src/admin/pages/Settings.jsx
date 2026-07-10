import React, { useState, useEffect } from "react";
import { Save, CreditCard, Smartphone, Wallet, Building2, Plus, Truck, Pencil, Trash2, Star, Banknote, Landmark, Wallet2, Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { useAdmin } from "../context/AdminContext";
import { LANGUAGE_CATALOG } from "../data/mockErp";
import { formatEUR } from "../../lib/format";
import { getSettings, saveSettings } from "../../lib/storeSettings";

const SUPABASE_PROJECT_REF = "hyaxzywkftqnizbhzbug";
const WEBHOOK_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/stripe-webhook`;

const SecretInput = ({ value, onChange, testid, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        placeholder={placeholder}
        className={`mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)] font-mono`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--da-muted)] hover:text-[var(--da-forest)]"
        tabIndex={-1}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

const CopyField = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        readOnly
        value={value}
        className="flex-1 bg-[var(--da-cream-2)]/60 border hairline rounded-lg px-4 py-3 font-body text-xs font-mono focus:outline-none text-[var(--da-muted)]"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 w-9 h-9 rounded-lg border hairline flex items-center justify-center hover:bg-[var(--da-cream-2)]/60 text-[var(--da-forest)]"
        title="Copiar"
      >
        {copied ? <Check size={14} className="text-[var(--da-leaf)]" /> : <Copy size={14} />}
      </button>
    </div>
  );
};

const Toggle = ({ checked, onChange, testid, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    data-testid={testid}
    disabled={disabled}
    className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-[var(--da-leaf)]" : "bg-[var(--da-line)]"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    role="switch"
    aria-checked={checked}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition transform ${checked ? "translate-x-5" : ""}`} />
  </button>
);

const emptyMethod = { id: null, name: "", description: "", cost: 0, eta: "", zones: "", active: true };

const EMPTY_STRIPE = { stripe_enabled: "false", stripe_test_mode: "true", stripe_publishable_key: "", stripe_secret_key: "", stripe_webhook_secret: "" };

export const Settings = () => {
  const { settings, setSettings, role, shippingMethods, setShippingMethods, languages, setLanguages, integrations, setIntegrations } = useAdmin();
  const [form, setForm] = useState(settings);
  const [intForm, setIntForm] = useState(integrations);
  const ui = (key, value) => setIntForm((prev) => ({ ...prev, [key]: value }));

  // ── Stripe ──────────────────────────────────────────────────────────────────
  const [stripe, setStripe] = useState(EMPTY_STRIPE);
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeSaving, setStripeSaving] = useState(false);
  const us = (key, value) => setStripe((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    getSettings(Object.keys(EMPTY_STRIPE))
      .then((s) => setStripe((prev) => ({ ...prev, ...s })))
      .catch(() => {})
      .finally(() => setStripeLoading(false));
  }, []);

  const saveStripe = async () => {
    setStripeSaving(true);
    try {
      await saveSettings(stripe);
      toast.success("Configuração Stripe guardada.");
    } catch (err) {
      toast.error("Erro ao guardar", { description: err.message });
    } finally {
      setStripeSaving(false);
    }
  };

  // modais/estado de envios
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodForm, setMethodForm] = useState(emptyMethod);
  const [newLang, setNewLang] = useState("");

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
    setIntegrations(intForm);
    toast.success("Definições guardadas.");
  };

  // ---- modos de envio (CRUD) ----
  const startNewMethod = () => { setMethodForm(emptyMethod); setMethodOpen(true); };
  const startEditMethod = (m) => { setMethodForm({ ...m }); setMethodOpen(true); };
  const removeMethod = (m) => {
    if (!window.confirm(`Remover o modo de envio "${m.name}"?`)) return;
    setShippingMethods((prev) => prev.filter((x) => x.id !== m.id));
    toast.success("Modo de envio removido.");
  };
  const toggleMethod = (m) => {
    setShippingMethods((prev) => prev.map((x) => x.id === m.id ? { ...x, active: !x.active } : x));
  };
  const saveMethod = () => {
    if (!methodForm.name.trim()) { toast.error("Indica o nome do modo de envio."); return; }
    const payload = { ...methodForm, cost: parseFloat(methodForm.cost) || 0 };
    if (methodForm.id) {
      setShippingMethods((prev) => prev.map((x) => x.id === methodForm.id ? payload : x));
      toast.success("Modo de envio atualizado.");
    } else {
      const newId = "sm" + (shippingMethods.length + 1);
      setShippingMethods((prev) => [...prev, { ...payload, id: newId }]);
      toast.success("Modo de envio criado.");
    }
    setMethodOpen(false);
  };

  // ---- idiomas ----
  const toggleLang = (code) => {
    setLanguages((prev) => prev.map((l) => l.code === code ? { ...l, active: !l.active } : l));
  };
  const setDefaultLang = (code) => {
    setLanguages((prev) => prev.map((l) => ({ ...l, default: l.code === code, active: l.code === code ? true : l.active })));
    toast.success("Idioma predefinido atualizado.");
  };
  const removeLang = (code) => {
    setLanguages((prev) => prev.filter((l) => l.code !== code));
    toast.success("Idioma removido.");
  };
  const addLang = () => {
    if (!newLang) return;
    const cat = LANGUAGE_CATALOG.find((c) => c.code === newLang);
    if (!cat) return;
    setLanguages((prev) => [...prev, { code: cat.code, label: cat.label, active: true, default: false }]);
    setNewLang("");
    toast.success(`${cat.label} adicionado.`);
  };
  const availableLangs = LANGUAGE_CATALOG.filter((c) => !languages.some((l) => l.code === c.code));

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

      <div className="space-y-6">
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
              { key: "klarna", label: "Klarna", Icon: Banknote },
              { key: "lusopay", label: "LusoPay", Icon: Landmark },
              { key: "googlewallet", label: "Google Wallet", Icon: Wallet2 },
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
        </div>

        {/* modos de envio (CRUD) */}
        <section className="bg-white border hairline rounded-2xl p-6" data-testid="set-shipping-methods">
          <SectionTitle
            eyebrow="envios"
            title="Modos de envio"
            action={(
              <button onClick={startNewMethod} data-testid="shipmethod-new" className="btn-da btn-da-primary text-xs"><Plus size={14} /> Adicionar modo de envio</button>
            )}
          />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm font-body">
              <thead className="bg-[var(--da-cream-2)]/40 border-y hairline">
                <tr>
                  {["Nome", "Custo", "Prazo estimado", "Zonas / condições", "Estado", ""].map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--da-forest)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shippingMethods.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-[var(--da-muted)]">Sem modos de envio. Adiciona o primeiro.</td></tr>
                ) : shippingMethods.map((m) => (
                  <tr key={m.id} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30" data-testid={`shipmethod-row-${m.id}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Truck size={15} className="text-[var(--da-forest)] shrink-0" />
                        <div>
                          <p className="font-semibold text-[var(--da-forest)]">{m.name}</p>
                          {m.description && <p className="font-body text-[11px] text-[var(--da-muted)]">{m.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{m.cost === 0 ? "Grátis" : formatEUR(m.cost)}</td>
                    <td className="px-3 py-3 text-[var(--da-muted)]">{m.eta || "—"}</td>
                    <td className="px-3 py-3 text-[var(--da-muted)]">{m.zones || "—"}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => toggleMethod(m)} data-testid={`shipmethod-toggle-${m.id}`}>
                        <StatusBadge tone={m.active ? "green" : "muted"}>{m.active ? "Ativo" : "Inativo"}</StatusBadge>
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => startEditMethod(m)} data-testid={`shipmethod-edit-${m.id}`} className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center" aria-label="Editar"><Pencil size={14} /></button>
                        <button onClick={() => removeMethod(m)} data-testid={`shipmethod-remove-${m.id}`} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" aria-label="Remover"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* gerais */}
          <section className="bg-white border hairline rounded-2xl p-6 space-y-4">
            <SectionTitle eyebrow="gerais" title="Preferências" />
            <FormRow label="Moeda">
              <select className={fieldClass} value={form.general.currency} onChange={(e) => u("general.currency", e.target.value)} data-testid="set-currency">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </FormRow>
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

          {/* idiomas do site */}
          <section className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid="set-languages">
            <SectionTitle eyebrow="preferências gerais" title="Idiomas do site" />
            <div className="space-y-2">
              {languages.map((l) => (
                <div key={l.code} className="flex items-center justify-between py-2 border-b hairline last:border-b-0" data-testid={`lang-row-${l.code}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-sm">{l.label}</span>
                    <span className="font-body text-[11px] text-[var(--da-muted)] uppercase">{l.code}</span>
                    {l.default && <StatusBadge tone="green">Predefinido</StatusBadge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDefaultLang(l.code)}
                      disabled={l.default}
                      data-testid={`lang-default-${l.code}`}
                      title="Definir como predefinido"
                      className={`flex items-center gap-1 text-[11px] font-body uppercase tracking-[0.14em] ${l.default ? "text-[var(--da-leaf)] cursor-default" : "text-[var(--da-muted)] hover:text-[var(--da-forest)]"}`}
                    >
                      <Star size={13} className={l.default ? "fill-[var(--da-leaf)] text-[var(--da-leaf)]" : ""} /> Predefinido
                    </button>
                    <Toggle checked={l.active} onChange={() => toggleLang(l.code)} disabled={l.default} testid={`lang-toggle-${l.code}`} />
                    {!l.default && (
                      <button onClick={() => removeLang(l.code)} data-testid={`lang-remove-${l.code}`} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-700 flex items-center justify-center" aria-label="Remover idioma"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {availableLangs.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <select value={newLang} onChange={(e) => setNewLang(e.target.value)} data-testid="lang-add-select" className={fieldClass + " mt-0 flex-1"}>
                  <option value="">Escolher idioma…</option>
                  {availableLangs.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                </select>
                <button onClick={addLang} disabled={!newLang} data-testid="lang-add" className="btn-da btn-da-outline text-xs whitespace-nowrap"><Plus size={14} /> Adicionar idioma</button>
              </div>
            )}

            <p className="font-body text-[11px] text-[var(--da-muted)] italic border-t hairline pt-3" data-testid="lang-helper">
              Os idiomas traduzem as páginas gerais do site (interface). Os conteúdos escritos do blog não são traduzidos automaticamente por esta definição.
            </p>
          </section>
        </div>

        {/* ── STRIPE ─────────────────────────────────────────────────────── */}
        <section className="bg-white border hairline rounded-2xl p-6 space-y-5" data-testid="set-stripe">
          <div className="flex items-center justify-between">
            <SectionTitle eyebrow="pagamentos" title="Stripe" />
            <button
              onClick={saveStripe}
              disabled={stripeSaving || stripeLoading}
              data-testid="stripe-save"
              className="btn-da btn-da-primary text-xs disabled:opacity-60"
            >
              <Save size={14} /> {stripeSaving ? "A guardar…" : "Guardar Stripe"}
            </button>
          </div>

          {stripeLoading ? (
            <p className="font-body text-sm text-[var(--da-muted)]">A carregar configuração…</p>
          ) : (
            <>
              {/* toggle activar */}
              <div className="flex items-center justify-between py-3 border-b hairline">
                <div>
                  <p className="font-body text-sm font-semibold">Activar Stripe</p>
                  <p className="font-body text-xs text-[var(--da-muted)] mt-0.5">
                    Quando activo, o checkout redireciona para o Stripe antes de confirmar a encomenda.
                  </p>
                </div>
                <Toggle
                  checked={stripe.stripe_enabled === "true"}
                  onChange={(v) => us("stripe_enabled", v ? "true" : "false")}
                  testid="stripe-enabled-toggle"
                />
              </div>

              {/* modo teste / produção */}
              <div className="flex items-center justify-between py-3 border-b hairline">
                <div>
                  <p className="font-body text-sm font-semibold">Modo de teste</p>
                  <p className="font-body text-xs text-[var(--da-muted)] mt-0.5">
                    Em modo de teste usa chaves <span className="font-mono">sk_test_</span> / <span className="font-mono">pk_test_</span>. Desactiva para produção.
                  </p>
                </div>
                <Toggle
                  checked={stripe.stripe_test_mode === "true"}
                  onChange={(v) => us("stripe_test_mode", v ? "true" : "false")}
                  testid="stripe-test-toggle"
                />
              </div>

              {/* chave pública */}
              <FormRow
                label="Chave pública (Publishable Key)"
                hint={`Começa com ${stripe.stripe_test_mode === "true" ? "pk_test_" : "pk_live_"} — pode ficar visível no browser.`}
              >
                <input
                  value={stripe.stripe_publishable_key}
                  onChange={(e) => us("stripe_publishable_key", e.target.value)}
                  data-testid="stripe-pk"
                  placeholder={stripe.stripe_test_mode === "true" ? "pk_test_…" : "pk_live_…"}
                  className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm font-mono focus:outline-none focus:border-[var(--da-leaf)]"
                />
              </FormRow>

              {/* chave secreta */}
              <FormRow
                label="Chave secreta (Secret Key)"
                hint={`Começa com ${stripe.stripe_test_mode === "true" ? "sk_test_" : "sk_live_"} — nunca partilhes esta chave.`}
              >
                <SecretInput
                  value={stripe.stripe_secret_key}
                  onChange={(v) => us("stripe_secret_key", v)}
                  testid="stripe-sk"
                  placeholder={stripe.stripe_test_mode === "true" ? "sk_test_…" : "sk_live_…"}
                />
              </FormRow>

              {/* webhook secret */}
              <FormRow
                label="Webhook Secret"
                hint='Começa com "whsec_" — obtém no Stripe Dashboard após criar o endpoint.'
              >
                <SecretInput
                  value={stripe.stripe_webhook_secret}
                  onChange={(v) => us("stripe_webhook_secret", v)}
                  testid="stripe-ws"
                  placeholder="whsec_…"
                />
              </FormRow>

              {/* URL do webhook (só leitura + copiar) */}
              <div className="pt-2 border-t hairline">
                <p className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">URL do Webhook</p>
                <p className="font-body text-[11px] text-[var(--da-muted)] mt-1 mb-1">
                  Copia este endereço e adiciona-o no Stripe Dashboard → Developers → Webhooks → Add endpoint.
                  Eventos necessários: <span className="font-mono">checkout.session.completed</span> e <span className="font-mono">checkout.session.expired</span>.
                </p>
                <CopyField value={WEBHOOK_URL} />
              </div>

              {/* instrução deploy */}
              <div className="bg-[var(--da-cream-2)]/60 rounded-xl p-4 font-body text-xs text-[var(--da-muted)] space-y-1 border hairline">
                <p className="font-semibold text-[var(--da-forest)]">Primeiro deploy (único, feito pelo programador)</p>
                <p>Instala a <a href="https://supabase.com/docs/guides/cli" target="_blank" rel="noreferrer" className="underline hover:text-[var(--da-leaf)]">Supabase CLI</a>, faz login e corre no terminal:</p>
                <pre className="bg-[var(--da-forest)] text-white rounded-lg p-3 mt-2 overflow-x-auto text-[11px] leading-relaxed">
{`supabase login
supabase functions deploy create-checkout-session --project-ref ${SUPABASE_PROJECT_REF}
supabase functions deploy stripe-webhook --project-ref ${SUPABASE_PROJECT_REF}`}
                </pre>
                <p className="mt-2">Após este passo, todas as configurações (chaves, modo de teste, activar/desactivar) ficam aqui nesta página — sem mais CLI.</p>
              </div>
            </>
          )}
        </section>

        {/* integrações Google */}
        <section className="bg-white border hairline rounded-2xl p-6 space-y-4" data-testid="set-integrations">
          <SectionTitle eyebrow="integrações" title="Google & código avançado" />
          <p className="font-body text-[11px] text-[var(--da-muted)] italic">
            Estes campos são reais — os IDs e o código são inseridos diretamente na loja pública. Não exigem chaves secretas, por isso podes preenchê-los já.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Google Analytics (Measurement ID)" hint="Ex.: G-XXXXXXXXXX">
              <input className={fieldClass} value={intForm.googleAnalyticsId} onChange={(e) => ui("googleAnalyticsId", e.target.value)} data-testid="set-ga-id" />
            </FormRow>
            <FormRow label="Google Ads (Conversion ID)" hint="Ex.: AW-XXXXXXXXX">
              <input className={fieldClass} value={intForm.googleAdsId} onChange={(e) => ui("googleAdsId", e.target.value)} data-testid="set-ads-id" />
            </FormRow>
          </div>
          <FormRow label="Google Search Console — código de verificação" hint='O valor do atributo "content" da meta tag que o Search Console pede.'>
            <input className={fieldClass} value={intForm.searchConsoleVerification} onChange={(e) => ui("searchConsoleVerification", e.target.value)} data-testid="set-search-console" />
          </FormRow>
          <FormRow label="reCAPTCHA — Site Key" hint="Guardado para quando ligarmos a validação no back-end — por agora não é exibido nem valida nada nos formulários.">
            <input className={fieldClass} value={intForm.recaptchaSiteKey} onChange={(e) => ui("recaptchaSiteKey", e.target.value)} data-testid="set-recaptcha-key" />
          </FormRow>
          <FormRow label="Cookiebot — Domain Group ID" hint="Insere o script oficial da Cookiebot no cabeçalho do site (sem segredos de servidor) — o banner de consentimento é o widget deles.">
            <input className={fieldClass} value={intForm.cookiebotId} onChange={(e) => ui("cookiebotId", e.target.value)} data-testid="set-cookiebot-id" />
          </FormRow>

          <div className="border-t hairline pt-4 space-y-4">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">Newsletter / E-mail marketing</p>
            <p className="font-body text-xs text-[var(--da-muted)]">Guardado para quando ligarmos o envio real (fase de back-end) — por agora a subscrição fica guardada apenas neste navegador e não é enviada a nenhuma plataforma externa.</p>
            <FormRow label="Mailchimp — URL do formulário embutido" hint="A URL de ação (action) do formulário embutido da tua Audience no Mailchimp.">
              <input className={fieldClass} value={intForm.mailchimpFormUrl} onChange={(e) => ui("mailchimpFormUrl", e.target.value)} data-testid="set-mailchimp-url" />
            </FormRow>
            <FormRow label="ActiveCampaign — URL do formulário embutido" hint="A URL de ação do formulário embutido criado no ActiveCampaign.">
              <input className={fieldClass} value={intForm.activeCampaignFormUrl} onChange={(e) => ui("activeCampaignFormUrl", e.target.value)} data-testid="set-activecampaign-url" />
            </FormRow>
            <FormRow label="LeadLovers — URL do Webhook" hint="O Webhook de captação da tua máquina de sequência no LeadLovers.">
              <input className={fieldClass} value={intForm.leadloversWebhookUrl} onChange={(e) => ui("leadloversWebhookUrl", e.target.value)} data-testid="set-leadlovers-url" />
            </FormRow>
            <FormRow label="Webhook genérico" hint="Serve para RD Station, Zapier, Make ou qualquer outra ferramenta com um endpoint de webhook.">
              <input className={fieldClass} value={intForm.genericWebhookUrl} onChange={(e) => ui("genericWebhookUrl", e.target.value)} data-testid="set-generic-webhook-url" />
            </FormRow>
          </div>

          <div className="border-t hairline pt-4 space-y-4">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">Código avançado</p>
            <p className="font-body text-[11px] text-[var(--da-muted)]">Cola aqui apenas snippets de confiança (Google Tag Manager, Meta Pixel, etc.) — são inseridos diretamente na página, sem validação.</p>
            <FormRow label="Cabeçalho (dentro de &lt;head&gt;)">
              <textarea rows={3} className={fieldClass} value={intForm.headerCode} onChange={(e) => ui("headerCode", e.target.value)} data-testid="set-header-code" />
            </FormRow>
            <FormRow label="Body (logo após a abertura de &lt;body&gt;)">
              <textarea rows={3} className={fieldClass} value={intForm.bodyCode} onChange={(e) => ui("bodyCode", e.target.value)} data-testid="set-body-code" />
            </FormRow>
            <FormRow label="Rodapé (antes do fecho de &lt;/body&gt;)">
              <textarea rows={3} className={fieldClass} value={intForm.footerCode} onChange={(e) => ui("footerCode", e.target.value)} data-testid="set-footer-code" />
            </FormRow>
          </div>
        </section>
      </div>

      {/* modal modo de envio */}
      <Modal
        open={methodOpen}
        onClose={() => setMethodOpen(false)}
        title={methodForm.id ? "Editar modo de envio" : "Novo modo de envio"}
        testid="shipmethod-modal"
        footer={(
          <>
            <button onClick={() => setMethodOpen(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={saveMethod} data-testid="shipmethod-save" className="btn-da btn-da-primary text-xs">{methodForm.id ? "Guardar" : "Criar"}</button>
          </>
        )}
      >
        <div className="space-y-4">
          <FormRow label="Nome" required>
            <input className={fieldClass} value={methodForm.name} onChange={(e) => setMethodForm((f) => ({ ...f, name: e.target.value }))} placeholder="ex.: CTT Expresso, Recolha na loja" data-testid="shipmethod-name" />
          </FormRow>
          <FormRow label="Descrição">
            <input className={fieldClass} value={methodForm.description} onChange={(e) => setMethodForm((f) => ({ ...f, description: e.target.value }))} data-testid="shipmethod-description" />
          </FormRow>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Custo (€)">
              <input type="number" step="0.1" min="0" className={fieldClass} value={methodForm.cost} onChange={(e) => setMethodForm((f) => ({ ...f, cost: e.target.value }))} data-testid="shipmethod-cost" />
            </FormRow>
            <FormRow label="Prazo estimado">
              <input className={fieldClass} value={methodForm.eta} onChange={(e) => setMethodForm((f) => ({ ...f, eta: e.target.value }))} placeholder="ex.: 2-3 dias úteis" data-testid="shipmethod-eta" />
            </FormRow>
          </div>
          <FormRow label="Zonas / condições (opcional)">
            <input className={fieldClass} value={methodForm.zones} onChange={(e) => setMethodForm((f) => ({ ...f, zones: e.target.value }))} placeholder="ex.: Portugal Continental" data-testid="shipmethod-zones" />
          </FormRow>
          <div className="flex items-center justify-between border-t hairline pt-4">
            <span className="font-body text-sm">Ativo</span>
            <Toggle checked={methodForm.active} onChange={(v) => setMethodForm((f) => ({ ...f, active: v }))} testid="shipmethod-active" />
          </div>
        </div>
      </Modal>
    </div>
  );
};
