import React from "react";
import {
  LayoutTemplate, Type, Image as ImageIcon, Images, GalleryHorizontal, ShoppingBag, Megaphone, Video as VideoIcon,
  Quote, HelpCircle, Mail, Columns, Minus,
} from "lucide-react";
import { PageHeader, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { BLOCK_LIBRARY, makeBlock } from "../data/mockPages";
import { BlockView } from "../../components/blocks/BlockRenderer";

const BLOCK_ICONS = {
  hero: LayoutTemplate, texto: Type, imagem: ImageIcon, galeria: Images, carrossel: GalleryHorizontal, produtos: ShoppingBag,
  banner: Megaphone, video: VideoIcon, testemunhos: Quote, faq: HelpCircle, newsletter: Mail,
  colunas: Columns, espacador: Minus,
};

export const BlockLibrary = () => {
  const { products } = useAdmin();

  return (
    <div data-testid="admin-block-library">
      <PageHeader
        title="Biblioteca de Blocos"
        subtitle="Catálogo dos blocos disponíveis no Construtor de Páginas."
      />

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 font-body text-sm text-amber-900" data-testid="block-library-note">
        Isto é um catálogo do que já está disponível — não é um sistema de upload/instalação. Novos blocos são
        adicionados ao código pelo programador (não há suporte a plugins de terceiros nesta aplicação, por motivos
        de segurança); depois de adicionados, aparecem automaticamente aqui e na paleta do construtor.
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {BLOCK_LIBRARY.map(({ type, label }) => {
          const Icon = BLOCK_ICONS[type] || LayoutTemplate;
          const block = makeBlock(type);
          return (
            <div key={type} className="bg-white border hairline rounded-2xl overflow-hidden" data-testid={`block-library-${type}`}>
              <div className="px-5 py-4 border-b hairline flex items-center gap-3">
                <Icon size={18} className="text-[var(--da-leaf)]" />
                <SectionTitle eyebrow="bloco" title={label} />
              </div>
              <div className="max-h-72 overflow-y-auto bg-[var(--da-cream-2)]/30">
                <div className="bg-white m-3 rounded-lg border hairline overflow-hidden">
                  <BlockView block={block} products={products} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
