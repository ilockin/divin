import React from "react";
import { loadAboutContent } from "../lib/aboutContent";
import { ABOUT_SECTIONS } from "../components/about/AboutSections";
import { EditPageButton } from "../components/EditPageButton";

export const About = () => {
  const content = loadAboutContent();

  return (
    <div data-testid="about-page">
      {ABOUT_SECTIONS.map(({ key, Component }) => <Component key={key} content={content[key]} />)}
      <EditPageButton editorPath="/admin/conteudo-sobre" />
    </div>
  );
};
