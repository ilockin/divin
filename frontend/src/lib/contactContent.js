import { initialContactContent } from "../admin/data/mockContactContent";
import { getContent, saveContent } from "./siteContent";

export const loadContactContent = () => getContent("contact", initialContactContent);

export const saveContactContent = (content) => saveContent("contact", content);
