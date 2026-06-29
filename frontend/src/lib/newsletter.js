import { initialSubscribers } from "../admin/data/mockNewsletter";

const NEWSLETTER_KEY = "divinarte-newsletter-v1";

export const loadSubscribers = () => {
  try {
    const raw = localStorage.getItem(NEWSLETTER_KEY);
    return raw ? JSON.parse(raw) : initialSubscribers;
  } catch {
    return initialSubscribers;
  }
};

export const saveSubscribers = (subscribers) => {
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(subscribers));
};

// Chamado pelos formulários de newsletter (rodapé e bloco) — sem AdminContext.
// Subscrições duplicadas são ignoradas silenciosamente (UX comum em newsletters).
export const addSubscriber = (email, source) => {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return null;
  const subscribers = loadSubscribers();
  if (subscribers.some((s) => s.email.toLowerCase() === normalized)) return null;
  const subscriber = { id: "sub-" + Date.now(), email: normalized, source, subscribedAt: new Date().toISOString() };
  saveSubscribers([subscriber, ...subscribers]);
  return subscriber;
};
