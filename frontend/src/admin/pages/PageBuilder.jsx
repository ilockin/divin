import React, { useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter, useDraggable, useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LayoutTemplate, Type, Image as ImageIcon, Images, ShoppingBag, Megaphone, Video as VideoIcon,
  Quote, HelpCircle, Mail, Columns, Minus, GripVertical, Trash2, Copy, Plus,
  Monitor, Tablet, Smartphone, Eye, Save, Send, Undo2, Redo2, ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../context/AdminContext";
import { BLOCK_LIBRARY, BLOCK_LABELS, BLOCK_FIELDS, BLOCK_LISTS, makeBlock } from "../data/mockPages";
import { FormRow, fieldClass } from "../components/Bits";
import { BlockView } from "../../components/blocks/BlockRenderer";

const BLOCK_ICONS = {
  hero: LayoutTemplate, texto: Type, imagem: ImageIcon, galeria: Images, produtos: ShoppingBag,
  banner: Megaphone, video: VideoIcon, testemunhos: Quote, faq: HelpCircle, newsletter: Mail,
  colunas: Columns, espacador: Minus,
};

// ---------- Item da paleta (arrastável) ----------
const PaletteItem = ({ type, label, onAdd }) => {
  const Icon = BLOCK_ICONS[type] || LayoutTemplate;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette:${type}`, data: { fromPalette: true, type } });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAdd(type)}
      data-testid={`palette-${type}`}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border hairline bg-white text-left font-body text-sm text-[var(--da-forest)] hover:border-[var(--da-leaf)] hover:bg-[var(--da-cream-2)]/40 cursor-grab ${isDragging ? "opacity-40" : ""}`}
      title="Arrastar para a tela ou clicar para adicionar"
    >
      <Icon size={15} className="text-[var(--da-leaf)] shrink-0" /> {label}
    </button>
  );
};

// ---------- Bloco na tela (ordenável) ----------
const SortableBlock = ({ block, products, selected, onSelect, onRemove, onDuplicate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(block.id)}
      data-testid={`canvas-block-${block.id}`}
      className={`relative group ${isDragging ? "opacity-50" : ""} ${selected ? "ring-2 ring-[var(--da-leaf)]" : "ring-1 ring-transparent hover:ring-[var(--da-line)]"}`}
    >
      {/* barra de ações do bloco */}
      <div className={`absolute z-10 top-2 right-2 flex items-center gap-1 transition ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <button {...attributes} {...listeners} data-testid={`block-drag-${block.id}`} className="w-7 h-7 rounded-md bg-white border hairline flex items-center justify-center cursor-grab shadow-sm" aria-label="Arrastar"><GripVertical size={13} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }} data-testid={`block-dup-${block.id}`} className="w-7 h-7 rounded-md bg-white border hairline flex items-center justify-center shadow-sm" aria-label="Duplicar"><Copy size={13} /></button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(block.id); }} data-testid={`block-remove-${block.id}`} className="w-7 h-7 rounded-md bg-white border hairline text-red-700 flex items-center justify-center shadow-sm" aria-label="Remover"><Trash2 size={13} /></button>
      </div>
      <span className="absolute z-10 top-2 left-2 text-[10px] uppercase tracking-[0.16em] font-body bg-[var(--da-forest)] text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition">{BLOCK_LABELS[block.type]}</span>
      <BlockView block={block} products={products} />
    </div>
  );
};

const DEVICE = { desktop: "100%", tablet: "768px", telemovel: "390px" };

export const PageBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pages, setPages, products } = useAdmin();
  const page = pages.find((p) => p.id === id);

  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [blocks, setBlocks] = useState(page ? page.blocks.map((b) => ({ ...b, props: { ...b.props } })) : []);
  const [selectedId, setSelectedId] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [preview, setPreview] = useState(false);
  const editSnapRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { setNodeRef: setCanvasRef, isOver } = useDroppable({ id: "canvas" });

  const selected = useMemo(() => blocks.find((b) => b.id === selectedId), [blocks, selectedId]);

  if (!page) return <Navigate to="/admin/paginas" replace />;

  // histórico
  const commit = (next) => { setUndoStack((u) => [...u, blocks]); setRedoStack([]); setBlocks(next); };
  const undo = () => {
    if (undoStack.length === 0) return;
    setRedoStack((r) => [blocks, ...r]);
    setBlocks(undoStack[undoStack.length - 1]);
    setUndoStack((u) => u.slice(0, -1));
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setUndoStack((u) => [...u, blocks]);
    setBlocks(redoStack[0]);
    setRedoStack((r) => r.slice(1));
  };

  // edições de propriedades (live) com snapshot por sessão de edição
  const snapStart = () => { editSnapRef.current = JSON.stringify(blocks); };
  const snapEnd = () => {
    if (editSnapRef.current && editSnapRef.current !== JSON.stringify(blocks)) {
      const before = JSON.parse(editSnapRef.current);
      setUndoStack((u) => [...u, before]);
      setRedoStack([]);
    }
    editSnapRef.current = null;
  };
  const updateProp = (key, value) =>
    setBlocks((prev) => prev.map((b) => b.id === selectedId ? { ...b, props: { ...b.props, [key]: value } } : b));

  // listas dentro de um bloco
  const listCfg = selected ? BLOCK_LISTS[selected.type] : null;
  const listItems = listCfg ? (selected.props[listCfg.prop] || []) : [];
  const setList = (items) => updateProp(listCfg.prop, items);
  const addListItem = () => { snapStart(); setList([...listItems, listCfg.newItem()]); setTimeout(snapEnd, 0); };
  const removeListItem = (i) => { snapStart(); setList(listItems.filter((_, idx) => idx !== i)); setTimeout(snapEnd, 0); };
  const updateListItem = (i, key, value) => setList(listItems.map((it, idx) => idx === i ? { ...it, [key]: value } : it));

  // ações estruturais
  const addBlock = (type, index = blocks.length) => {
    const nb = makeBlock(type);
    const next = [...blocks];
    next.splice(index, 0, nb);
    commit(next);
    setSelectedId(nb.id);
  };
  const removeBlock = (bid) => { commit(blocks.filter((b) => b.id !== bid)); if (selectedId === bid) setSelectedId(null); };
  const duplicateBlock = (bid) => {
    const i = blocks.findIndex((b) => b.id === bid);
    if (i < 0) return;
    const clone = { ...makeBlock(blocks[i].type), props: { ...blocks[i].props } };
    const next = [...blocks]; next.splice(i + 1, 0, clone);
    commit(next); setSelectedId(clone.id);
  };

  const onDragStart = (e) => {
    const t = e.active.data.current?.fromPalette ? e.active.data.current.type : blocks.find((b) => b.id === e.active.id)?.type;
    setActiveDrag(t ? BLOCK_LABELS[t] : null);
  };
  const onDragEnd = (e) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    if (active.data.current?.fromPalette) {
      const type = active.data.current.type;
      let index = blocks.length;
      if (over.id !== "canvas") {
        const oi = blocks.findIndex((b) => b.id === over.id);
        if (oi >= 0) index = oi;
      }
      addBlock(type, index);
      return;
    }
    if (over.id !== active.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) commit(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  // persistência
  const persist = (extra = {}) => {
    setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, title, slug, blocks, date: new Date().toISOString().slice(0, 10), ...extra } : p));
  };
  const onSave = () => { persist(); toast.success("Página guardada."); };
  const onPublish = () => { persist({ status: "publicado" }); toast.success("Página publicada."); };

  return (
    <div data-testid="admin-page-builder" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      {/* barra superior */}
      <div className="bg-white border-b hairline px-4 py-3 flex items-center gap-3 flex-wrap">
        <Link to="/admin/paginas" className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center" aria-label="Voltar"><ChevronLeft size={16} /></Link>
        <input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="pb-title" className="font-serif-display text-lg text-[var(--da-forest)] bg-transparent border-b border-transparent hover:border-[var(--da-line)] focus:border-[var(--da-leaf)] focus:outline-none px-1" />
        <div className="flex items-center gap-1 text-[var(--da-muted)] font-body text-sm">
          <span>/</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} data-testid="pb-slug" className="bg-transparent border-b border-transparent hover:border-[var(--da-line)] focus:border-[var(--da-leaf)] focus:outline-none px-1 w-32" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* desfazer/refazer */}
          <button onClick={undo} disabled={undoStack.length === 0} data-testid="pb-undo" className="w-8 h-8 rounded-md border hairline flex items-center justify-center disabled:opacity-30" aria-label="Desfazer"><Undo2 size={15} /></button>
          <button onClick={redo} disabled={redoStack.length === 0} data-testid="pb-redo" className="w-8 h-8 rounded-md border hairline flex items-center justify-center disabled:opacity-30" aria-label="Refazer"><Redo2 size={15} /></button>

          {/* dispositivos */}
          <div className="flex items-center rounded-md border hairline overflow-hidden">
            {[{ id: "desktop", Icon: Monitor }, { id: "tablet", Icon: Tablet }, { id: "telemovel", Icon: Smartphone }].map(({ id: d, Icon }) => (
              <button key={d} onClick={() => setDevice(d)} data-testid={`pb-device-${d}`} className={`w-8 h-8 flex items-center justify-center ${device === d ? "bg-[var(--da-leaf)] text-white" : "text-[var(--da-forest)] hover:bg-[var(--da-cream-2)]/60"}`} aria-label={d}><Icon size={15} /></button>
            ))}
          </div>

          <button onClick={() => setPreview((v) => !v)} data-testid="pb-preview" className={`btn-da text-xs ${preview ? "btn-da-primary" : "btn-da-outline"}`}><Eye size={14} /> {preview ? "Editar" : "Pré-visualizar"}</button>
          <button onClick={onSave} data-testid="pb-save" className="btn-da btn-da-outline text-xs"><Save size={14} /> Guardar</button>
          <button onClick={onPublish} data-testid="pb-publish" className="btn-da btn-da-primary text-xs"><Send size={14} /> Publicar</button>
        </div>
      </div>

      {/* corpo */}
      {preview ? (
        <div className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40 p-6 flex justify-center" data-testid="pb-preview-area">
          <div className="bg-white shadow-sm transition-all" style={{ width: DEVICE[device], maxWidth: "100%" }}>
            {blocks.length === 0 ? (
              <p className="text-center py-20 text-[var(--da-muted)] font-body">Página vazia.</p>
            ) : blocks.map((b) => <BlockView key={b.id} block={b} products={products} />)}
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex-1 flex min-h-0">
            {/* paleta */}
            <aside className="w-[210px] shrink-0 border-r hairline bg-[var(--da-cream-2)]/30 overflow-y-auto p-3" data-testid="pb-palette">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--da-muted)] px-1 mb-2">Blocos</p>
              <div className="space-y-2">
                {BLOCK_LIBRARY.map((b) => <PaletteItem key={b.type} type={b.type} label={b.label} onAdd={(t) => addBlock(t)} />)}
              </div>
            </aside>

            {/* tela */}
            <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40 p-6" onClick={() => setSelectedId(null)}>
              <div
                ref={setCanvasRef}
                onClick={(e) => e.stopPropagation()}
                className={`mx-auto bg-white shadow-sm min-h-[400px] transition-all ${isOver ? "ring-2 ring-[var(--da-leaf)]" : ""}`}
                style={{ width: DEVICE[device], maxWidth: "100%" }}
                data-testid="pb-canvas"
              >
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-[var(--da-muted)] font-body">
                    <Plus size={28} className="mb-2 text-[var(--da-leaf)]" />
                    Arraste blocos para aqui (ou clique num bloco à esquerda).
                  </div>
                ) : (
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((b) => (
                      <SortableBlock key={b.id} block={b} products={products} selected={selectedId === b.id} onSelect={setSelectedId} onRemove={removeBlock} onDuplicate={duplicateBlock} />
                    ))}
                  </SortableContext>
                )}
              </div>
            </main>

            {/* propriedades */}
            <aside className="w-[300px] shrink-0 border-l hairline bg-white overflow-y-auto p-4" data-testid="pb-properties">
              {!selected ? (
                <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8">Selecione um bloco na tela para editar as propriedades.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-[var(--da-leaf)]">{BLOCK_LABELS[selected.type]}</p>
                    <button onClick={() => removeBlock(selected.id)} className="text-red-700 hover:bg-red-50 w-7 h-7 rounded-md flex items-center justify-center" aria-label="Remover bloco"><Trash2 size={14} /></button>
                  </div>

                  {(BLOCK_FIELDS[selected.type] || []).map((f) => (
                    <FormRow key={f.key} label={f.label}>
                      {f.type === "textarea" ? (
                        <textarea rows={3} className={fieldClass} value={selected.props[f.key] ?? ""} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateProp(f.key, e.target.value)} data-testid={`prop-${f.key}`} />
                      ) : f.type === "select" ? (
                        <select className={fieldClass} value={selected.props[f.key]} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateProp(f.key, e.target.value)} data-testid={`prop-${f.key}`}>
                          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : f.type === "color" ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input type="color" value={selected.props[f.key]} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateProp(f.key, e.target.value)} data-testid={`prop-${f.key}`} className="w-10 h-9 rounded border hairline" />
                          <input className={fieldClass + " mt-0"} value={selected.props[f.key]} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateProp(f.key, e.target.value)} />
                        </div>
                      ) : f.type === "number" ? (
                        <input type="number" className={fieldClass} value={selected.props[f.key]} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateProp(f.key, parseInt(e.target.value, 10) || 0)} data-testid={`prop-${f.key}`} />
                      ) : (
                        <input className={fieldClass} value={selected.props[f.key] ?? ""} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateProp(f.key, e.target.value)} data-testid={`prop-${f.key}`} />
                      )}
                    </FormRow>
                  ))}

                  {/* listas (galeria / testemunhos / faq) */}
                  {listCfg && (
                    <div className="border-t hairline pt-4">
                      <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">{listCfg.label}</p>
                      <div className="space-y-3">
                        {listItems.map((it, i) => (
                          <div key={i} className="border hairline rounded-lg p-3 space-y-2" data-testid={`list-item-${i}`}>
                            <div className="flex justify-end">
                              <button onClick={() => removeListItem(i)} className="text-[var(--da-muted)] hover:text-red-600" aria-label="Remover item" data-testid={`list-remove-${i}`}><Trash2 size={13} /></button>
                            </div>
                            {listCfg.fields.map((lf) => (
                              <FormRow key={lf.key} label={lf.label}>
                                {lf.type === "textarea" ? (
                                  <textarea rows={2} className={fieldClass} value={it[lf.key] ?? ""} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateListItem(i, lf.key, e.target.value)} />
                                ) : (
                                  <input className={fieldClass} value={it[lf.key] ?? ""} onFocus={snapStart} onBlur={snapEnd} onChange={(e) => updateListItem(i, lf.key, e.target.value)} />
                                )}
                              </FormRow>
                            ))}
                          </div>
                        ))}
                      </div>
                      <button onClick={addListItem} data-testid="list-add" className="mt-3 inline-flex items-center gap-1 text-xs font-body uppercase tracking-[0.18em] text-[var(--da-forest)] hover:text-[var(--da-leaf)]"><Plus size={13} /> Adicionar</button>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          <DragOverlay>
            {activeDrag ? <div className="px-3 py-2 rounded-lg bg-[var(--da-forest)] text-white font-body text-sm shadow-lg">{activeDrag}</div> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
