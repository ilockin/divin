import { initialIntegrations } from "../admin/data/mockIntegrations";

const INTEGRATIONS_KEY = "divinarte-integrations-v1";

export const loadIntegrations = () => {
  try {
    const raw = localStorage.getItem(INTEGRATIONS_KEY);
    return raw ? JSON.parse(raw) : initialIntegrations;
  } catch {
    return initialIntegrations;
  }
};

export const saveIntegrations = (integrations) => {
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
};

// Insere `html` em `target` (document.head/body) e garante que quaisquer <script> dentro dele
// são realmente executados — atribuir innerHTML por si só não corre <script>s.
const injectHtml = (target, html, prepend = false) => {
  if (!html) return;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const nodes = Array.from(wrapper.childNodes);
  nodes.forEach((node) => {
    if (prepend) target.insertBefore(node, target.firstChild);
    else target.appendChild(node);
  });
  nodes.forEach((node) => {
    if (!(node instanceof Element)) return;
    const scripts = node.tagName === "SCRIPT" ? [node] : Array.from(node.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.text = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  });
};

// Chamado uma vez ao carregar a aplicação (ver src/index.js). Lê o que foi guardado nas
// Definições e injeta na página real: gtag (Analytics/Ads), verificação do Search Console,
// e o código avançado de cabeçalho/body/rodapé.
export const applyIntegrations = () => {
  const cfg = loadIntegrations();

  if (cfg.googleAnalyticsId || cfg.googleAdsId) {
    const gtagId = cfg.googleAnalyticsId || cfg.googleAdsId;
    const loader = document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    document.head.appendChild(loader);

    const configs = [cfg.googleAnalyticsId, cfg.googleAdsId].filter(Boolean).map((id) => `gtag('config','${id}');`).join("");
    const inline = document.createElement("script");
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${configs}`;
    document.head.appendChild(inline);
  }

  if (cfg.searchConsoleVerification) {
    const meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = cfg.searchConsoleVerification;
    document.head.appendChild(meta);
  }

  injectHtml(document.head, cfg.headerCode);
  injectHtml(document.body, cfg.bodyCode, true);
  injectHtml(document.body, cfg.footerCode);
};
