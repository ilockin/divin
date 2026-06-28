// Leads do formulário de contacto — guardados em localStorage (ver lib/leads.js).
// Não é um CRM real multi-dispositivo: só aparece neste navegador.

export const LEAD_STATUSES = [
  { id: "novo", label: "Novo", tone: "amber" },
  { id: "lido", label: "Lido", tone: "blue" },
  { id: "respondido", label: "Respondido", tone: "green" },
];

const CONTACT_FIELDS_SNAPSHOT = [
  { id: "name", label: "Nome" },
  { id: "email", label: "E-mail" },
  { id: "subject", label: "Assunto" },
  { id: "message", label: "Mensagem" },
];

export const initialLeads = [
  {
    id: "lead-1001",
    submittedAt: "2025-11-02T09:15:00",
    status: "lido",
    note: "Respondida por e-mail a explicar prazos de entrega.",
    fieldsSnapshot: CONTACT_FIELDS_SNAPSHOT,
    values: { name: "Beatriz Santos", email: "beatriz.santos@example.pt", subject: "Prazo de entrega", message: "Olá, gostaria de saber o prazo de entrega para o Porto." },
  },
  {
    id: "lead-1002",
    submittedAt: "2025-11-03T17:40:00",
    status: "novo",
    note: "",
    fieldsSnapshot: CONTACT_FIELDS_SNAPSHOT,
    values: { name: "Hugo Martins", email: "hugo.martins@example.pt", subject: "", message: "Os produtos são adequados para pele sensível? Recomendam algum em particular?" },
  },
];
