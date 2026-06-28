import React from "react";
import { loadHomeContent } from "../lib/homeContent";
import { HOME_SECTIONS } from "../components/home/HomeSections";

export const Home = () => {
  const content = loadHomeContent();

  return (
    <div data-testid="home-page">
      {HOME_SECTIONS.map(({ key, Component }) => <Component key={key} content={content[key]} />)}
    </div>
  );
};
