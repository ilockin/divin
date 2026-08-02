import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { loadPublishedArticles, findArticle } from "../lib/articles";
import { loadBlogContent } from "../lib/blogContent";
import { initialBlogContent } from "../admin/data/mockBlogContent";
import { HeaderSection } from "../components/blog/BlogSections";
import { EditPageButton } from "../components/EditPageButton";
import { EditArticleButton } from "../components/EditArticleButton";

export const Blog = () => {
  const [content, setContent] = useState(initialBlogContent);
  const [posts, setPosts] = useState([]);
  useEffect(() => { loadBlogContent().then(setContent).catch(() => {}); }, []);
  useEffect(() => { loadPublishedArticles().then(setPosts).catch(() => {}); }, []);

  return (
    <div className="container-da py-12" data-testid="blog-page">
      <HeaderSection content={content.header} />

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {posts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="group block" data-testid={`blog-card-${post.slug}`}>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img src={post.cover} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="font-body text-[10px] tracking-[0.22em] uppercase text-[var(--da-leaf)] mt-5">{post.category} · {new Date(post.date).toLocaleDateString("pt-PT")}</p>
            <h3 className="text-xl mt-2 group-hover:text-[var(--da-leaf)] transition-colors">{post.title}</h3>
            <p className="font-body text-sm text-[var(--da-muted)] mt-2 leading-relaxed">{post.excerpt}</p>
          </Link>
        ))}
      </div>
      <EditPageButton editorPath="/admin/conteudo-blog" />
    </div>
  );
};

export const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    findArticle(slug)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    loadPublishedArticles()
      .then((all) => setRelated(all.filter((p) => p.slug !== slug).slice(0, 2)))
      .catch(() => {});
  }, [slug]);

  // Só decidir "não existe" depois do pedido terminar, senão pisca um redirecionamento falso.
  if (loading) return <div className="container-da py-24" data-testid="blog-post-loading" />;
  if (!post || post.status !== "publicado") return <Navigate to="/blog" replace />;

  return (
    <article className="py-12" data-testid="blog-post-page">
      <div className="container-da max-w-3xl">
        <Link to="/blog" className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-muted)] hover:text-[var(--da-leaf)]">← Voltar ao blog</Link>
        <p className="font-body text-[10px] tracking-[0.22em] uppercase text-[var(--da-leaf)] mt-6">{post.category} · {new Date(post.date).toLocaleDateString("pt-PT")}</p>
        <h1 className="text-3xl sm:text-5xl mt-3 leading-tight">{post.title}</h1>
        <p className="font-body text-sm text-[var(--da-muted)] mt-3">Por {post.author}</p>
      </div>
      <div className="container-da max-w-4xl mt-10">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl">
          <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="container-da max-w-3xl mt-10 article-content" dangerouslySetInnerHTML={{ __html: post.body }} />

      {related.length > 0 && (
        <div className="container-da max-w-3xl mt-16 pt-10 border-t hairline">
          <h2 className="text-2xl mb-6">Continua a ler</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {related.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="block group">
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
                  <img src={p.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[var(--da-leaf)] mt-4">{p.category}</p>
                <h3 className="text-lg mt-1">{p.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
      <EditArticleButton slug={post.slug} />
    </article>
  );
};
