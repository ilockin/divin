import { initialHomeContent } from "../admin/data/mockHomeContent";
import { getContent, saveContent } from "./siteContent";

export const loadHomeContent = () => getContent("home", initialHomeContent);

export const saveHomeContent = (content) => saveContent("home", content);
