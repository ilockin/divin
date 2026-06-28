import { initialMenuContent } from "../admin/data/mockMenuContent";

const MENU_CONTENT_KEY = "divinarte-menu-content-v1";

export const loadMenuContent = () => {
  try {
    const raw = localStorage.getItem(MENU_CONTENT_KEY);
    return raw ? JSON.parse(raw) : initialMenuContent;
  } catch {
    return initialMenuContent;
  }
};

export const saveMenuContent = (content) => {
  localStorage.setItem(MENU_CONTENT_KEY, JSON.stringify(content));
};
