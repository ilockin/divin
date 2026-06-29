import React, { useMemo, useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutTemplate, Type, Image as ImageIcon, Images, GalleryHorizontal, ShoppingBag, Megaphone, Video as VideoIcon,
  Quote, HelpCircle, Mail, Columns, Minus, ChevronUp, ChevronDown, Trash2, Copy, Plus, Save, ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../context/AdminContext";
import { BLOCK_LIBRARY, BLOCK_LABELS, makeBlock } from "../data/mockPages";
import { TRIGGER_TYPES, PLACEMENT_TYPES, FREQUENCY_TYPES, PLACEMENT_PAGE_OPTIONS } from "../data/mockPopups";
import { categories } from "../../data/mock";
import { FormRow, fieldClass, PageHeader } from "../components/Bits";
import { BlockView } from "../../components/blocks/BlockRenderer";
import { BlockPropsFields } from "./PageBuilder";

const BLOCK_ICONS = {
  hero: LayoutTemplate, texto: Type, imagem: ImageIcon, galeria: Images, carrossel: GalleryHorizontal, produtos: ShoppingBag,
  banner: Megaphone, video: VideoIcon, testemunhos: Quote, faq: HelpCircle, newsletter: Mail,
  colunas: Columns, espacador: Minus,
};

export const PopupBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { popups, setPopups, pages, products } = useAdmin();
  const popup = popups.find((p) => p.id === id);

  const [name, setName] = useState(popup?.name || "");
  const [width, setWidth] = useState(popup?.width || 480);
  const [status, setStatus] = useState(popup?.status || "inativo");
  const [blocks, setBlocks] = useState(popup ? popup.blocks.map((b) => ({ ...b, props: { ...b.props } })) : []);
  const [trigger, setTrigger] = useState(popup?.trigger || { type: "time", seconds: 8, percent: 50 });
  const [placement, setPlacement] = useState(popup?.placement || { type: "all", value: "" });
  const [frequency, setFrequency] = useState(popup?.frequency || "session");
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => blocks.find((b) => b.id === selectedId), [blocks, selectedId]);

  const pageOptions = useMemo(() => {
    const custom = pages.filter((p) => p.status === "publicado").map((p) => ({ value: `/${p.slug}`, label: p.title }));
    return [...PLACEMENT_PAGE_OPTIONS, ...custom];
  }, [pages]);

  if (!popup) return <Navigate to="/admin/popups" replace />;

  const addBlock = (type) => {
    const nb = makeBlock(type);
    setBlocks((prev) => [...prev, nb]);
    setSelectedId(nb.id);
  };
  const removeBlock = (bid) => {
    setBlocks((prev) => prev.filter((b) => b.id !== bid));
    if (selectedId === bid) setSelectedId(null);
  };
  const duplicateBlock = (bid) => {
    const i = blocks.findIndex((b) => b.id === bid);
    if (i < 0) return;
    const clone = { ...makeBlock(blocks[i].type), props: { ...blocks[i].props } };
    const next = [...blocks];
    next.splice(i + 1, 0, clone);
    setBlocks(next);
    setSelectedId(clone.id);
  };
  const moveBlock = (bid, dir) => {
    const i = blocks.findIndex((b) => b.id === bid);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };
  const updateProp = (key, value) =>
    setBlocks((prev) => prev.map((b) => (b.id === selectedId ? { ...b, props: { ...b.props, [key]: value } } : b)));

  const save = () => {
    if (!name.trim()) { toast.error("Indica o nome do pop-up."); return; }
    setPopups((prev) => prev.map((p) => (p.id === popup.id ? { ...p, name: name.trim(), width: parseInt(width, 10) || 320, status, blocks, trigger, placement, frequency } : p)));
    toast.success("Pop-up guardado.");
  };

  return (
    <div data-testid="admin-popup-builder">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/admin/popups" className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center" aria-label="Voltar"><ChevronLeft size={16} /></Link>
        <PageHeader title="Editar pop-up" subtitle="Conteúdo em blocos, regras de acionamento e segmentação." />
      </div>

      {/* dados gerais + regras */}
      <div className="bg-white border hairline rounded-2xl p-5 mb-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormRow label="Nome">
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} data-testid="popup-name" />
        </FormRow>
        <FormRow label="Largura (px)">
          <input type="number" min="200" className={fieldClass} value={width} onChange={(e) => setWidth(e.target.value)} data-testid="popup-width" />
        </FormRow>
        <FormRow label="Estado">
          <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)} data-testid="popup-status">
            <option value="inativo">Inativo</option>
            <option value="ativo">Ativo</option>
          </select>
        </FormRow>
        <FormRow label="Frequência">
          <select className={fieldClass} value={frequency} onChange={(e) => setFrequency(e.target.value)} data-testid="popup-frequency">
            {FREQUENCY_TYPES.map((f) => (<option key={f.id} value={f.id}>{f.label}</option>))}
          </select>
        </FormRow>

        <FormRow label="Gatilho">
          <select className={fieldClass} value={trigger.type} onChange={(e) => setTrigger((t) => ({ ...t, type: e.target.value }))} data-testid="popup-trigger-type">
            {TRIGGER_TYPES.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
          </select>
        </FormRow>
        {trigger.type === "time" && (
          <FormRow label="Segundos na página">
            <input type="number" min="0" className={fieldClass} value={trigger.seconds} onChange={(e) => setTrigger((t) => ({ ...t, seconds: parseInt(e.target.value, 10) || 0 }))} data-testid="popup-trigger-seconds" />
          </FormRow>
        )}
        {trigger.type === "scroll" && (
          <FormRow label="Percentagem de scroll">
            <input type="number" min="0" max="100" className={fieldClass} value={trigger.percent} onChange={(e) => setTrigger((t) => ({ ...t, percent: parseInt(e.target.value, 10) || 0 }))} data-testid="popup-trigger-percent" />
          </FormRow>
        )}

        <FormRow label="Aparece em">
          <select className={fieldClass} value={placement.type} onChange={(e) => setPlacement({ type: e.target.value, value: "" })} data-testid="popup-placement-type">
            {PLACEMENT_TYPES.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
          </select>
        </FormRow>
        {placement.type === "page" && (
          <FormRow label="Página">
            <select className={fieldClass} value={placement.value} onChange={(e) => setPlacement((p) => ({ ...p, value: e.target.value }))} data-testid="popup-placement-value">
              <option value="">Selecionar…</option>
              {pageOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </FormRow>
        )}
        {placement.type === "category" && (
          <FormRow label="Categoria">
            <select className={fieldClass} value={placement.value} onChange={(e) => setPlacement((p) => ({ ...p, value: e.target.value }))} data-testid="popup-placement-value">
              <option value="">Selecionar…</option>
              {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
            </select>
          </FormRow>
        )}
      </div>

      {/* construtor de blocos */}
      <div className="flex gap-5 items-start">
        <aside className="w-[200px] shrink-0 bg-white border hairline rounded-2xl p-3" data-testid="popup-palette">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--da-muted)] px-1 mb-2">Blocos</p>
          <div className="space-y-2">
            {BLOCK_LIBRARY.filter((b) => b.type !== "colunas").map((b) => {
              const Icon = BLOCK_ICONS[b.type] || LayoutTemplate;
              return (
                <button
                  key={b.type}
                  onClick={() => addBlock(b.type)}
                  data-testid={`popup-palette-${b.type}`}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border hairline bg-white text-left font-body text-sm text-[var(--da-forest)] hover:border-[var(--da-leaf)] hover:bg-[var(--da-cream-2)]/40"
                >
                  <Icon size={15} className="text-[var(--da-leaf)] shrink-0" /> {b.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 bg-[var(--da-cream-2)]/40 rounded-2xl p-6 flex justify-center" data-testid="popup-canvas-wrap">
          <div className="bg-white shadow-sm rounded-xl overflow-hidden" style={{ width }} data-testid="popup-canvas">
            {blocks.length === 0 ? (
              <p className="text-center py-16 text-[var(--da-muted)] font-body text-sm">Adicione blocos a partir da paleta à esquerda.</p>
            ) : (
              blocks.map((b, i) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  data-testid={`popup-block-${b.id}`}
                  className={`relative group ${selectedId === b.id ? "ring-2 ring-[var(--da-leaf)]" : "ring-1 ring-transparent hover:ring-[var(--da-line)]"}`}
                >
                  <div className="absolute z-10 top-2 right-2 flex items-center gap-1 transition opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }} disabled={i === 0} className="w-7 h-7 rounded-md bg-white border hairline flex items-center justify-center shadow-sm disabled:opacity-30" aria-label="Mover para cima" data-testid={`popup-block-up-${b.id}`}><ChevronUp size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }} disabled={i === blocks.length - 1} className="w-7 h-7 rounded-md bg-white border hairline flex items-center justify-center shadow-sm disabled:opacity-30" aria-label="Mover para baixo" data-testid={`popup-block-down-${b.id}`}><ChevronDown size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id); }} className="w-7 h-7 rounded-md bg-white border hairline flex items-center justify-center shadow-sm" aria-label="Duplicar" data-testid={`popup-block-dup-${b.id}`}><Copy size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }} className="w-7 h-7 rounded-md bg-white border hairline text-red-700 flex items-center justify-center shadow-sm" aria-label="Remover" data-testid={`popup-block-remove-${b.id}`}><Trash2 size={13} /></button>
                  </div>
                  <BlockView block={b} products={products} />
                </div>
              ))
            )}
          </div>
        </main>

        <aside className="w-[300px] shrink-0 bg-white border hairline rounded-2xl p-4" data-testid="popup-properties">
          {!selected ? (
            <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8">Selecione um bloco para editar as propriedades.</p>
          ) : (
            <div className="space-y-4">
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[var(--da-leaf)]">{BLOCK_LABELS[selected.type]}</p>
              <BlockPropsFields block={selected} onChangeProp={updateProp} onSnapStart={() => {}} onSnapEnd={() => {}} />
            </div>
          )}
        </aside>
      </div>

      <div className="flex justify-end mt-5">
        <button onClick={save} data-testid="popup-save" className="btn-da btn-da-primary text-xs"><Save size={14} /> Guardar</button>
      </div>
    </div>
  );
};
