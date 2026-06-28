import { initialPages } from "../admin/data/mockPages";

const PAGES_KEY = "divinarte-pages-v1";

export const loadPages = () => {
  try {
    const raw = localStorage.getItem(PAGES_KEY);
    return raw ? JSON.parse(raw) : initialPages;
  } catch {
    return initialPages;
  }
};

export const savePages = (pages) => {
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
};

export const getPublishedPage = (slug) =>
  loadPages().find((p) => p.slug === slug && p.status === "publicado") || null;
