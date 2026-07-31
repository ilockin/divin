import React, { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { listAllProducts } from "../../lib/adminProducts";
import { formatEUR } from "../../lib/format";
import { formatCommission, calcCommission } from "../../lib/commission";

export const AfiliadoLinks = () => {
  const { me } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllProducts()
      .then((ps) => setProducts(ps.filter((p) => p.status === "publicado")))
      .catch((e) => toast.error("Erro ao carregar produtos", { description: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const linkFor = (slug) => `${window.location.origin}/produto/${slug}?ref=${me.affiliateCode || ""}`;

  const copy = async (slug) => {
    if (!me.affiliateCode) { toast.error("Ainda não tens código de afiliado."); return; }
    try {
      await navigator.clipboard.writeText(linkFor(slug));
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  return (
    <div data-testid="afiliado-links">
      <PageHeader title="Meus Links" subtitle="Copia o link de afiliado de cada produto para partilhar com os teus clientes." />
      <div className="bg-white border hairline rounded-2xl">
        <div className="px-5 py-4 border-b hairline">
          <SectionTitle eyebrow="o teu código" title={me.affiliateCode || "sem código atribuído"} />
        </div>
        {loading ? (
          <p className="font-body text-sm text-[var(--da-muted)] px-5 py-8">A carregar…</p>
        ) : (
          <ul className="divide-y hairline" data-testid="afiliado-links-list">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-md bg-[var(--da-cream-2)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-[var(--da-forest)] truncate">{p.name}</p>
                  <p className="font-body text-[11px] text-[var(--da-muted)] truncate">{formatEUR(p.price)} · comissão {formatCommission(p)} ({formatEUR(calcCommission(p, 1))}/unid.)</p>
                </div>
                <button
                  onClick={() => copy(p.slug)}
                  data-testid={`afiliado-link-copy-${p.id}`}
                  className="btn-da btn-da-outline text-xs shrink-0"
                >
                  <Copy size={14} /> Copiar link
                </button>
              </li>
            ))}
            {products.length === 0 && (
              <li className="px-5 py-8 font-body text-sm text-[var(--da-muted)]">Sem produtos publicados.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
