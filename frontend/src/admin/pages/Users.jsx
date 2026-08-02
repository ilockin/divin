import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { PageHeader, FormRow, fieldClass } from "../components/Bits";
import { useAdmin } from "../context/AdminContext";
import { USER_ROLE_OPTIONS, ROLES } from "../data/mockAdmin";
import { listUsers, createUser, updateUser, deleteUser, setUserPassword } from "../../lib/adminUsers";

const emptyForm = { id: null, name: "", email: "", password: "", role: "cliente", active: true };

export const Users = () => {
  const { role: currentRole } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const canManage = currentRole === "super_admin" || currentRole === "admin";
  const canResetPassword = currentRole === "super_admin";

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await listUsers()); }
    catch (e) { toast.error("Erro ao carregar utilizadores", { description: e.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => users
    .filter((u) => (roleFilter ? u.role === roleFilter : true))
    .filter((u) => (statusFilter ? (statusFilter === "ativo" ? u.active : !u.active) : true)),
    [users, roleFilter, statusFilter]);

  const openCreate = () => { setForm(emptyForm); setModal(true); };
  const openEdit = (u) => { setForm({ ...u, password: "" }); setModal(true); };

  const save = async () => {
    if (!form.name || !form.email) { toast.error("Preenche nome e e-mail."); return; }
    if (!form.id && (!form.password || form.password.length < 6)) { toast.error("Define uma palavra-passe (mín. 6 caracteres)."); return; }
    setSaving(true);
    try {
      if (form.id) {
        await updateUser(form.id, { name: form.name, role: form.role, active: form.active });
        toast.success("Utilizador atualizado.");
      } else {
        await createUser({ email: form.email, password: form.password, name: form.name, role: form.role });
        toast.success("Utilizador criado.");
      }
      setModal(false);
      await load();
    } catch (e) { toast.error("Erro ao guardar", { description: e.message }); }
    finally { setSaving(false); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Remover ${u.name || u.email}?`)) return;
    try { await deleteUser(u.id); setUsers((prev) => prev.filter((x) => x.id !== u.id)); toast.success("Utilizador removido."); }
    catch (e) { toast.error("Erro ao remover", { description: e.message }); }
  };

  const resetPassword = async (u) => {
    if (!canResetPassword) { toast.error("Apenas Super Admin pode definir palavras-passe."); return; }
    const pw = window.prompt(`Nova palavra-passe para ${u.name || u.email}:`);
    if (!pw) return;
    try { await setUserPassword(u.id, pw); toast.success("Palavra-passe definida."); }
    catch (e) { toast.error("Erro ao definir palavra-passe", { description: e.message }); }
  };

  const columns = [
    { key: "name", label: "Nome", sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--da-leaf)] text-white flex items-center justify-center text-xs font-semibold">
            {(u.name || u.email || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <span className="font-semibold text-[var(--da-forest)]">{u.name || "—"}</span>
        </div>
      ) },
    { key: "email", label: "E-mail", sortable: true,
      render: (u) => <span className="text-[var(--da-muted)]">{u.email}</span> },
    { key: "role", label: "Papel",
      render: (u) => { const r = ROLES.find((x) => x.id === u.role); return <StatusBadge tone={r ? "green" : "muted"}>{r?.label || u.role}</StatusBadge>; } },
    { key: "active", label: "Estado",
      render: (u) => <StatusBadge tone={u.active ? "green" : "red"}>{u.active ? "Ativo" : "Inativo"}</StatusBadge> },
    { key: "createdAt", label: "Registado em", sortable: true,
      render: (u) => <span className="text-[var(--da-muted)]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-PT") : "—"}</span> },
  ];

  return (
    <div data-testid="admin-users">
      <PageHeader
        title="Utilizadores"
        subtitle="Gere as pessoas com acesso ao back-office e à loja."
        actions={canManage && (
          <button onClick={openCreate} data-testid="user-new" className="btn-da btn-da-primary text-xs">
            <Plus size={14} /> Novo utilizador
          </button>
        )}
      />

      <DataTable
        testid="users-table"
        data={filtered}
        columns={columns}
        getRowId={(u) => u.id}
        searchKeys={["name", "email"]}
        emptyMessage={loading ? "A carregar…" : "Sem utilizadores."}
        filters={(
          <>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} data-testid="users-filter-role" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Todos os papéis</option>
              {USER_ROLE_OPTIONS.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-testid="users-filter-status" className="border hairline rounded-lg px-3 py-2 font-body text-sm bg-white">
              <option value="">Todos os estados</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </>
        )}
        rowActions={canManage ? (u) => {
          const actions = [{ label: "Editar", onClick: () => openEdit(u) }];
          if (canResetPassword) actions.push({ label: "Definir palavra-passe", onClick: () => resetPassword(u) });
          actions.push({ label: "Remover", onClick: () => remove(u), danger: true });
          return actions;
        } : undefined}
      />

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={form.id ? "Editar utilizador" : "Novo utilizador"}
        testid="user-modal"
        footer={(
          <>
            <button onClick={() => setModal(false)} className="btn-da btn-da-ghost text-xs">Cancelar</button>
            <button onClick={save} disabled={saving} data-testid="user-save" className="btn-da btn-da-primary text-xs disabled:opacity-60">{saving ? "A guardar…" : "Guardar"}</button>
          </>
        )}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <FormRow label="Nome" required testid="user-form-name">
            <input className={fieldClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} data-testid="user-input-name" />
          </FormRow>
          <FormRow label="E-mail" required testid="user-form-email">
            <input type="email" className={fieldClass} value={form.email} disabled={!!form.id} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} data-testid="user-input-email" />
          </FormRow>
          {!form.id && (
            <FormRow label="Palavra-passe" required hint="Mínimo 6 caracteres." testid="user-form-password">
              <input type="password" className={fieldClass} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} data-testid="user-input-password" />
            </FormRow>
          )}
          <FormRow label="Papel" required testid="user-form-role">
            <select className={fieldClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} data-testid="user-input-role">
              {USER_ROLE_OPTIONS.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
            </select>
          </FormRow>
          <FormRow label="Estado" testid="user-form-status">
            <select className={fieldClass} value={form.active ? "ativo" : "inativo"} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "ativo" }))} data-testid="user-input-active">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </FormRow>
        </div>

        {form.id && (
          <div className="mt-6 border-t hairline pt-5">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-[var(--da-forest)] mb-3">Acesso</p>
            <button
              onClick={() => resetPassword(form)}
              data-testid="user-reset-pw"
              disabled={!canResetPassword}
              className="inline-flex items-center gap-2 text-xs font-body px-4 py-2 border hairline rounded-full hover:bg-[var(--da-cream-2)]/60 disabled:opacity-50"
            >
              <KeyRound size={14} /> Definir palavra-passe
            </button>
            {!canResetPassword && (
              <p className="font-body text-[11px] text-[var(--da-muted)] mt-2 flex items-center gap-1.5">
                <ShieldAlert size={12} /> Acção restrita ao Super Admin.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
