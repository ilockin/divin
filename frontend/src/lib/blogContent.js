import { initialBlogContent } from "../admin/data/mockBlogContent";

const BLOG_CONTENT_KEY = "divinarte-blog-content-v1";

export const loadBlogContent = () => {
  try {
    const raw = localStorage.getItem(BLOG_CONTENT_KEY);
    return raw ? JSON.parse(raw) : initialBlogContent;
  } catch {
    return initialBlogContent;
  }
};

export const saveBlogContent = (content) => {
  localStorage.setItem(BLOG_CONTENT_KEY, JSON.stringify(content));
};
