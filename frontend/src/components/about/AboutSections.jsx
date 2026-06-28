import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Heart, Sparkles, BadgeCheck } from "lucide-react";
import {
  titleClassFor as titleClass, titleStyleFor as titleStyle, buttonStyleFor as buttonStyle,
  eyebrowClassFor as eyebrowClass, eyebrowStyleFor as eyebrowStyle,
  bodyClassFor as bodyClass, bodyStyleFor as bodyStyle,
  textClassFor, textStyleFor,
} from "../../lib/contentStyle";
import { TEXT_SIZE_OPTIONS } from "../../admin/data/contentStyleOptions";

const itemTitleClass = (c) => textClassFor(c, "itemTitle", TEXT_SIZE_OPTIONS);
const itemTitleStyle = (c) => textStyleFor(c, "itemTitle");
const itemTextClass = (c) => textClassFor(c, "itemText", TEXT_SIZE_OPTIONS);
const itemTextStyle = (c) => textStyleFor(c, "itemText");

const VALUE_ICONS = [Leaf, Heart, Sparkles, BadgeCheck];

export const HeroSection = ({ content }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={content.image} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[var(--da-pine)]/55" />
    </div>
    <div className="relative container-da py-28 sm:py-36 text-center">
      <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
      <h1 className={`${titleClass(content)} mt-2`} style={titleStyle(content)}>
        {content.title}
      </h1>
      <p className={`${bodyClass(content)} mt-6 max-w-2xl mx-auto leading-relaxed`} style={bodyStyle(content)}>
        {content.subtitle}
      </p>
    </div>
  </section>
);

export const StorySection = ({ content }) => (
  <section className="container-da py-20 grid lg:grid-cols-2 gap-12 items-center">
    <div className="aspect-[4/5] overflow-hidden rounded-2xl">
      <img src={content.image} alt="" className="w-full h-full object-cover" />
    </div>
    <div>
      <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
      <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
      <p className={`${bodyClass(content)} mt-6 leading-relaxed`} style={bodyStyle(content)}>
        {content.paragraph1}
      </p>
      <p className={`${bodyClass(content)} mt-4 leading-relaxed`} style={bodyStyle(content)}>
        {content.paragraph2}
      </p>
    </div>
  </section>
);

export const ValuesSection = ({ content }) => (
  <section className="bg-[var(--da-cream-2)]">
    <div className="container-da py-20">
      <div className="text-center">
        <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
        <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
      </div>
      <div className="grid md:grid-cols-4 gap-6 mt-12">
        {content.items.map((item, i) => {
          const Icon = VALUE_ICONS[i] || Leaf;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border hairline">
              <Icon className="text-[var(--da-leaf)]" size={24} />
              <h3 className={`${itemTitleClass(content)} mt-4`} style={itemTitleStyle(content)}>{item.title}</h3>
              <p className={`${itemTextClass(content)} mt-2 leading-relaxed`} style={itemTextStyle(content)}>{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export const CtaSection = ({ content }) => (
  <section className="container-da py-20 text-center">
    <p className="font-script text-[var(--da-leaf)] text-2xl">{content.eyebrow}</p>
    <h2 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h2>
    <Link to={content.buttonLink} className="btn-da btn-da-primary mt-8" style={buttonStyle(content, "button")} data-testid="about-cta">
      {content.buttonText}
    </Link>
  </section>
);

export const ABOUT_SECTIONS = [
  { key: "hero", label: "Hero", Component: HeroSection },
  { key: "story", label: "Como começou", Component: StorySection },
  { key: "values", label: "Valores", Component: ValuesSection },
  { key: "cta", label: "Chamada final", Component: CtaSection },
];
