import React from "react";

export const KpiCard = ({ label, value, delta, deltaTone = "positive", icon: Icon, testid }) => {
  const toneClass = deltaTone === "positive" ? "text-[var(--da-leaf)]" : deltaTone === "negative" ? "text-red-600" : "text-[var(--da-muted)]";
  return (
    <div className="bg-white border hairline rounded-2xl p-5" data-testid={testid}>
      <div className="flex items-center justify-between">
        <p className="font-body text-[11px] tracking-[0.2em] uppercase text-[var(--da-muted)]">{label}</p>
        {Icon && <Icon size={18} className="text-[var(--da-leaf)]" />}
      </div>
      <p className="font-serif-display text-3xl text-[var(--da-forest)] mt-3 tracking-[0.04em]" data-testid={`${testid}-value`}>{value}</p>
      {delta && <p className={`font-body text-xs mt-1 ${toneClass}`}>{delta}</p>}
    </div>
  );
};

export const SectionTitle = ({ eyebrow, title, action }) => (
  <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
    <div>
      {eyebrow && <p className="font-body text-[10px] tracking-[0.22em] uppercase text-[var(--da-leaf)]">{eyebrow}</p>}
      <h2 className="text-xl sm:text-2xl text-[var(--da-forest)] font-serif-display tracking-[0.06em]">{title}</h2>
    </div>
    {action}
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-end justify-between gap-4 flex-wrap mb-8" data-testid="page-header">
    <div>
      <h1 className="text-2xl sm:text-3xl text-[var(--da-forest)] font-serif-display tracking-[0.05em]">{title}</h1>
      {subtitle && <p className="font-body text-sm text-[var(--da-muted)] mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const FormRow = ({ label, hint, required, children, testid }) => (
  <label className="block" data-testid={testid}>
    <span className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)]">{label}{required && " *"}</span>
    {children}
    {hint && <span className="block font-body text-[11px] text-[var(--da-muted)] mt-1.5">{hint}</span>}
  </label>
);

export const fieldClass = "mt-2 w-full bg-white border hairline rounded-lg px-3.5 py-2.5 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]";
