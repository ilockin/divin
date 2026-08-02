import React, { useEffect, useState } from "react";
import { loadHomeContent } from "../lib/homeContent";
import { initialHomeContent } from "../admin/data/mockHomeContent";
import { HOME_SECTIONS } from "../components/home/HomeSections";
import { EditPageButton } from "../components/EditPageButton";

export const Home = () => {
  // Arranca nos valores de fábrica e troca quando o Supabase responder — evita um ecrã
  // vazio no primeiro render.
  const [content, setContent] = useState(initialHomeContent);
  useEffect(() => { loadHomeContent().then(setContent).catch(() => {}); }, []);

  return (
    <div data-testid="home-page">
      {HOME_SECTIONS.map(({ key, Component }) => <Component key={key} content={content[key]} />)}
      <EditPageButton editorPath="/admin/conteudo-inicio" />
    </div>
  );
};
