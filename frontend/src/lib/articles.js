import { adminArticles } from "../admin/data/mockAdmin";

const ARTICLES_KEY = "divinarte-articles-v1";

// Liga os artigos editados no admin (/admin/blog) à loja pública — antes deste ficheiro,
// a loja lia sempre o array estático `blogPosts` de data/mock.js, nunca o que era editado no admin.
export const loadArticles = () => {
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    return raw ? JSON.parse(raw) : adminArticles;
  } catch {
    return adminArticles;
  }
};

export const saveArticles = (articles) => {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
};

export const findArticle = (slug) => loadArticles().find((a) => a.slug === slug);

// Só os publicados aparecem na loja.
export const loadPublishedArticles = () => loadArticles().filter((a) => a.status === "publicado");
