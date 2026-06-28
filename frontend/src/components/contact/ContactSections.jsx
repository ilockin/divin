import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  titleClassFor as titleClass, titleStyleFor as titleStyle,
  eyebrowClassFor as eyebrowClass, eyebrowStyleFor as eyebrowStyle,
  bodyClassFor as bodyClass, bodyStyleFor as bodyStyle,
  textClassFor, textStyleFor,
} from "../../lib/contentStyle";
import { TEXT_SIZE_OPTIONS } from "../../admin/data/contentStyleOptions";

const itemTitleClass = (c) => textClassFor(c, "itemTitle", TEXT_SIZE_OPTIONS);
const itemTitleStyle = (c) => textStyleFor(c, "itemTitle");
const itemTextClass = (c) => textClassFor(c, "itemText", TEXT_SIZE_OPTIONS);
const itemTextStyle = (c) => textStyleFor(c, "itemText");

const INFO_ICONS = [Mail, Phone, MapPin];

export const HeaderSection = ({ content }) => (
  <div data-testid="contact-header">
    <p className={eyebrowClass(content)} style={eyebrowStyle(content)}>{content.eyebrow}</p>
    <h1 className={`${titleClass(content)} mt-1`} style={titleStyle(content)}>{content.title}</h1>
    <p className={`${bodyClass(content)} mt-4 max-w-2xl`} style={bodyStyle(content)}>{content.subtitle}</p>
  </div>
);

export const InfoSection = ({ content }) => (
  <aside className="space-y-5" data-testid="contact-info">
    {content.cards.map((card, i) => {
      const Icon = INFO_ICONS[i] || Mail;
      return (
        <div key={i} className="bg-white rounded-2xl border hairline p-5 flex gap-4">
          <Icon className="text-[var(--da-leaf)] shrink-0" size={20} />
          <div>
            <p className={`${itemTitleClass(content)} tracking-[0.1em]`} style={itemTitleStyle(content)}>{card.title}</p>
            {card.lines.map((l, j) => <p key={j} className={itemTextClass(content)} style={itemTextStyle(content)}>{l}</p>)}
          </div>
        </div>
      );
    })}
  </aside>
);

// Formulário gerado a partir de content.fields. `interactive=false` (usado no editor) impede a
// submissão real — mostra só um aviso de pré-visualização, sem gravar lead nem limpar o estado.
export const FormSection = ({ content, values, onChange, onSubmit, interactive = true }) => (
  <form onSubmit={onSubmit} className="bg-white rounded-2xl border hairline p-6 sm:p-8 space-y-4" data-testid="contact-form">
    {content.fields.map((f) => (
      <label key={f.id} className="block">
        <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">{f.label}{f.required && " *"}</span>
        {f.type === "textarea" ? (
          <textarea
            required={f.required}
            rows={6}
            value={values[f.id] || ""}
            onChange={(e) => onChange(f.id, e.target.value)}
            disabled={!interactive}
            data-testid={`contact-field-${f.id}`}
            className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)] disabled:bg-[var(--da-cream-2)]/40"
          />
        ) : (
          <input
            type={f.type}
            required={f.required}
            value={values[f.id] || ""}
            onChange={(e) => onChange(f.id, e.target.value)}
            disabled={!interactive}
            data-testid={`contact-field-${f.id}`}
            className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)] disabled:bg-[var(--da-cream-2)]/40"
          />
        )}
      </label>
    ))}
    <button type="submit" className="btn-da btn-da-primary" data-testid="contact-submit">{content.submitText}</button>
  </form>
);
