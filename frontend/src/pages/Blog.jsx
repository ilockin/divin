import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { blogPosts, findPost } from "../data/mock";

export const Blog = () => {
  return (
    <div className="container-da py-12" data-testid="blog-page">
      <p className="font-script text-[var(--da-leaf)] text-2xl">do nosso diário</p>
      <h1 className="text-4xl sm:text-5xl mt-1">Blog</h1>
      <p className="font-body text-[var(--da-muted)] mt-4 max-w-2xl">Rituais, ingredientes e pequenas reflexões sobre a arte de cuidar.</p>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {blogPosts.map((post) => (
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
    </div>
  );
};

export const BlogPost = () => {
  const { slug } = useParams();
  const post = findPost(slug);
  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

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
      <div className="container-da max-w-3xl mt-10 font-body text-base leading-relaxed text-[var(--da-ink)] space-y-5">
        <p>{post.body}</p>
        <p>Estes pequenos momentos não exigem grandes preparativos. Bastam alguns minutos, uma luz suave, e a vontade de pausar. Acreditamos que a beleza acontece quando o cuidado é simples — feito de gestos repetidos com atenção.</p>
        <p>Em cada artigo partilhamos uma parte do nosso modo de fazer. Esperamos que aqui encontres inspiração para os teus próprios rituais.</p>
        <blockquote className="border-l-4 border-[var(--da-leaf)] pl-5 italic text-[var(--da-forest)] font-serif-display normal-case" style={{ letterSpacing: "0.02em" }}>
          “Cuidar é a forma mais antiga de bondade.”
        </blockquote>
      </div>

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
    </article>
  );
};
