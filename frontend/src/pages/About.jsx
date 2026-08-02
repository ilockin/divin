import React, { useEffect, useState } from "react";
import { loadAboutContent } from "../lib/aboutContent";
import { initialAboutContent } from "../admin/data/mockAboutContent";
import { ABOUT_SECTIONS } from "../components/about/AboutSections";
import { EditPageButton } from "../components/EditPageButton";

export const About = () => {
  const [content, setContent] = useState(initialAboutContent);
  useEffect(() => { loadAboutContent().then(setContent).catch(() => {}); }, []);

  return (
    <div data-testid="about-page">
      {ABOUT_SECTIONS.map(({ key, Component }) => <Component key={key} content={content[key]} />)}
      <EditPageButton editorPath="/admin/conteudo-sobre" />
    </div>
  );
};
