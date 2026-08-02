import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublishedPage } from "../lib/pages";
import { BlockRenderer } from "../components/blocks/BlockRenderer";
import { products as catalogProducts } from "../data/mock";

export const DynamicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublishedPage(slug)
      .then(setPage)
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Só mostrar "não encontrada" depois do pedido terminar.
  if (loading) return <div className="container-da py-24" data-testid="dynamic-page-loading" />;

  if (!page) {
    return (
      <div className="container-da py-24 text-center" data-testid="dynamic-page-not-found">
        <p className="font-script text-[var(--da-leaf)] text-2xl">página não encontrada</p>
        <h1 className="text-3xl sm:text-4xl mt-2">Não há nada por aqui</h1>
        <p className="font-body text-[var(--da-muted)] mt-4 max-w-md mx-auto">
          Esta página não existe ou ainda não foi publicada no construtor de páginas.
        </p>
        <Link to="/" className="btn-da btn-da-primary mt-8">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div data-testid="dynamic-page">
      <BlockRenderer blocks={page.blocks} products={catalogProducts} />
    </div>
  );
};
