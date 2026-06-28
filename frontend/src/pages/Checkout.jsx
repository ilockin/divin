import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Check, CreditCard, Smartphone, Wallet, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../lib/format";
import { initialCoupons } from "../admin/data/mockMarketing";
import { validateCoupon, couponToPromo } from "../lib/coupons";

const STEPS = ["Contacto e Envio", "Método de Envio", "Pagamento"];

export const Checkout = () => {
  const { items, totals, clear, promo, applyPromo, clearPromo } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", phone: "",
    address: "", city: "", zip: "", country: "Portugal",
    shipping: "standard", payment: "card",
  });

  if (items.length === 0 && !submitted) return <Navigate to="/carrinho" replace />;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const applyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const coupon = initialCoupons.find((c) => c.code === code);
    if (!coupon) { toast.error("Cupão inválido."); return; }
    const result = validateCoupon(coupon, { subtotal: totals.subtotal, items });
    if (!result.ok) { toast.error(result.reason); return; }
    applyPromo(couponToPromo(coupon));
    toast.success(`Cupão ${coupon.code} aplicado.`);
    setCouponCode("");
  };

  const afterDiscount = totals.subtotal - totals.discount;
  const shippingPrice = form.shipping === "express" ? 7.9 : afterDiscount >= 49 ? 0 : 4.9;
  const total = afterDiscount + shippingPrice;

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    const orderId = "DA-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const order = { id: orderId, items, total, form };
    sessionStorage.setItem("divinarte-last-order", JSON.stringify(order));
    setSubmitted(true);
    clear();
    navigate("/checkout/sucesso?order=" + orderId, { replace: true });
  };

  return (
    <div className="container-da py-12" data-testid="checkout-page">
      <Link to="/carrinho" className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] hover:text-[var(--da-leaf)]">← Voltar ao carrinho</Link>
      <h1 className="text-3xl sm:text-4xl mt-4">Finalizar compra</h1>

      {/* stepper */}
      <ol className="flex items-center gap-3 mt-8 mb-10 flex-wrap">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i <= step ? "bg-[var(--da-leaf)] text-white" : "bg-[var(--da-cream-2)] text-[var(--da-muted)]"}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-xs tracking-[0.18em] uppercase font-body ${i === step ? "text-[var(--da-forest)]" : "text-[var(--da-muted)]"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="w-8 h-px bg-[var(--da-line)]" />}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-8" data-testid="checkout-form">
          {step === 0 && (
            <section className="space-y-5" data-testid="step-contact">
              <h2 className="text-xl">Contacto</h2>
              <Field label="E-mail" required value={form.email} onChange={(v) => update("email", v)} type="email" testid="co-email" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nome" required value={form.firstName} onChange={(v) => update("firstName", v)} testid="co-first-name" />
                <Field label="Apelido" required value={form.lastName} onChange={(v) => update("lastName", v)} testid="co-last-name" />
              </div>
              <Field label="Telemóvel" value={form.phone} onChange={(v) => update("phone", v)} testid="co-phone" />

              <h2 className="text-xl pt-6">Morada de envio</h2>
              <Field label="Morada" required value={form.address} onChange={(v) => update("address", v)} testid="co-address" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Cidade" required value={form.city} onChange={(v) => update("city", v)} testid="co-city" />
                <Field label="Código Postal" required value={form.zip} onChange={(v) => update("zip", v)} testid="co-zip" />
              </div>
              <Field label="País" required value={form.country} onChange={(v) => update("country", v)} testid="co-country" />
            </section>
          )}

          {step === 1 && (
            <section className="space-y-3" data-testid="step-shipping">
              <h2 className="text-xl mb-4">Método de envio</h2>
              <RadioCard
                checked={form.shipping === "standard"}
                onChange={() => update("shipping", "standard")}
                title="Envio Standard"
                desc="2-4 dias úteis"
                price={afterDiscount >= 49 ? "Grátis" : formatEUR(4.9)}
                testid="ship-standard"
              />
              <RadioCard
                checked={form.shipping === "express"}
                onChange={() => update("shipping", "express")}
                title="Envio Expresso"
                desc="24h em Portugal Continental"
                price={formatEUR(7.9)}
                testid="ship-express"
              />
            </section>
          )}

          {step === 2 && (
            <section className="space-y-3" data-testid="step-payment">
              <h2 className="text-xl mb-4">Pagamento</h2>
              <RadioCard checked={form.payment === "card"} onChange={() => update("payment", "card")} title="Cartão de crédito" desc="Visa, Mastercard — via Stripe" icon={CreditCard} testid="pay-card" />
              <RadioCard checked={form.payment === "mbway"} onChange={() => update("payment", "mbway")} title="MB Way" desc="Pagamento via telemóvel" icon={Smartphone} testid="pay-mbway" />
              <RadioCard checked={form.payment === "multibanco"} onChange={() => update("payment", "multibanco")} title="Multibanco" desc="Referência por e-mail" icon={Building2} testid="pay-multibanco" />
              <RadioCard checked={form.payment === "paypal"} onChange={() => update("payment", "paypal")} title="PayPal" desc="Conta PayPal ou cartão" icon={Wallet} testid="pay-paypal" />
              <p className="font-body text-xs text-[var(--da-muted)] mt-4 italic">Demonstração — nenhum pagamento real será processado.</p>
            </section>
          )}

          <div className="flex justify-between pt-6 border-t hairline">
            {step > 0 ? (
              <button type="button" onClick={prev} className="btn-da btn-da-ghost" data-testid="step-prev">Voltar</button>
            ) : <span />}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="btn-da btn-da-primary" data-testid="step-next">Continuar</button>
            ) : (
              <button type="button" onClick={finish} className="btn-da btn-da-primary" data-testid="checkout-finish">Finalizar compra</button>
            )}
          </div>
        </div>

        <aside className="bg-white rounded-2xl border hairline p-6 h-fit sticky top-32">
          <h2 className="text-xl mb-5">Resumo da encomenda</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3">
                <img src={it.image} alt="" className="w-14 h-16 object-cover rounded bg-[var(--da-cream-2)]" />
                <div className="flex-1">
                  <p className="font-body text-xs">{it.name}</p>
                  <p className="font-body text-[11px] text-[var(--da-muted)]">x{it.qty} · {it.size}</p>
                </div>
                <span className="font-body text-xs font-semibold">{formatEUR(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          {!promo && (
            <form onSubmit={applyCoupon} className="border-t hairline mt-5 pt-4 flex gap-2" data-testid="checkout-coupon-form">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Cupão de desconto"
                data-testid="checkout-coupon-input"
                className="flex-1 bg-white border hairline rounded-lg px-3.5 py-2.5 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]"
              />
              <button type="submit" data-testid="checkout-coupon-apply" className="btn-da btn-da-outline text-xs whitespace-nowrap">Aplicar</button>
            </form>
          )}

          <div className="border-t hairline mt-4 pt-4 space-y-2 font-body text-sm">
            <div className="flex justify-between"><span className="text-[var(--da-muted)]">Subtotal</span><span>{formatEUR(totals.subtotal)}</span></div>
            {promo && totals.discount > 0 && (
              <div className="flex justify-between text-[var(--da-leaf)]" data-testid="checkout-discount">
                <span className="flex items-center gap-2">
                  {promo.label}
                  <button onClick={clearPromo} className="text-[var(--da-muted)] hover:text-red-600 text-xs underline" data-testid="checkout-remove-promo">remover</button>
                </span>
                <span>− {formatEUR(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span className="text-[var(--da-muted)]">Envio</span><span>{shippingPrice === 0 ? "Grátis" : formatEUR(shippingPrice)}</span></div>
          </div>
          <div className="border-t hairline mt-4 pt-4 flex justify-between text-lg font-semibold">
            <span>Total</span><span data-testid="checkout-total">{formatEUR(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, required, type = "text", testid }) => (
  <label className="block">
    <span className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">{label}{required && " *"}</span>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]"
    />
  </label>
);

const RadioCard = ({ checked, onChange, title, desc, price, icon: Icon, testid }) => (
  <button
    type="button"
    onClick={onChange}
    data-testid={testid}
    className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 text-left transition ${
      checked ? "border-[var(--da-leaf)] bg-[var(--da-cream-2)]/40" : "border-[var(--da-line)] hover:border-[var(--da-forest)]"
    }`}
  >
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? "border-[var(--da-leaf)]" : "border-[var(--da-line)]"}`}>
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-[var(--da-leaf)]" />}
    </span>
    {Icon && <Icon size={20} className="text-[var(--da-forest)]" />}
    <div className="flex-1">
      <p className="font-serif-display tracking-[0.08em] text-sm text-[var(--da-forest)]">{title}</p>
      <p className="font-body text-xs text-[var(--da-muted)] mt-0.5">{desc}</p>
    </div>
    {price && <span className="font-body text-sm font-semibold">{price}</span>}
  </button>
);
