import React from "react";
import { Video as VideoIcon } from "lucide-react";
import { formatEUR } from "../../lib/format";

const alignClass = (a) => (a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left");
const imgAlign = (a) => (a === "center" ? "mx-auto" : a === "right" ? "ml-auto" : "mr-auto");

// Renderização de um único bloco — usado pelo construtor (tela/pré-visualização) e pelo storefront.
export const BlockView = ({ block, products = [] }) => {
  const p = block.props;
  switch (block.type) {
    case "hero":
      return (
        <div className={`px-8 py-16 ${alignClass(p.align)}`} style={{ background: p.bg, color: "#F7F4EC" }}>
          <h2 className="font-serif-display text-3xl sm:text-4xl tracking-[0.06em]" style={{ color: "#F7F4EC" }}>{p.title}</h2>
          {p.subtitle && <p className="font-body mt-3 text-white/85 max-w-xl mx-auto">{p.subtitle}</p>}
          {p.buttonText && <span className="inline-block mt-6 px-6 py-2.5 rounded-full bg-[var(--da-leaf)] text-white font-body text-sm">{p.buttonText}</span>}
        </div>
      );
    case "texto":
      return <div className={`px-8 py-8 font-body text-[var(--da-ink)] leading-relaxed ${alignClass(p.align)}`}>{p.text}</div>;
    case "imagem":
      return (
        <div className="px-8 py-6">
          <img src={p.src} alt={p.alt} className={`rounded-xl max-w-full max-h-[360px] object-cover ${imgAlign(p.align)}`} />
        </div>
      );
    case "galeria":
      return (
        <div className="px-8 py-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(p.items || []).map((it, i) => <img key={i} src={it.url} alt="" className="rounded-lg aspect-square object-cover w-full" />)}
        </div>
      );
    case "produtos":
      return (
        <div className="px-8 py-8">
          {p.title && <h3 className="font-serif-display text-2xl text-[var(--da-forest)] text-center mb-6 tracking-[0.06em]">{p.title}</h3>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.slice(0, p.count || 3).map((pr) => (
              <div key={pr.id} className="border hairline rounded-xl overflow-hidden bg-white">
                <img src={pr.images?.[0]} alt="" className="w-full aspect-[4/5] object-cover" />
                <div className="p-3">
                  <p className="font-body text-sm font-semibold text-[var(--da-forest)] truncate">{pr.name}</p>
                  <p className="font-body text-xs text-[var(--da-muted)]">{formatEUR(pr.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "banner":
      return (
        <div className="px-8 py-12 text-center" style={{ background: p.bg, color: "#fff" }}>
          <h3 className="font-serif-display text-2xl tracking-[0.06em]" style={{ color: "#fff" }}>{p.title}</h3>
          {p.text && <p className="font-body mt-2 text-white/90">{p.text}</p>}
          {p.buttonText && <span className="inline-block mt-5 px-6 py-2.5 rounded-full bg-white text-[var(--da-forest)] font-body text-sm">{p.buttonText}</span>}
        </div>
      );
    case "video":
      return (
        <div className="px-8 py-6">
          {p.url ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe src={p.url} title="Vídeo" className="w-full h-full" allowFullScreen />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-[var(--da-cream-2)] flex items-center justify-center text-[var(--da-muted)] font-body text-sm">
              <VideoIcon size={28} className="mr-2" /> Adicione o URL do vídeo
            </div>
          )}
          {p.caption && <p className="font-body text-xs text-[var(--da-muted)] mt-2 text-center">{p.caption}</p>}
        </div>
      );
    case "testemunhos":
      return (
        <div className="px-8 py-8">
          {p.title && <h3 className="font-serif-display text-2xl text-[var(--da-forest)] text-center mb-6 tracking-[0.06em]">{p.title}</h3>}
          <div className="grid sm:grid-cols-2 gap-4">
            {(p.items || []).map((t, i) => (
              <div key={i} className="border hairline rounded-xl p-5 bg-white">
                <p className="font-script text-xl text-[var(--da-leaf)]">"{t.text}"</p>
                <p className="font-body text-sm text-[var(--da-muted)] mt-2">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "faq":
      return (
        <div className="px-8 py-8 max-w-2xl mx-auto">
          {p.title && <h3 className="font-serif-display text-2xl text-[var(--da-forest)] text-center mb-5 tracking-[0.06em]">{p.title}</h3>}
          <div className="space-y-2">
            {(p.items || []).map((f, i) => (
              <details key={i} className="border hairline rounded-lg px-4 py-3 bg-white">
                <summary className="font-body text-sm font-semibold text-[var(--da-forest)] cursor-pointer">{f.q}</summary>
                <p className="font-body text-sm text-[var(--da-muted)] mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      );
    case "newsletter":
      return (
        <div className="px-8 py-12 bg-[var(--da-cream-2)]/60 text-center">
          <h3 className="font-serif-display text-2xl text-[var(--da-forest)] tracking-[0.06em]">{p.title}</h3>
          {p.text && <p className="font-body mt-2 text-[var(--da-muted)]">{p.text}</p>}
          <div className="mt-5 flex items-center gap-2 justify-center">
            <span className="px-4 py-2.5 rounded-full border hairline bg-white font-body text-sm text-[var(--da-muted)]">o-seu@email.pt</span>
            <span className="px-6 py-2.5 rounded-full bg-[var(--da-leaf)] text-white font-body text-sm">{p.buttonText}</span>
          </div>
        </div>
      );
    case "colunas":
      return (
        <div className="px-8 py-8 grid sm:grid-cols-2 gap-6 font-body text-[var(--da-ink)] leading-relaxed">
          <div>{p.col1}</div>
          <div>{p.col2}</div>
        </div>
      );
    case "espacador":
      return <div style={{ height: `${p.height}px` }} />;
    default:
      return null;
  }
};

// Renderiza uma lista de blocos em sequência — usado pelo storefront e pela pré-visualização do construtor.
export const BlockRenderer = ({ blocks = [], products = [] }) => (
  <>
    {blocks.map((b) => <BlockView key={b.id} block={b} products={products} />)}
  </>
);
