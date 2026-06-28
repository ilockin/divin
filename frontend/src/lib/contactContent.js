import { initialContactContent } from "../admin/data/mockContactContent";

const CONTACT_CONTENT_KEY = "divinarte-contact-content-v1";

export const loadContactContent = () => {
  try {
    const raw = localStorage.getItem(CONTACT_CONTENT_KEY);
    return raw ? JSON.parse(raw) : initialContactContent;
  } catch {
    return initialContactContent;
  }
};

export const saveContactContent = (content) => {
  localStorage.setItem(CONTACT_CONTENT_KEY, JSON.stringify(content));
};
