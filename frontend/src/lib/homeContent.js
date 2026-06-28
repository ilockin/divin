import { initialHomeContent } from "../admin/data/mockHomeContent";

const HOME_CONTENT_KEY = "divinarte-home-content-v1";

export const loadHomeContent = () => {
  try {
    const raw = localStorage.getItem(HOME_CONTENT_KEY);
    return raw ? JSON.parse(raw) : initialHomeContent;
  } catch {
    return initialHomeContent;
  }
};

export const saveHomeContent = (content) => {
  localStorage.setItem(HOME_CONTENT_KEY, JSON.stringify(content));
};
