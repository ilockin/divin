import { initialFooterContent } from "../admin/data/mockFooterContent";
import { getContent, saveContent } from "./siteContent";

export const loadFooterContent = () => getContent("footer", initialFooterContent);

export const saveFooterContent = (content) => saveContent("footer", content);
