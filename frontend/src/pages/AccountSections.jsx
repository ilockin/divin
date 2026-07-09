import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { loadAddresses, addAddress, removeAddress, setDefaultAddress } from "../lib/addresses";

export const Orders = () => (
  <div data-testid="orders-page">
    <h2 className="text-2xl mb-6">Os meus pedidos</h2>
    <p className="font-body text-sm text-[var(--da-muted)]">
      Ainda não tens encomendas. As tuas compras vão aparecer aqui assim que finalizares o checkout.
    </p>
  </div>
);

export const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ name: profile.name || "", phone: profile.phone || "" });
  }, [profile]);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: form.name, phone: form.phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao guardar", { description: error.message });
      return;
    }
    await refreshProfile();
    toast.success("Dados atualizados");
  };

  return (
    <div data-testid="profile-page">
      <h2 className="text-2xl mb-6">Os meus dados</h2>
      <form onSubmit={save} className="space-y-4 max-w-lg">
        <Field label="Nome completo" value={form.name} onChange={(v) => u("name", v)} testid="prof-name" />
        <Field label="E-mail" type="email" value={user?.email || ""} onChange={() => {}} testid="prof-email" disabled />
        <Field label="Telemóvel" value={form.phone} onChange={(v) => u("phone", v)} testid="prof-phone" />
        <button type="submit" disabled={saving} className="btn-da btn-da-primary mt-2 disabled:opacity-60" data-testid="prof-save">
          {saving ? "A guardar…" : "Guardar alterações"}
        </button>
      </form>
    </div>
  );
};

const EMPTY_FORM = { label: "", line1: "", city: "", zip: "", country: "Portugal" };

export const Addresses = () => {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    if (!user) return;
    try {
      const data = await loadAddresses(user.id);
      setList(data);
    } catch (err) {
      toast.error("Erro ao carregar moradas", { description: err.message });
    }
  };

  useEffect(() => { refresh(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const uf = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addAddress(user.id, form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await refresh();
      toast.success("Morada adicionada");
    } catch (err) {
      toast.error("Erro ao guardar morada", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeAddress(id);
      await refresh();
      toast.success("Morada removida");
    } catch (err) {
      toast.error("Erro ao remover", { description: err.message });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(user.id, id);
      await refresh();
    } catch (err) {
      toast.error("Erro", { description: err.message });
    }
  };

  return (
    <div data-testid="addresses-page">
      <h2 className="text-2xl mb-6">Moradas</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((a) => (
          <div key={a.id} className="border hairline rounded-xl p-5 bg-[var(--da-cream-2)]/40" data-testid={`addr-${a.id}`}>
            <div className="flex items-center justify-between">
              <p className="font-serif-display tracking-[0.1em] text-[var(--da-forest)]">{a.label}</p>
              {a.is_default && (
                <span className="text-[10px] tracking-[0.18em] uppercase bg-[var(--da-leaf)] text-white px-2 py-0.5 rounded-full">
                  Predefinida
                </span>
              )}
            </div>
            <p className="font-body text-sm mt-3">{a.line1}</p>
            <p className="font-body text-sm">{a.zip} {a.city}</p>
            <p className="font-body text-sm text-[var(--da-muted)]">{a.country}</p>
            <div className="flex gap-2 mt-4">
              {!a.is_default && (
                <button
                  className="btn-da btn-da-ghost text-[11px]"
                  onClick={() => handleSetDefault(a.id)}
                >
                  Tornar predefinida
                </button>
              )}
              <button
                className="btn-da btn-da-ghost text-[11px] text-red-700"
                onClick={() => handleRemove(a.id)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="border-2 border-dashed hairline rounded-xl p-5 font-body text-sm text-[var(--da-muted)] hover:text-[var(--da-forest)] hover:border-[var(--da-forest)] transition"
            data-testid="add-address"
          >
            + Adicionar morada
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-6 space-y-3 max-w-lg border hairline rounded-xl p-5" data-testid="address-form">
          <h3 className="text-base font-semibold text-[var(--da-forest)] mb-2">Nova morada</h3>
          <Field label="Etiqueta (ex: Casa, Trabalho)" value={form.label} onChange={(v) => uf("label", v)} testid="addr-label" />
          <Field label="Morada" value={form.line1} onChange={(v) => uf("line1", v)} testid="addr-line1" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código postal" value={form.zip} onChange={(v) => uf("zip", v)} testid="addr-zip" />
            <Field label="Cidade" value={form.city} onChange={(v) => uf("city", v)} testid="addr-city" />
          </div>
          <Field label="País" value={form.country} onChange={(v) => uf("country", v)} testid="addr-country" />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-da btn-da-primary disabled:opacity-60" data-testid="addr-save">
              {saving ? "A guardar…" : "Guardar"}
            </button>
            <button type="button" className="btn-da btn-da-ghost" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", testid, disabled = false }) => (
  <label className="block">
    <span className="font-body text-xs uppercase tracking-[0.18em] text-[var(--da-forest)]">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      disabled={disabled}
      className="mt-2 w-full bg-white border hairline rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[var(--da-leaf)] disabled:bg-[var(--da-cream-2)] disabled:text-[var(--da-muted)] disabled:cursor-not-allowed"
    />
  </label>
);
