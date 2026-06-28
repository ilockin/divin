const STORAGE_ROLE = "divinarte-admin-role-v1";

// Mesmo valor por defeito do AdminContext (super_admin quando ainda não há nada guardado).
// Lido uma vez (como os outros loaders desta fase) — não é reativo a uma mudança de papel
// feita noutra aba/separador.
const currentRole = () => localStorage.getItem(STORAGE_ROLE) || "super_admin";

export const isSuperAdmin = () => currentRole() === "super_admin";

// admin e super_admin podem editar conteúdo (artigos do blog, etc.) — mesma regra de
// NAV_PERMISSIONS.blog no admin.
export const canEditContent = () => ["admin", "super_admin"].includes(currentRole());
