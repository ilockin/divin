import React, { useState } from "react";
import { toast } from "sonner";
import { demoUser } from "../data/mock";
import { formatEUR } from "../lib/format";

export const Orders = () => (
  <div data-testid="orders-page">
    <h2 className="text-2xl mb-6">Os meus pedidos</h2>
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm">
        <thead className="border-b hairline text-[11px] tracking-[0.18em] uppercase text-[var(--da-muted)]">
          <tr>
            <th className="text-left py-3">Nº</th>
            <th className="text-left py-3">Data</th>
            <th className="text-left py-3">Itens</th>
            <th className="text-left py-3">Total</th>
            <th className="text-left py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {demoUser.orders.map((o) => (
            <tr key={o.id} className="border-b hairline" data-testid={`order-row-${o.id}`}>
              <td className="py-4 font-semibold text-[var(--da-forest)]">{o.id}</td>
              <td className="py-4">{new Date(o.date).toLocaleDateString("pt-PT")}</td>
              <td className="py-4">{o.items}</td>
              <td className="py-4">{formatEUR(o.total)}</td>
              <td className="py-4">
                <span className={`text-[11px] tracking-[0.14em] uppercase px-3 py-1 rounded-full ${o.status === "Entregue" ? "bg-[var(--da-leaf)]/15 text-[var(--da-forest)]" : "bg-[var(--da-olive)]/30 text-[var(--da-forest)]"}`}>
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const Profile = () => {
  const [form, setForm] = useState({ name: demoUser.name, email: demoUser.email, phone: demoUser.phone });
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div data-testid="profile-page">
      <h2 className="text-2xl mb-6">Os meus dados</h2>
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Dados atualizados"); }} className="space-y-4 max-w-lg">
        <Field label="Nome completo" value={form.name} onChange={(v) => u("name", v)} testid="prof-name" />
        <Field label="E-mail" type="email" value={form.email} onChange={(v) => u("email", v)} testid="prof-email" />
        <Field label="Telemóvel" value={form.phone} onChange={(v) => u("phone", v)} testid="prof-phone" />
        <button className="btn-da btn-da-primary mt-2" data-testid="prof-save">Guardar alterações</button>
      </form>
    </div>
  );
};

export const Addresses = () => {
  const [list, setList] = useState(demoUser.addresses);
  return (
    <div data-testid="addresses-page">
      <h2 className="text-2xl mb-6">Moradas</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((a) => (
          <div key={a.id} className="border hairline rounded-xl p-5 bg-[var(--da-cream-2)]/40" data-testid={`addr-${a.id}`}>
            <div className="flex items-center justify-between">
              <p className="font-serif-display tracking-[0.1em] text-[var(--da-forest)]">{a.label}</p>
              {a.default && <span className="text-[10px] tracking-[0.18em] uppercase bg-[var(--da-leaf)] text-white px-2 py-0.5 rounded-full">Predefinida</span>}
            </div>
            <p className="font-body text-sm mt-3">{a.line1}</p>
            <p className="font-body text-sm">{a.zip} {a.city}</p>
            <p className="font-body text-sm text-[var(--da-muted)]">{a.country}</p>
            <div className="flex gap-2 mt-4">
              <button className="btn-da btn-da-ghost text-[11px]" onClick={() => toast("Editar morada — demonstração")}>Editar</button>
              <button className="btn-da btn-da-ghost text-[11px] text-red-700" onClick={() => setList(list.filter((x) => x.id !== a.id))}>Remover</button>
            </div>
          </div>
        ))}
        <button onClick={() => toast("Adicionar morada — demonstração")} className="border-2 border-dashed hairline rounded-xl p-5 font-body text-sm text-[var(--da-muted)] hover:text-[var(--da-forest)] hover:border-[var(--da-forest)] transition" data-testid="add-address">
          + Adicionar morada
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", testid }) => (
  <label className="block">
    <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">{label}</span>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]" />
  </label>
);
