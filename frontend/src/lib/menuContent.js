import { initialMenuContent } from "../admin/data/mockMenuContent";
import { getContent, saveContent } from "./siteContent";

export const loadMenuContent = () => getContent("menu", initialMenuContent);

export const saveMenuContent = (content) => saveContent("menu", content);
