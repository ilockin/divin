import React from "react";
import { FormRow, fieldClass } from "../Bits";
import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from "../../data/contentStyleOptions";

const RADIUS_PRESETS = [
  { label: "Quadrado", value: 0 },
  { label: "Arredondado", value: 12 },
  { label: "Pílula", value: 999 },
];

// Input duplo cor (color picker) + hex em texto — mesmo padrão já usado no PageBuilder para blocos.
export const ColorField = ({ value, onChange, testid }) => (
  <div className="flex items-center gap-2 mt-2">
    <input type="color" value={value || "#ffffff"} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="w-10 h-9 rounded border hairline" />
    <input className={fieldClass + " mt-0"} value={value} placeholder="vazio = cor original" onChange={(e) => onChange(e.target.value)} data-testid={`${testid}-hex`} />
  </div>
);

export const RadiusField = ({ value, onChange, testid }) => (
  <div>
    <div className="flex gap-2 mt-2">
      {RADIUS_PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => onChange(p.value)}
          data-testid={`${testid}-preset-${p.value}`}
          className={`text-xs font-body px-3 py-1.5 rounded-full border hairline ${value === p.value ? "bg-[var(--da-leaf)] text-white border-transparent" : "hover:bg-[var(--da-cream-2)]/60"}`}
        >
          {p.label}
        </button>
      ))}
    </div>
    <input type="number" min="0" max="999" className={fieldClass} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} data-testid={testid} />
  </div>
);

// Bloco "Estilo do título" (fonte/tamanho/cor) — usado em qualquer secção que tenha um título principal.
export const TitleStyleFields = ({ content, sectionKey, updateField, testidPrefix = "title" }) => (
  <div className="border-t hairline pt-4 space-y-4">
    <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">Estilo do título</p>
    <FormRow label="Fonte">
      <select className={fieldClass} value={content.titleFont} onChange={(e) => updateField(sectionKey, "titleFont", e.target.value)} data-testid={`${testidPrefix}-font`}>
        {FONT_OPTIONS.map((f) => (<option key={f.id} value={f.id}>{f.label}</option>))}
      </select>
    </FormRow>
    <FormRow label="Tamanho">
      <select className={fieldClass} value={content.titleSize} onChange={(e) => updateField(sectionKey, "titleSize", e.target.value)} data-testid={`${testidPrefix}-size`}>
        {FONT_SIZE_OPTIONS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
      </select>
    </FormRow>
    <FormRow label="Cor do título">
      <ColorField value={content.titleColor} onChange={(v) => updateField(sectionKey, "titleColor", v)} testid={`${testidPrefix}-color`} />
    </FormRow>
  </div>
);

// Bloco de botão (texto/link/cor de fundo/raio) — um por {prefix} de SECTION_BUTTONS.
export const ButtonFields = ({ content, sectionKey, prefix, label, updateField, testidPrefix = "btn" }) => (
  <div className="border-t hairline pt-4 space-y-4">
    <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">{label}</p>
    <FormRow label="Texto">
      <input className={fieldClass} value={content[`${prefix}Text`]} onChange={(e) => updateField(sectionKey, `${prefix}Text`, e.target.value)} data-testid={`${testidPrefix}-${prefix}-text`} />
    </FormRow>
    <FormRow label="Link">
      <input className={fieldClass} value={content[`${prefix}Link`]} onChange={(e) => updateField(sectionKey, `${prefix}Link`, e.target.value)} data-testid={`${testidPrefix}-${prefix}-link`} />
    </FormRow>
    <FormRow label="Cor de fundo" hint="Vazio mantém a cor e o efeito hover originais.">
      <ColorField value={content[`${prefix}Bg`]} onChange={(v) => updateField(sectionKey, `${prefix}Bg`, v)} testid={`${testidPrefix}-${prefix}-bg`} />
    </FormRow>
    <FormRow label="Raio da borda (px)">
      <RadiusField value={content[`${prefix}Radius`]} onChange={(v) => updateField(sectionKey, `${prefix}Radius`, v)} testid={`${testidPrefix}-${prefix}-radius`} />
    </FormRow>
  </div>
);

// Bloco de link de texto (texto/href) — um por secção em SECTION_LINKS.
export const LinkFields = ({ content, sectionKey, prefix, label, updateField, testidPrefix = "link" }) => (
  <div className="border-t hairline pt-4 space-y-4">
    <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">{label}</p>
    <FormRow label="Texto">
      <input className={fieldClass} value={content[`${prefix}Text`]} onChange={(e) => updateField(sectionKey, `${prefix}Text`, e.target.value)} data-testid={`${testidPrefix}-text`} />
    </FormRow>
    <FormRow label="Link">
      <input className={fieldClass} value={content[`${prefix}Href`]} onChange={(e) => updateField(sectionKey, `${prefix}Href`, e.target.value)} data-testid={`${testidPrefix}-href`} />
    </FormRow>
  </div>
);
