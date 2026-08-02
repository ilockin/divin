import { initialAboutContent } from "../admin/data/mockAboutContent";
import { getContent, saveContent } from "./siteContent";

export const loadAboutContent = () => getContent("about", initialAboutContent);

export const saveAboutContent = (content) => saveContent("about", content);
