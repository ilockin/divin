import { loadIntegrations } from "./integrations";

// reCAPTCHA v3 para os formulários públicos (contacto, newsletter, avaliações).
// A site key vive nas Definições › Integrações; o segredo correspondente é verificado na
// Edge Function `public-forms`. Sem site key configurada devolvemos null e a função aceita
// na mesma — de outro modo os formulários ficavam partidos até alguém configurar as chaves.

let scriptPromise = null;

const loadScript = (siteKey) => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Não foi possível carregar o reCAPTCHA."));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

export async function getRecaptchaToken(action = "submit") {
  try {
    const { recaptchaSiteKey } = await loadIntegrations();
    if (!recaptchaSiteKey) return null;
    await loadScript(recaptchaSiteKey);
    return await new Promise((resolve) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(recaptchaSiteKey, { action }).then(resolve).catch(() => resolve(null));
      });
    });
  } catch {
    // Uma falha do reCAPTCHA não pode impedir alguém de enviar uma mensagem; quem decide
    // aceitar ou recusar é a Edge Function.
    return null;
  }
}
