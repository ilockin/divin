const STORAGE_ROLE = "divinarte-admin-role-v1";

// Mesmo valor por defeito do AdminContext (super_admin quando ainda não há nada guardado).
// Lido uma vez (como os outros loaders desta fase) — não é reativo a uma mudança de papel
// feita noutra aba/separador.
export const isSuperAdmin = () => (localStorage.getItem(STORAGE_ROLE) || "super_admin") === "super_admin";
