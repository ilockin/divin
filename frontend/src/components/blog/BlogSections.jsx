import React from "react";
import {
  titleClassFor as titleClass, titleStyleFor as titleStyle,
  eyebrowClassFor as eyebrowClass, eyebrowStyleFor as eyebrowStyle,
  bodyClassFor as bodyClass, bodyStyleFor as bodyStyle,
} from "../../lib/contentStyle";

export const HeaderSection = ({ content }) => (
  <div data-testid="blog-header">
    <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
    <h1 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h1>
    <p className={`${bodyClass(content)} mt-4 max-w-2xl`} style={bodyStyle(content)}>{content.subtitle}</p>
  </div>
);
