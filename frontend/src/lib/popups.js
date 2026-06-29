import { initialPopups } from "../admin/data/mockPopups";

const POPUPS_KEY = "divinarte-popups-v1";

export const loadPopups = () => {
  try {
    const raw = localStorage.getItem(POPUPS_KEY);
    return raw ? JSON.parse(raw) : initialPopups;
  } catch {
    return initialPopups;
  }
};

export const savePopups = (popups) => {
  localStorage.setItem(POPUPS_KEY, JSON.stringify(popups));
};
