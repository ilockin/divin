import { initialFooterContent } from "../admin/data/mockFooterContent";

const FOOTER_CONTENT_KEY = "divinarte-footer-content-v1";

export const loadFooterContent = () => {
  try {
    const raw = localStorage.getItem(FOOTER_CONTENT_KEY);
    return raw ? JSON.parse(raw) : initialFooterContent;
  } catch {
    return initialFooterContent;
  }
};

export const saveFooterContent = (content) => {
  localStorage.setItem(FOOTER_CONTENT_KEY, JSON.stringify(content));
};
