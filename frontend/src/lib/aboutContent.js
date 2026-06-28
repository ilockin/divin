import { initialAboutContent } from "../admin/data/mockAboutContent";

const ABOUT_CONTENT_KEY = "divinarte-about-content-v1";

export const loadAboutContent = () => {
  try {
    const raw = localStorage.getItem(ABOUT_CONTENT_KEY);
    return raw ? JSON.parse(raw) : initialAboutContent;
  } catch {
    return initialAboutContent;
  }
};

export const saveAboutContent = (content) => {
  localStorage.setItem(ABOUT_CONTENT_KEY, JSON.stringify(content));
};
