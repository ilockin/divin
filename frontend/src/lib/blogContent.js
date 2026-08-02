import { initialBlogContent } from "../admin/data/mockBlogContent";
import { getContent, saveContent } from "./siteContent";

export const loadBlogContent = () => getContent("blog", initialBlogContent);

export const saveBlogContent = (content) => saveContent("blog", content);
