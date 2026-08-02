import React, { useState } from "react";
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { toast } from "sonner";

// Passo de pagamento com Stripe Elements na própria página.
// - ExpressCheckoutElement: botões Apple Pay / Google Pay, que se escondem sozinhos quando o
//   dispositivo não os suporta (e exigem HTTPS + domínio registado no painel Stripe).
// - PaymentElement: cartão, MB Way, Multibanco e PayPal, conforme o que estiver ativo no
//   painel Stripe e o valor da encomenda.

const PaymentForm = ({ returnUrl, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const [walletReady, setWalletReady] = useState(false);

  const confirm = async () => {
    if (!stripe || !elements) return;
    setConfirming(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) { toast.error(submitError.message); return; }
      // Métodos como Multibanco, MB Way e PayPal saem da página; o cartão normalmente não.
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
      });
      // Só chega aqui em caso de erro: no sucesso o Stripe trata do redirecionamento.
      if (error) {
        toast.error("Pagamento não concluído", { description: error.message });
        onError?.(error);
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="stripe-payment-step">
      {/* O elemento tem de ficar montado e visível: é uma iframe que precisa de se medir para
          se inicializar, e dentro de um contentor com display:none nunca chega a reportar as
          carteiras disponíveis. Quando não há nenhuma, colapsa sozinho para altura zero. */}
      <div data-testid="express-checkout">
        <ExpressCheckoutElement
          options={{ buttonHeight: 48 }}
          onReady={({ availablePaymentMethods }) => setWalletReady(!!availablePaymentMethods)}
          onConfirm={confirm}
        />
      </div>

      {walletReady && (
        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-[var(--da-line)]" />
          <span className="font-body text-[11px] tracking-[0.18em] uppercase text-[var(--da-muted)]">ou pagar com</span>
          <span className="flex-1 h-px bg-[var(--da-line)]" />
        </div>
      )}

      <PaymentElement options={{ layout: "accordion" }} />

      <button
        type="button"
        onClick={confirm}
        disabled={!stripe || confirming}
        className="btn-da btn-da-primary w-full disabled:opacity-60"
        data-testid="checkout-pay"
      >
        {confirming ? "A processar…" : "Pagar agora"}
      </button>
    </div>
  );
};

export const StripePaymentStep = ({ stripePromise, clientSecret, returnUrl, onError }) => {
  if (!stripePromise || !clientSecret) return null;
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: "pt",
        appearance: {
          theme: "flat",
          variables: {
            colorPrimary: "#2E9E44",
            colorText: "#1A1A1A",
            fontFamily: "Montserrat, sans-serif",
            borderRadius: "12px",
          },
        },
      }}
    >
      <PaymentForm returnUrl={returnUrl} onError={onError} />
    </Elements>
  );
};
