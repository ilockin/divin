import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Heart, Sparkles, BadgeCheck } from "lucide-react";
import { getPublishedPage } from "../lib/pages";
import { BlockRenderer } from "../components/blocks/BlockRenderer";
import { products as catalogProducts } from "../data/mock";

export const About = () => {
  const overridePage = getPublishedPage("sobre");
  if (overridePage) {
    return (
      <div data-testid="about-page">
        <BlockRenderer blocks={overridePage.blocks} products={catalogProducts} />
      </div>
    );
  }

  return (
  <div data-testid="about-page">
    {/* hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=2000&q=70" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[var(--da-pine)]/55" />
      </div>
      <div className="relative container-da py-28 sm:py-36 text-center">
        <p className="font-script text-[var(--da-olive)] text-3xl">a nossa história</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl mt-2" style={{ color: "#F7F4EC" }}>
          Cuidar é uma forma de bondade.
        </h1>
        <p className="font-body text-base text-white/85 mt-6 max-w-2xl mx-auto leading-relaxed">
          A DivinArte nasce do gesto simples de cuidar. Pequenos lotes, ingredientes naturais, mãos atentas — para que cada produto seja um momento de pausa.
        </p>
      </div>
    </section>

    <section className="container-da py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=70" alt="" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="font-script text-[var(--da-leaf)] text-2xl">como começou</p>
        <h2 className="text-3xl sm:text-4xl mt-1">Um diário de plantas e gestos.</h2>
        <p className="font-body text-base text-[var(--da-ink)] mt-6 leading-relaxed">
          A nossa marca foi crescendo aos poucos — entre infusões, óleos macerados e cadernos cheios de notas. Acreditamos que a cosmética pode ser feita com a mesma atenção com que se cozinha em casa: poucos ingredientes, escolhidos com cuidado, e respeito pelo tempo.
        </p>
        <p className="font-body text-base text-[var(--da-ink)] mt-4 leading-relaxed">
          Inspiramo-nos numa visão serena e cristã do cuidado — cuidar do outro como gesto silencioso de amor, sem promessas grandiosas, sem milagres. Apenas pequenos rituais, repetidos com atenção.
        </p>
      </div>
    </section>

    <section className="bg-[var(--da-cream-2)]">
      <div className="container-da py-20">
        <div className="text-center">
          <p className="font-script text-[var(--da-leaf)] text-2xl">os nossos valores</p>
          <h2 className="text-3xl sm:text-4xl mt-1">No que acreditamos</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {[
            { Icon: Leaf, title: "Natural", text: "Ingredientes de origem botânica, escolhidos pela sua bondade." },
            { Icon: Heart, title: "Cuidado", text: "Pequenos lotes, mãos atentas, produção artesanal em Portugal." },
            { Icon: Sparkles, title: "Sereno", text: "Aromas suaves, embalagens limpas, gestos sem pressa." },
            { Icon: BadgeCheck, title: "Honesto", text: "Comunicação clara, sem promessas que não podemos cumprir." },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border hairline">
              <Icon className="text-[var(--da-leaf)]" size={24} />
              <h3 className="text-lg mt-4">{title}</h3>
              <p className="font-body text-sm text-[var(--da-muted)] mt-2 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="container-da py-20 text-center">
      <p className="font-script text-[var(--da-leaf)] text-2xl">vamos cuidar juntos</p>
      <h2 className="text-3xl sm:text-4xl mt-1">Começa o teu ritual</h2>
      <Link to="/loja" className="btn-da btn-da-primary mt-8" data-testid="about-cta">Descobrir a loja</Link>
    </section>
  </div>
  );
};
