import { initialLeads } from "../admin/data/mockLeads";

const LEADS_KEY = "divinarte-leads-v1";

export const loadLeads = () => {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    return raw ? JSON.parse(raw) : initialLeads;
  } catch {
    return initialLeads;
  }
};

export const saveLeads = (leads) => {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
};

// Chamado pelo formulário de contacto público (sem AdminContext) para guardar uma nova submissão.
// fieldsSnapshot guarda os rótulos dos campos no momento da submissão, para a lista no admin
// continuar legível mesmo que os campos do formulário sejam alterados depois.
export const addLead = (values, fieldsSnapshot) => {
  const leads = loadLeads();
  const lead = {
    id: "lead-" + Date.now(),
    submittedAt: new Date().toISOString(),
    status: "novo",
    note: "",
    fieldsSnapshot,
    values,
  };
  saveLeads([lead, ...leads]);
  return lead;
};
