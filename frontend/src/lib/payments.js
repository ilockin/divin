import { supabase } from "./supabaseClient";

// Cria o PaymentIntent de uma encomenda e devolve o client_secret para os Elements.
// O montante é decidido pelo servidor (ver supabase/functions/create-payment-intent) — o que
// vai daqui é só o id da encomenda.
export async function createPaymentIntent(orderId) {
  const { data, error } = await supabase.functions.invoke("create-payment-intent", {
    body: { order_id: orderId },
  });
  if (error) {
    // tentar extrair a mensagem do corpo da resposta
    try { const j = await error.context?.json?.(); if (j?.error) throw new Error(j.error); } catch (e) { if (e.message) throw e; }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data.clientSecret;
}

export const PAYMENT_METHOD_LABELS = {
  card: "Cartão",
  mb_way: "MB Way",
  multibanco: "Multibanco",
  paypal: "PayPal",
  numerario: "Numerário (na loja)",
};

export const paymentMethodLabel = (id) => PAYMENT_METHOD_LABELS[id] || id || "—";
